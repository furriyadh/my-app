"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const AdCreationPrompt = () => {
    // This is a placeholder to ensure the file exports something if the script fails
    return null;
};

export default function GoogleOneTap() {
    const router = useRouter();
    const supabase = createClient();
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    // Use the Client ID from env (fallback to the one provided in context if needed, but best to use env)
    // The user provided GOOGLE_ADS_CLIENT_ID in .env.development. 
    // We'll try to use a specific NEXT_PUBLIC_ one if available, otherwise fallback.
    // Note: One Tap requires a Web Client ID.
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID || "366144291902-u75bec3sviur9nrutbslt14ob14hrgud.apps.googleusercontent.com";

    useEffect(() => {
        if (!isScriptLoaded || !clientId) return;

        const initializeGoogleOneTap = () => {
            if (!(window as any).google) return;

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
                            // Auth successful!
                            const user = data.user;
                            console.log("One Tap Success:", user);

                            // ✅ مزامنة بيانات Supabase مع OAuth cookies
                            // استخدام Google provider_id بدلاً من Supabase UUID لضمان تطابق الـ IDs
                            try {
                                // جلب Google ID من identities أو user_metadata
                                const googleIdentity = user.identities?.find((i: any) => i.provider === 'google');
                                const googleId = googleIdentity?.id ||
                                    user.user_metadata?.provider_id ||
                                    user.user_metadata?.sub ||
                                    user.id; // Fallback للـ Supabase UUID

                                console.log("🔑 Using ID for sync:", {
                                    supabaseId: user.id,
                                    googleId,
                                    hasIdentities: !!user.identities?.length
                                });

                                await fetch('/api/auth/sync-session', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        id: googleId,
                                        supabaseId: user.id, // حفظ كلا الـ IDs للربط
                                        email: user.email,
                                        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                                        picture: user.user_metadata?.avatar_url || ''
                                    })
                                });
                                console.log("✅ Session synced to OAuth cookies with Google ID");
                            } catch (syncError) {
                                console.warn("⚠️ Failed to sync session:", syncError);
                            }

                            // Smart Redirection Logic
                            const savedPrompt = localStorage.getItem("initialAdPrompt");

                            if (savedPrompt) {
                                // Case 1: User has an active prompt -> Always go to campaign creation
                                console.log("Redirecting to Campaign Creation (Prompt detected)");
                                router.push("/campaign/new");
                            } else {
                                // Case 2: No prompt. Check if new or existing user.
                                const createdAt = new Date(user.created_at || "");
                                const now = new Date();
                                const isNewUser = (now.getTime() - createdAt.getTime()) < 60 * 1000; // Created within last minute

                                if (isNewUser) {
                                    console.log("Redirecting to Campaign Creation (New User)");
                                    router.push("/campaign/new");
                                } else {
                                    console.log("Redirecting to Dashboard (Existing User)");
                                    router.push("/dashboard");
                                }
                            }
                        }
                    } catch (err) {
                        console.error("One Tap Exception:", err);
                    }
                },
                auto_select: true, // Try to auto-sign in
                cancel_on_tap_outside: false,
            });

            // Render the One Tap prompt (top right usually, or controlled by Google)
            (window as any).google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log("One Tap skipped/not displayed:", notification.getNotDisplayedReason());
                }
            });
        };

        initializeGoogleOneTap();
    }, [isScriptLoaded, clientId, router, supabase.auth]);

    return (
        <>
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => setIsScriptLoaded(true)}
            />
        </>
    );
}
