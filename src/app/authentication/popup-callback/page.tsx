"use client";

import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function PopupCallback() {
    const router = useRouter();

    useEffect(() => {
        // Listen for auth state changes. Supabase client handles the hash fragment automatically.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || session) {
                // 1. Try BroadcastChannel
                try {
                    const bc = new BroadcastChannel('oauth_channel');
                    bc.postMessage({ type: "SUPABASE_AUTH_SUCCESS" });
                    setTimeout(() => bc.close(), 1000);
                } catch (e) { }

                // 2. Try window.opener
                if (window.opener) {
                    window.opener.postMessage({ type: "SUPABASE_AUTH_SUCCESS" }, "*");
                    window.close();
                } else {
                    // Fallback cleanup
                    setTimeout(() => {
                        window.close();
                        router.push("/dashboard");
                    }, 500);
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#0a0e19]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-zinc-500 font-medium">Authenticating...</p>
        </div>
    );
}
