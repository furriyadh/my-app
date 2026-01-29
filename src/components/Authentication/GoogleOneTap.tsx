"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Script from "next/script";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * Google One Tap Component - Professional Implementation
 * 
 * Best Practices Applied:
 * 1. Delay before showing prompt (user should interact with site first)
 * 2. Don't show to already authenticated users
 * 3. Respect user dismissals with localStorage tracking
 * 4. Don't show on authentication-related pages
 * 5. Use cancel_on_tap_outside: true for less intrusive UX
 * 6. Load script only when needed
 * 7. Proper session check before initializing
 */

// Configuration
const CONFIG = {
    // Delay before showing One Tap (3 seconds - let user see the page first)
    INITIAL_DELAY_MS: 3000,

    // Minimum time between dismissals before showing again (in hours)
    COOLDOWN_HOURS: {
        FIRST: 2,      // 2 hours after first dismissal
        SECOND: 24,    // 1 day after second dismissal
        THIRD: 168,    // 1 week after third dismissal
        FOURTH_PLUS: 672, // 4 weeks after 4+ dismissals
    },

    // Pages where One Tap should NOT appear
    EXCLUDED_PATHS: [
        '/authentication',
        '/dashboard',
        '/campaign',
        '/dashboard/google-ads',
        '/settings',
        '/onboarding',
        '/admin',
    ],

    // LocalStorage keys
    STORAGE_KEYS: {
        DISMISSAL_COUNT: 'google_one_tap_dismissal_count',
        LAST_DISMISSAL: 'google_one_tap_last_dismissal',
        USER_OPTED_OUT: 'google_one_tap_opted_out',
    },
};

