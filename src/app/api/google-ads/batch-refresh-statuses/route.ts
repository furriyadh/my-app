// Batch Refresh Statuses API - Uses same pattern as ai-insights/route.ts
// Phase 1: Fetches account statuses from Supabase (fast)
// Phase 2: Calls Flask backend to get live status from Google Ads API
// Works in development (localhost) and production (Vercel/Railway)

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getBackendUrl } from '@/lib/config';

// Supabase Admin Client
const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
};

// Token refresh function (same as ai-insights)
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_ADS_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Token refresh failed: ${response.status}`, errorText);
            return null;
        }

        const data = await response.json();
        console.log('✅ Token refreshed successfully');
        return data.access_token;
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        return null;
    }
}

// Get connected accounts from Supabase (same pattern as ai-insights)
async function getConnectedAccounts(userId: string, userEmail?: string) {
    try {
        const supabase = getSupabaseAdmin();

        console.log(`🔍 Batch Refresh: Searching accounts for userId=${userId}, email=${userEmail}`);

        // Query client_requests table
        let { data: allData, error } = await supabase
            .from('client_requests')
            .select('customer_id, status, link_details, user_email, updated_at')
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Supabase query error:', error);
            return [];
        }

        // If no data with user_id, try email
        if ((!allData || allData.length === 0) && userEmail) {
            const result = await supabase
                .from('client_requests')
                .select('customer_id, status, link_details, user_email, updated_at')
                .eq('user_email', userEmail);

            if (!result.error) {
                allData = result.data;
            }
        }

        console.log(`📊 Total accounts in DB: ${allData?.length || 0}`);

        // Filter connected accounts and return with details
        const accounts = (allData || []).map(row => {
            const status = row.status?.toUpperCase() || '';
            const linkStatus = row.link_details?.link_status?.toUpperCase() || '';

            // Check if connected
            const isConnected = ['ACTIVE', 'LINKED', 'ENABLED'].includes(status) ||
                ['ACTIVE', 'LINKED', 'ENABLED'].includes(linkStatus);

            console.log(`🔍 Account ${row.customer_id}: status=${status}, isConnected=${isConnected}`);

            return {
                customerId: row.customer_id,
                status: status || 'NOT_LINKED',
                linkDetails: row.link_details || {},
                isConnected,
                lastUpdated: row.updated_at || row.link_details?.checked_at
            };
        });

        return accounts;
    } catch (error) {
        console.error('❌ Error in getConnectedAccounts:', error);
        return [];
    }
}

// Map status to button display
function mapStatusToDisplay(status: string) {
    const statusMap: Record<string, { text: string; color: string; variant: string }> = {
        'ACTIVE': { text: 'Connected', color: 'green', variant: 'solid' },
        'LINKED': { text: 'Connected', color: 'green', variant: 'solid' },
        'ENABLED': { text: 'Connected', color: 'green', variant: 'solid' },
        'PENDING': { text: 'Pending', color: 'yellow', variant: 'outline' },
        'SUSPENDED': { text: 'Suspended', color: 'gray', variant: 'outline' },
        'DISABLED': { text: 'Suspended', color: 'gray', variant: 'outline' },
        'REJECTED': { text: 'Rejected', color: 'red', variant: 'outline' },
        'CANCELLED': { text: 'Rejected', color: 'red', variant: 'outline' },
        'NOT_LINKED': { text: 'Link', color: 'green', variant: 'outline' },
    };

    return statusMap[status?.toUpperCase()] || statusMap['NOT_LINKED'];
}

// Fetch live status from Flask Backend (Phase 2) - Now using BATCH sync
async function fetchLiveStatusesFromFlask(customerIds: string[], accessToken: string, refreshToken: string): Promise<{ success: boolean; results?: Array<{ customer_id: string; status: string; is_ghost?: boolean }>; error?: string }> {
    try {
        const backendUrl = getBackendUrl();
        console.log(`🔄 Calling Flask backend for BATCH sync of ${customerIds.length} accounts...`);

        const response = await fetch(`${backendUrl}/api/sync-all-accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Google-Refresh-Token': refreshToken,
            },
            body: JSON.stringify({ customer_ids: customerIds }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Flask backend batch sync error: ${response.status}`, errorText.substring(0, 200));
            return { success: false, error: `HTTP ${response.status}` };
        }

        const data = await response.json();
        console.log(`✅ Flask batch sync returned: ${data.updated || 0} updated, ${data.total || 0} total`);

        return {
            success: true,
            results: data.results || []
        };
    } catch (error) {
        console.error(`❌ Flask batch sync call failed:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Valid statuses that can be saved to Supabase (based on client_requests_status_check constraint)
const VALID_STATUSES = ['ACTIVE', 'PENDING', 'LINKED', 'ENABLED', 'DISABLED', 'SUSPENDED', 'REJECTED', 'CANCELLED', 'NOT_LINKED', 'REFRESH_NEEDED'];

// Update Supabase with live status (only if valid)
async function updateSupabaseStatus(customerId: string, userId: string | null, newStatus: string): Promise<boolean> {
    try {
        // Validate status before saving
        const normalizedStatus = newStatus?.toUpperCase() || '';
        if (!VALID_STATUSES.includes(normalizedStatus)) {
            console.log(`⚠️ Skipping Supabase update for ${customerId}: '${newStatus}' is not a valid status`);
            return false;
        }

        const supabase = getSupabaseAdmin();

        // If userId is null, try to find it from customer_id first (for Webhook case)
        if (!userId) {
            const { data: request } = await supabase
                .from('client_requests')
                .select('user_id')
                .eq('customer_id', customerId)
                .single();

            if (request) {
                userId = request.user_id;
            } else {
                console.warn(`⚠️ Could not find user_id for customer ${customerId}`);
                // Proceeding without user_id usually fails due to RLS if we were client, but we are Admin here.
                // However, the WHERE clause below might need it? 
                // Wait, .eq('user_id', userId) is what we used before.
                // If we don't have userId, we should just update by customerId.
            }
        }

        let query = supabase
            .from('client_requests')
            .update({
                status: normalizedStatus,
                updated_at: new Date().toISOString(),
                link_details: {
                    link_status: normalizedStatus,
                    checked_at: new Date().toISOString(),
                    source: 'batch_refresh_live'
                }
            })
            .eq('customer_id', customerId);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { error } = await query;

        if (error) {
            console.error(`❌ Supabase update failed for ${customerId}:`, error);
            return false;
        }

        console.log(`💾 Supabase updated: ${customerId} → ${normalizedStatus}`);
        return true;
    } catch (error) {
        console.error(`❌ Supabase update error for ${customerId}:`, error);
        return false;
    }
}

export async function GET(request: NextRequest) {
    console.log('🔄 Batch Refresh Statuses API called');

    try {
        // Check for forceRefresh query param
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('forceRefresh') === 'true';

        console.log(`📌 forceRefresh=${forceRefresh}`);

        // Get user info from cookies
        const cookieStore = await cookies();
        const userInfoCookie = cookieStore.get('oauth_user_info')?.value;

        if (!userInfoCookie) {
            console.log('❌ No user info cookie found');
            return NextResponse.json({
                success: false,
                error: 'Not authenticated',
                accounts: []
            }, { status: 401 });
        }

        let userInfo;
        try {
            userInfo = JSON.parse(userInfoCookie);
        } catch {
            return NextResponse.json({
                success: false,
                error: 'Invalid user info',
                accounts: []
            }, { status: 401 });
        }

        const userId = userInfo?.id;
        const userEmail = userInfo?.email;

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'No user ID',
                accounts: []
            }, { status: 401 });
        }

        // ===== Phase 1: Get accounts from Supabase (fast, no API quota) =====
        let accounts = await getConnectedAccounts(userId, userEmail);
        console.log(`📊 Phase 1: Found ${accounts.length} accounts in Supabase`);

        // ===== Phase 2: If forceRefresh, call Flask backend for live status =====
        if (forceRefresh && accounts.length > 0) {
            console.log('🔄 Phase 2: Calling Flask backend for BATCH live status sync...');

            // Get refresh token from cookies
            const refreshTokenFromCookie = cookieStore.get('ads_refresh_token')?.value ||
                cookieStore.get('oauth_refresh_token')?.value;

            console.log(`🔑 Tokens found: ads_refresh_token=${!!cookieStore.get('ads_refresh_token')?.value}, oauth_refresh_token=${!!cookieStore.get('oauth_refresh_token')?.value}`);

            if (refreshTokenFromCookie) {
                // ✅ تجديد access token قبل إرساله لـ Flask (مثل Dashboard)
                console.log('🔄 Refreshing access token before Flask call...');
                const freshAccessToken = await refreshAccessToken(refreshTokenFromCookie);

                if (freshAccessToken) {
                    console.log('✅ Fresh access token obtained');

                    // ✅ استخدام BATCH sync بدلاً من استدعاء كل حساب منفرداً
                    const customerIds = accounts.map(acc => acc.customerId);
                    const batchResult = await fetchLiveStatusesFromFlask(customerIds, freshAccessToken, refreshTokenFromCookie);

                    if (batchResult.success && batchResult.results) {
                        // إنشاء map للوصول السريع للنتائج
                        const resultsMap = new Map<string, { status: string; is_ghost?: boolean }>();
                        for (const result of batchResult.results) {
                            // تنظيف customer_id (إزالة الشرطات للمقارنة)
                            const cleanId = result.customer_id.replace(/-/g, '');
                            resultsMap.set(cleanId, { status: result.status, is_ghost: result.is_ghost });
                        }

                        // تحديث الحسابات بالحالات الجديدة
                        accounts = accounts.map(account => {
                            const cleanId = account.customerId.replace(/-/g, '');
                            const liveResult = resultsMap.get(cleanId);

                            if (liveResult) {
                                // تحديث الحالة من النتيجة الحية
                                const newStatus = liveResult.status || account.status;
                                const isConnected = ['ACTIVE', 'LINKED', 'ENABLED'].includes(newStatus.toUpperCase());

                                console.log(`📋 Batch update: ${account.customerId}: ${account.status} → ${newStatus}`);

                                return {
                                    ...account,
                                    status: newStatus,
                                    isConnected,
                                    liveChecked: true,
                                    isGhost: liveResult.is_ghost || false
                                };
                            }
                            return { ...account, liveChecked: false };
                        });

                        console.log(`✅ Phase 2: BATCH live status checked for ${accounts.length} accounts`);
                    } else {
                        console.log('⚠️ Batch sync failed, keeping original statuses');
                    }
                } else {
                    console.log('⚠️ Failed to refresh access token');
                }
            } else {
                console.log('⚠️ No refresh token available for Flask backend call');
            }
        }

        // Map to response format with display info
        const accountsWithDisplay = accounts.map(account => ({
            ...account,
            display: mapStatusToDisplay(account.status)
        }));

        console.log(`✅ Batch Refresh: Returning ${accounts.length} accounts`);

        return NextResponse.json({
            success: true,
            accounts: accountsWithDisplay,
            totalAccounts: accounts.length,
            connectedCount: accounts.filter(a => a.isConnected).length,
            source: forceRefresh ? 'flask_live' : 'supabase',
            liveChecked: forceRefresh,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Batch Refresh error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            accounts: []
        }, { status: 500 });
    }
}

