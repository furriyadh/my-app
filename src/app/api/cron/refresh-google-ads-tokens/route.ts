import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🛡️ Security: Require a secret key to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET || 'secure_cron_secret_placeholder';

export const dynamic = 'force-dynamic'; // Prevent caching
export const maxDuration = 60; // Allow up to 60 seconds for batch processing

export async function GET(request: NextRequest) {
    // 1. 🔒 Security Check
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('🔄 Cron Job Started: Refreshing Google Ads Tokens...');

        // 2. 🔌 Init Supabase Admin (Bypass RLS)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 3. 🔍 Fetch tokens expiring soon (or all active ones to be safe)
        // Check tokens expiring in the next 45 minutes
        const expirationThreshold = new Date(Date.now() + 45 * 60 * 1000).toISOString();

        const { data: tokens, error } = await supabase
            .from('user_oauth_tokens')
            .select('user_id, refresh_token, expires_at')
            .eq('provider', 'google')
            .not('refresh_token', 'is', null)
            .lte('expires_at', expirationThreshold); // Only refresh those about to expire

        if (error) throw error;

        console.log(`📊 Found ${tokens.length} tokens to refresh.`);

        if (tokens.length === 0) {
            return NextResponse.json({ success: true, message: 'No tokens need refreshing', refreshed: 0 });
        }

        let successCount = 0;
        let failCount = 0;

        // 4. 🔄 Loop & Refresh
        const refreshPromises = tokens.map(async (token) => {
            try {
                // Refresh via Google API
                const response = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
                        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
                        refresh_token: token.refresh_token!,
                        grant_type: 'refresh_token',
                    }),
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.error(`❌ Failed to refresh user ${token.user_id}: ${errText}`);
                    failCount++;
                    return;
                }

                const data = await response.json();
                const newAccessToken = data.access_token;
                const expiresIn = data.expires_in; // Usually 3600 seconds

                if (!newAccessToken) throw new Error('No access_token returned');

                // Calculate new expiry
                const newExpiresAt = new Date(Date.now() + (expiresIn * 1000)).toISOString();

                // 💾 Update DB
                const { error: updateError } = await supabase
                    .from('user_oauth_tokens')
                    .update({
                        access_token: newAccessToken,
                        expires_at: newExpiresAt,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', token.user_id)
                    .eq('provider', 'google');

                if (updateError) {
                    console.error(`❌ DB Update Error for ${token.user_id}:`, updateError);
                    failCount++;
                } else {
                    console.log(`✅ Refreshed token for user ${token.user_id}`);
                    successCount++;
                }

            } catch (err) {
                console.error(`❌ Error processing user ${token.user_id}:`, err);
                failCount++;
            }
        });

        // 5. 🔄 Refresh Platform Integrations (New)
        const { data: platformTokens, error: platformError } = await supabase
            .from('platform_integrations')
            .select('id, platform_name, refresh_token')
            .not('refresh_token', 'is', null)
            .ilike('platform_name', '%google%'); // Filter for Google platforms

        if (platformTokens && platformTokens.length > 0) {
            console.log(`📊 Found ${platformTokens.length} platform integrations to refresh.`);
            const platformPromises = platformTokens.map(async (token) => {
                try {
                    const response = await fetch('https://oauth2.googleapis.com/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
                            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
                            refresh_token: token.refresh_token!,
                            grant_type: 'refresh_token',
                        }),
                    });

                    if (!response.ok) { failCount++; return; } // Fixed return
                    const data = await response.json();
                    if (!data.access_token) { failCount++; return; } // Fixed return

                    const newExpiresAt = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

                    await supabase.from('platform_integrations')
                        .update({ access_token: data.access_token, token_expires_at: newExpiresAt, updated_at: new Date().toISOString() })
                        .eq('id', token.id);
                    successCount++;
                } catch (e) { failCount++; }
            });
            refreshPromises.push(...platformPromises);
        }

        // 6. 🔄 Refresh Google Ads OAuth Tokens (New)
        const { data: adsTokens, error: adsError } = await supabase
            .from('google_ads_oauth_tokens')
            .select('id, refresh_token')
            .not('refresh_token', 'is', null);

        if (adsTokens && adsTokens.length > 0) {
            console.log(`📊 Found ${adsTokens.length} Google Ads tokens to refresh.`);
            const adsPromises = adsTokens.map(async (token) => {
                try {
                    const response = await fetch('https://oauth2.googleapis.com/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
                            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
                            refresh_token: token.refresh_token!,
                            grant_type: 'refresh_token',
                        }),
                    });

                    if (!response.ok) { failCount++; return; } // Fixed return
                    const data = await response.json();
                    if (!data.access_token) { failCount++; return; } // Fixed return

                    const newExpiresAt = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

                    await supabase.from('google_ads_oauth_tokens')
                        .update({ access_token: data.access_token, expires_at: newExpiresAt, updated_at: new Date().toISOString() })
                        .eq('id', token.id);
                    successCount++;
                } catch (e) { failCount++; }
            });
            refreshPromises.push(...adsPromises);
        }

        // Wait for all to finish
        await Promise.all(refreshPromises);

        console.log(`🏁 Cron Finished. Success: ${successCount}, Failures: ${failCount}`);

        return NextResponse.json({
            success: true,
            refreshed: successCount,
            failed: failCount,
            total_processed: tokens.length + (platformTokens?.length || 0) + (adsTokens?.length || 0),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Cron Job Fatal Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