export default function GoogleOneTap() {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean | null>(null);
    const initAttemptedRef = useRef(false);

    // Client ID from environment
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_ADS_CLIENT_ID ||
        "366144291902-u75bec3sviur9nrutbslt14ob14hrgud.apps.googleusercontent.com";

    // Check if current path is excluded
    const isExcludedPath = useCallback(() => {
        return CONFIG.EXCLUDED_PATHS.some(path => pathname?.startsWith(path));
    }, [pathname]);

    // Check cooldown status based on dismissal history
    const isInCooldown = useCallback(() => {
        if (typeof window === 'undefined') return true;

        const optedOut = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_OPTED_OUT);
        if (optedOut === 'true') return true;

        const lastDismissal = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_DISMISSAL);
        const dismissalCount = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.DISMISSAL_COUNT) || '0', 10);

        if (!lastDismissal || dismissalCount === 0) return false;

        const lastDismissalTime = new Date(lastDismissal).getTime();
        const now = Date.now();
        const hoursSinceLastDismissal = (now - lastDismissalTime) / (1000 * 60 * 60);

        let cooldownHours: number;
        switch (dismissalCount) {
            case 1:
                cooldownHours = CONFIG.COOLDOWN_HOURS.FIRST;
                break;
            case 2:
                cooldownHours = CONFIG.COOLDOWN_HOURS.SECOND;
                break;
            case 3:
                cooldownHours = CONFIG.COOLDOWN_HOURS.THIRD;
                break;
            default:
                cooldownHours = CONFIG.COOLDOWN_HOURS.FOURTH_PLUS;
        }

        return hoursSinceLastDismissal < cooldownHours;
    }, []);

    // Record a dismissal
    const recordDismissal = useCallback(() => {
        if (typeof window === 'undefined') return;

        const currentCount = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.DISMISSAL_COUNT) || '0', 10);
        localStorage.setItem(CONFIG.STORAGE_KEYS.DISMISSAL_COUNT, String(currentCount + 1));
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_DISMISSAL, new Date().toISOString());
    }, []);

    // Reset cooldown on successful sign-in
    const resetCooldown = useCallback(() => {
        if (typeof window === 'undefined') return;

        localStorage.removeItem(CONFIG.STORAGE_KEYS.DISMISSAL_COUNT);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.LAST_DISMISSAL);
    }, []);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setIsUserAuthenticated(!!session);
            } catch (error) {
                console.warn('Failed to check auth status:', error);
                setIsUserAuthenticated(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsUserAuthenticated(!!session);
            if (event === 'SIGNED_IN') {
                resetCooldown();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth, resetCooldown]);

    // Determine if we should show One Tap
    useEffect(() => {
        // Wait for auth check to complete
        if (isUserAuthenticated === null) return;

        // Don't show if user is already authenticated
        if (isUserAuthenticated) {
            setShouldShow(false);
            return;
        }

        // Don't show on excluded paths
        if (isExcludedPath()) {
            setShouldShow(false);
            return;
        }

        // Don't show if in cooldown
        if (isInCooldown()) {
            setShouldShow(false);
            return;
        }

        // Delay before showing (let user see the site first)
        const timer = setTimeout(() => {
            setShouldShow(true);
        }, CONFIG.INITIAL_DELAY_MS);

        return () => clearTimeout(timer);
    }, [isUserAuthenticated, isExcludedPath, isInCooldown]);

    // Initialize Google One Tap
    useEffect(() => {
        if (!isScriptLoaded || !shouldShow || !clientId || initAttemptedRef.current) return;

        const initializeGoogleOneTap = () => {
            if (!(window as any).google) return;

            initAttemptedRef.current = true;

            try {
                (window as any).google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response: any) => {
                        try {
                            // Send the token to Supabase
                            const { data, error } = await supabase.auth.signInWithIdToken({
                                provider: "google",
                                token: response.credential,
                            });

                            if (error) {
                                console.error("Supabase One Tap Error:", error);
                                return;
                            }

                            if (data.session) {
                                const user = data.user;
                                console.log("✅ One Tap Success:", user.email);

                                // Reset cooldown on successful sign-in
                                resetCooldown();

                                // Sync session with OAuth cookies
                                try {
                                    const googleIdentity = user.identities?.find((i: any) => i.provider === 'google');
                                    const googleId = googleIdentity?.id ||
                                        user.user_metadata?.provider_id ||
                                        user.user_metadata?.sub ||
                                        user.id;

                                    await fetch('/api/auth/sync-session', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            id: googleId,
                                            supabaseId: user.id,
                                            email: user.email,
                                            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                                            picture: user.user_metadata?.avatar_url || '',
                                            access_token: data.session.access_token
                                        })
                                    });
                                    console.log("✅ Session synced to OAuth cookies");
                                } catch (syncError) {
                                    console.warn("⚠️ Failed to sync session:", syncError);
                                }

                                // Smart Redirection Logic
                                const savedPrompt = localStorage.getItem("initialAdPrompt");

                                if (savedPrompt) {
                                    router.push("/campaign/new");
                                } else {
                                    const createdAt = new Date(user.created_at || "");
                                    const now = new Date();
                                    const isNewUser = (now.getTime() - createdAt.getTime()) < 60 * 1000;

                                    if (isNewUser) {
                                        router.push("/campaign/new");
                                    } else {
                                        router.push("/dashboard");
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("One Tap Exception:", err);
                        }
                    },
                    // UX Settings - Less intrusive
                    auto_select: false, // Don't auto-select - let user choose
                    cancel_on_tap_outside: true, // Allow dismissal by clicking outside
                    context: 'signin', // Context: signin, signup, or use
                    itp_support: true, // Intelligent Tracking Prevention support
                });

                // Prompt with notification callback
                (window as any).google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed()) {
                        const reason = notification.getNotDisplayedReason();
                        console.log("One Tap not displayed:", reason);

                        // If opt_out_or_no_session, don't record as dismissal
                        if (reason !== 'opt_out_or_no_session') {
                            // Don't count as dismissal - this is a technical issue
                        }
                    } else if (notification.isSkippedMoment()) {
                        const reason = typeof notification.getSkippedMomentReason === 'function'
                            ? notification.getSkippedMomentReason()
                            : 'unknown';
                        console.log("One Tap skipped:", reason);
                    } else if (notification.isDismissedMoment()) {
                        const reason = notification.getDismissedReason();
                        console.log("One Tap dismissed:", reason);

                        // Only record dismissal if user actively dismissed
                        if (reason === 'credential_returned') {
                            // Success - handled by callback
                        } else if (reason === 'cancel_called' || reason === 'flow_closed') {
                            recordDismissal();
                        }
                    }
                });
            } catch (error) {
                console.error("Failed to initialize One Tap:", error);
            }
        };

        initializeGoogleOneTap();
    }, [isScriptLoaded, shouldShow, clientId, router, supabase.auth, resetCooldown, recordDismissal]);

    // Don't render anything if we shouldn't show
    if (!shouldShow) {
        return null;
    }

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            strategy="lazyOnload"
            onLoad={() => setIsScriptLoaded(true)}
        />
    );
}
