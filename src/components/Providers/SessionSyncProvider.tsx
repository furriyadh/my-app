"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * 🔄 SessionSyncProvider
 * 
 * يتحقق من جلسة Supabase ويزامنها مع OAuth cookies تلقائياً
 * هذا يضمن أن الـ API routes تعمل بشكل صحيح حتى بعد OAuth callback
 * 
 * ✅ يقوم أيضاً بتجديد access_token تلقائياً كل 50 دقيقة
 */
export default function SessionSyncProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const syncedRef = useRef(false);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // تجنب المزامنة المتكررة
        if (syncedRef.current) return;

        const checkAndSyncSession = async () => {
            try {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // التحقق من وجود oauth_user_info cookie
                    const hasOAuthCookie = document.cookie.includes('oauth_user_info');

                    if (!hasOAuthCookie) {
                        console.log("🔄 Session found but OAuth cookie missing, syncing...");

                        // جلب Google ID من identities أو user_metadata
                        const user = session.user;
                        const googleIdentity = user.identities?.find((i: any) => i.provider === 'google');
                        const googleId = googleIdentity?.id ||
                            user.user_metadata?.provider_id ||
                            user.user_metadata?.sub ||
                            user.id;

                        console.log("🔑 Using ID for sync:", { supabaseId: user.id, googleId });

                        await fetch('/api/auth/sync-session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: googleId,
                                supabaseId: user.id,
                                email: user.email,
                                name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                                picture: user.user_metadata?.avatar_url || ''
                            })
                        });

                        console.log("✅ Session synced to OAuth cookies on page load with Google ID");
                    }
                }

                syncedRef.current = true;
            } catch (error) {
                console.warn("⚠️ Failed to sync session on load:", error);
            }
        };

        checkAndSyncSession();
    }, []);

    // ✅ تجديد access_token تلقائياً كل 50 دقيقة
    useEffect(() => {
        const refreshToken = async () => {
            // فقط إذا كان المستخدم مسجل دخول (لديه refresh_token)
            const hasRefreshToken = document.cookie.includes('oauth_refresh_token');
            if (!hasRefreshToken) return;

            try {
                console.log("⏰ Auto-refreshing access token...");
                const response = await fetch('/api/oauth/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    console.log("✅ Access token auto-refreshed successfully");
                } else {
                    console.warn("⚠️ Failed to auto-refresh token:", response.status);
                }
            } catch (error) {
                console.warn("⚠️ Error auto-refreshing token:", error);
            }
        };

        // تجديد كل 50 دقيقة (3000000 ms)
        // الـ access_token يدوم ساعة، فنجدده قبل انتهائه بـ 10 دقائق
        const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes

        refreshIntervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);

        // Cleanup on unmount
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    return <>{children}</>;
}
