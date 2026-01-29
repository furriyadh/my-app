"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * 🔄 SessionSyncProvider
 * 
 * يتحقق من جلسة Supabase ويزامنها مع OAuth cookies تلقائياً
 * هذا يضمن أن الـ API routes تعمل بشكل صحيح حتى بعد OAuth callback
 * 
 * ✅ يقوم أيضاً بتجديد access_token تلقائياً كل 50 دقيقة
 * ✅ يستمع لـ auth:logout events من authFetch ويتعامل معها
 */
export default function SessionSyncProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const syncedRef = useRef(false);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // 🔒 استماع لـ logout events من authFetch
    useEffect(() => {
        const handleLogout = async () => {
            console.log('🚪 Auth logout event received - clearing session...');

            try {
                // مسح الـ session من Supabase
                const supabase = createClient();
                await supabase.auth.signOut();

                // مسح OAuth cookies
                await fetch('/api/oauth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                // مسح localStorage
                localStorage.removeItem('cached_google_ads_accounts');
                localStorage.removeItem('oauth_user_info');
                localStorage.removeItem('userEmail');

                console.log('✅ Session cleared, redirecting to login...');

                // التوجيه لصفحة الـ Home
                router.push('/');
            } catch (error) {
                console.error('❌ Error during logout:', error);
                // في حالة الخطأ، نوجه للـ Home على أي حال
                router.push('/');
            }
        };

        window.addEventListener('auth:logout', handleLogout);

        return () => {
            window.removeEventListener('auth:logout', handleLogout);
        };
    }, [router]);

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

                    // 🔧 التحقق من أن الـ cookie للمستخدم الصحيح
                    let needsSync = !hasOAuthCookie;

                    if (hasOAuthCookie) {
                        try {
                            const cookieStr = document.cookie
                                .split('; ')
                                .find(row => row.startsWith('oauth_user_info='));

                            if (cookieStr) {
                                const cookieValue = decodeURIComponent(cookieStr.split('=')[1]);
                                const cookieUser = JSON.parse(cookieValue);

                                // 🔑 مقارنة الـ email - إذا كان مختلف، نحتاج مزامنة!
                                if (cookieUser.email !== session.user.email) {
                                    console.log('⚠️ User changed! Cookie:', cookieUser.email, 'Session:', session.user.email);
                                    needsSync = true;
                                }
                            }
                        } catch (e) {
                            console.warn('⚠️ Error parsing oauth_user_info cookie:', e);
                            needsSync = true;
                        }
                    }

                    if (needsSync) {
                        console.log("🔄 Session found but OAuth cookie missing/outdated, syncing...");

                        // جلب Google ID من identities أو user_metadata
                        const user = session.user;
                        const googleIdentity = user.identities?.find((i: any) => i.provider === 'google');
                        const googleId = googleIdentity?.id ||
                            user.user_metadata?.provider_id ||
                            user.user_metadata?.sub ||
                            user.id;

                        console.log("🔑 Using ID for sync:", { supabaseId: user.id, googleId, email: user.email });

                        await fetch('/api/auth/sync-session', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            },
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
