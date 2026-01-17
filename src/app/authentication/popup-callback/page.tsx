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
                if (window.opener) {
                    // Notify the opener window that authentication was successful
                    window.opener.postMessage({ type: "SUPABASE_AUTH_SUCCESS" }, window.location.origin);
                    // Close the popup
                    window.close();
                } else {
                    // Fallback: If not opened as a popup, redirect to dashboard
                    router.push("/dashboard");
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
