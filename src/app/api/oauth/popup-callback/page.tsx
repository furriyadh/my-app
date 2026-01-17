"use client";

import { useEffect } from "react";

/**
 * OAuth Popup Callback Page
 * This page is opened in a popup window after the user completes Google OAuth.
 * It communicates the result back to the parent window.
 */
export default function OAuthPopupCallback() {
    useEffect(() => {
        // Check if this is an error callback
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
            // Notify parent window of error
            if (window.opener) {
                window.opener.postMessage(
                    { type: "OAUTH_ERROR", error: errorDescription || error },
                    window.location.origin
                );
                window.close();
            }
            return;
        }

        // If we reach here, the OAuth was successful (cookies are already set by the API callback)
        // Notify the parent window
        if (window.opener) {
            window.opener.postMessage({ type: "OAUTH_SUCCESS" }, window.location.origin);
            // Small delay before closing to ensure the message is sent
            setTimeout(() => {
                window.close();
            }, 500);
        } else {
            // Fallback: If not opened as a popup, redirect to the intended page
            const redirectAfter = urlParams.get("redirect_after") || "/dashboard";
            window.location.href = redirectAfter;
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#0a0e19]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-zinc-500 font-medium">Completing authentication...</p>
        </div>
    );
}
