"use client";

/**
 * OAuth Popup Helper
 * Opens OAuth consent screen in a popup window and handles the callback.
 */

interface OAuthPopupOptions {
    url: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onClose?: () => void;
    width?: number;
    height?: number;
}

export function openOAuthPopup({
    url,
    onSuccess,
    onError,
    onClose,
    width = 500,
    height = 600,
}: OAuthPopupOptions): Window | null {
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
        url,
        "OAuthPopup",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (!popup) {
        onError?.("Popup blocked! Please allow popups for this site.");
        return null;
    }

    // Listen for the success message from the popup
    const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "OAUTH_SUCCESS" || event.data.type === "SUPABASE_AUTH_SUCCESS") {
            window.removeEventListener("message", handleMessage);
            onSuccess?.();
        } else if (event.data.type === "OAUTH_ERROR") {
            window.removeEventListener("message", handleMessage);
            onError?.(event.data.error || "OAuth failed");
        }
    };

    window.addEventListener("message", handleMessage);

    // Optional: Polling to detect if popup was closed manually without success
    const timer = setInterval(() => {
        if (popup.closed) {
            clearInterval(timer);
            window.removeEventListener("message", handleMessage);
            onClose?.();
        }
    }, 1000);

    return popup;
}

/**
 * Opens the Google OAuth flow in a popup. 
 * Uses the existing /api/oauth/google endpoint which returns JSON with authUrl.
 */
export async function openGoogleOAuthPopup(options: {
    redirectAfter?: string;
    scope?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onClose?: () => void;
}): Promise<void> {
    try {
        // Build the API URL
        let apiUrl = "/api/oauth/google?popup=true";
        if (options.redirectAfter) {
            apiUrl += `&redirect_after=${encodeURIComponent(options.redirectAfter)}`;
        }
        if (options.scope) {
            apiUrl += `&scope=${encodeURIComponent(options.scope)}`;
        }

        // Fetch the auth URL from our API (JSON mode)
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to get OAuth URL");
        }

        const data = await response.json();

        if (!data.authUrl) {
            throw new Error("No auth URL received");
        }

        // Open the popup with the auth URL
        openOAuthPopup({
            url: data.authUrl,
            onSuccess: options.onSuccess,
            onError: options.onError,
            onClose: options.onClose,
        });
    } catch (error: any) {
        options.onError?.(error.message || "Failed to start OAuth");
    }
}