// ✅ [EVENT-DRIVEN] Webhook Listener for Google Cloud Pub/Sub
// This endpoint receives push notifications from Google Ads
export async function POST(request: NextRequest) {
    try {
        console.log('📨 Webhook: Received Pub/Sub message');
        console.log('🔍 Webhook Headers:', Object.fromEntries(request.headers.entries()));

        // Clone request to read text body for debugging without consuming the stream for JSON
        const rawBody = await request.clone().text();
        console.log('📦 Webhook Raw Body:', rawBody.substring(0, 500)); // Log first 500 chars

        // 1. Token Verification (Security)
        const token = request.headers.get('Authorization')?.split('Bearer ')[1] ||
            new URL(request.url).searchParams.get('token');

        const expectedToken = process.env.PUBSUB_VERIFICATION_TOKEN;

        if (expectedToken && token !== expectedToken) {
            console.error('⛔ Webhook: Invalid token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await request.json();
        let customerId = body.customer_id || body.customerId;
        let status = body.status || body.newStatus;

        // Support for Standard Google Cloud Pub/Sub Envelope
        if (body.message && body.message.data) {
            try {
                const decodedData = Buffer.from(body.message.data, 'base64').toString('utf-8');
                const parsedData = JSON.parse(decodedData);
                console.log('📦 Webhook: Decoded Pub/Sub payload:', JSON.stringify(parsedData, null, 2));

                // Strategy 1: Direct JSON (for testing)
                if (parsedData.customerId || parsedData.customer_id) {
                    customerId = parsedData.customerId || parsedData.customer_id;
                    status = parsedData.status || parsedData.newStatus;
                }
                // Strategy 2: Google Cloud Audit Logs (Production)
                else if (parsedData.protoPayload) {
                    console.log('🕵️ Detected Audit Log format');
                    const resourceName = parsedData.protoPayload.resourceName || '';
                    const methodName = parsedData.protoPayload.methodName || '';

                    // Extract Customer ID (Format: customers/{id}/...)
                    // Search for 10 digits, possibly with dashes
                    const idMatch = resourceName.match(/customers\/(\d{3}-?\d{3}-?\d{4}|\d{10})/);
                    if (idMatch) {
                        customerId = idMatch[1]; // Get the ID part
                        console.log(`🎯 Extracted CustomerID from resource: ${customerId}`);
                    }

                    // Infer Status from Method
                    if (methodName.includes('CreateCustomerManagerLink')) {
                        status = 'PENDING'; // Invitation sent/created
                    } else if (methodName.includes('MutateCustomerManagerLink')) {
                        status = 'REFRESH_NEEDED';
                    } else if (methodName.includes('AccountLinkService')) {
                        // ✅ Support for AccountLinkService (User Request)
                        console.log('🔗 Detected AccountLinkService event');
                        status = 'REFRESH_NEEDED';
                    } else if (methodName.includes('UpdateSink')) {
                        console.log('⚠️ Ignoring UpdateSink system event');
                        return NextResponse.json({ success: true, message: 'Ignored system event' }, { status: 200 });
                    }
                }
            } catch (e) {
                console.error('❌ Webhook: Failed to decode Pub/Sub data', e);
            }
        }

        if (!customerId || !status) {
            console.warn('⚠️ Webhook: Missing customerId or status in payload');
            return NextResponse.json({ error: 'Missing data or unrecognized event' }, { status: 400 });
        }

        // 3. Update Supabase
        console.log(`🔄 Webhook: Updating status for ${customerId} directly to ${status}`);

        // Pass null for userId to let the function find it
        // If status is REFRESH_NEEDED, Supabase Realtime will broadcast it, 
        // and the Frontend will trigger a live API fetch.
        const updated = await updateSupabaseStatus(customerId, null, status);

        if (updated) {
            return NextResponse.json({ success: true, message: 'Updated' }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: 'Update failed or invalid status' }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
