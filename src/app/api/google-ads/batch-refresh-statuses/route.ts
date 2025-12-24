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

// Fetch live status from Flask Backend (Phase 2)
async function fetchLiveStatusFromFlask(customerId: string, accessToken: string, refreshToken: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
        const backendUrl = getBackendUrl();
        console.log(`🔄 Calling Flask backend for account ${customerId}...`);

        const response = await fetch(`${backendUrl}/api/sync-account-status/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Google-Refresh-Token': refreshToken,
            },
            body: JSON.stringify({ customer_id: customerId }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Flask backend error for ${customerId}: ${response.status}`, errorText.substring(0, 200));
            return { success: false, error: `HTTP ${response.status}` };
        }

        const data = await response.json();
        console.log(`✅ Flask returned status for ${customerId}: ${data.status || data.api_status}`);

        return {
            success: true,
            status: data.status || data.api_status || 'UNKNOWN'
        };
    } catch (error) {
        console.error(`❌ Flask call failed for ${customerId}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Valid statuses that can be saved to Supabase (based on client_requests_status_check constraint)
const VALID_STATUSES = ['ACTIVE', 'PENDING', 'LINKED', 'ENABLED', 'DISABLED', 'SUSPENDED', 'REJECTED', 'CANCELLED', 'NOT_LINKED'];

// Update Supabase with live status (only if valid)
async function updateSupabaseStatus(customerId: string, userId: string, newStatus: string): Promise<boolean> {
    try {
        // Validate status before saving
        const normalizedStatus = newStatus?.toUpperCase() || '';
        if (!VALID_STATUSES.includes(normalizedStatus)) {
            console.log(`⚠️ Skipping Supabase update for ${customerId}: '${newStatus}' is not a valid status`);
            return false;
        }

        const supabase = getSupabaseAdmin();

        const { error } = await supabase
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
            .eq('customer_id', customerId)
            .eq('user_id', userId);

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
            console.log('🔄 Phase 2: Calling Flask backend for live status...');

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
                    // Call Flask backend for each account in parallel
                    const liveStatusPromises = accounts.map(async (account) => {
                        const result = await fetchLiveStatusFromFlask(account.customerId, freshAccessToken, refreshTokenFromCookie);

                        if (result.success && result.status) {
                            // Update Supabase if status changed
                            if (result.status !== account.status) {
                                console.log(`🔄 Status changed for ${account.customerId}: ${account.status} → ${result.status}`);
                                await updateSupabaseStatus(account.customerId, userId, result.status);
                            }
                            return { ...account, status: result.status, liveChecked: true };
                        }
                        return { ...account, liveChecked: false };
                    });

                    // Wait for all live status checks to complete
                    const updatedAccounts = await Promise.all(liveStatusPromises);
                    accounts = updatedAccounts;

                    console.log(`✅ Phase 2: Live status checked for ${accounts.length} accounts`);
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
