"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Icons (Shared) ---

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const EyeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-zinc-500 dark:text-zinc-400"
    >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-zinc-500 dark:text-zinc-400"
    >
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

const AppleIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-6 w-6"
    >
        <path
            fill="currentColor"
            d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
        />
    </svg>
);

const GoogleIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
    >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
        <path d="M1 1h22v22H1z" fill="none"></path>
    </svg>
);

const XIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5 text-zinc-900 dark:text-white"
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m21 2-2 2m-7.6 7.6a6.5 6.5 0 1 1 5.3-5.3" />
        <circle cx="8" cy="16" r="6" />
        <path d="M10.8 14.8 14 18h2v2h2v2h2" />
    </svg>
);

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

// --- Component ---

const useSupabaseClient = () => {
    const [supabase, setSupabase] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('🔄 Loading Supabase client...');
            import('@/utils/supabase/client')
                .then((module) => {
                    console.log('✅ Supabase module loaded:', module);
                    // Try both exports
                    const client = module.supabase || module.default;
                    if (client) {
                        console.log('✅ Supabase client ready');
                        setSupabase(client);
                    } else {
                        console.error('❌ No supabase client found in module');
                    }
                })
                .catch((error) => {
                    console.error('❌ Failed to load Supabase client:', error);
                });
        }
    }, []);

    return supabase;
};

interface LoginProps {
    initialView?: "signin" | "signup" | "forgot";
    onClose?: () => void;
}

export default function Login({ initialView = "signin", onClose }: LoginProps) {
    const supabase = useSupabaseClient();
    const router = useRouter();

    const [view, setView] = useState<"signin" | "signup" | "forgot">("signin");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState(""); // For Sign Up

    // Log when supabase client loads
    useEffect(() => {
        console.log('🔐 Supabase client state changed:', supabase ? '✅ Loaded' : '⏳ Loading...');
    }, [supabase]);

    // Initialize view from props, but only once
    useEffect(() => {
        if (initialView) {
            setView(initialView);
        }
    }, []); // Empty dependency array intentionally

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    // --- Handlers ---

    // ... rest of handlers ...

    const handleOAuthSignIn = async (provider: "google" | "facebook" | "apple" | "twitter") => {
        console.log('🔐 OAuth button clicked, provider:', provider);

        if (!supabase) {
            setMessage("System is loading, please wait...");
            return;
        }
        setIsLoading(true);
        setMessage("");

        try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");

            // Use popup flow - skipBrowserRedirect: true to get URL for popup
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${appUrl}/dashboard`,
                    skipBrowserRedirect: true,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                },
            });

            if (error) {
                setMessage(`Error: ${error.message}`);
                setIsLoading(false);
                return;
            }

            if (data?.url) {
                // Open popup for OAuth
                const width = 500;
                const height = 600;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;

                const popup = window.open(
                    data.url,
                    "GoogleAuth",
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                );

                if (!popup) {
                    setMessage("Popup blocked! Please allow popups.");
                    setIsLoading(false);
                    return;
                }

                // 1. Listen for BroadcastChannel message (Fast & Reliable)
                const bc = new BroadcastChannel('oauth_channel');
                bc.onmessage = (event) => {
                    if (event.data?.type === "SUPABASE_AUTH_SUCCESS") {
                        handleSuccess();
                    }
                };

                // 2. Listen for window.postMessage (Fallback)
                const handleMessage = (event: MessageEvent) => {
                    if (event.data?.type === "SUPABASE_AUTH_SUCCESS") {
                        handleSuccess();
                    }
                };
                window.addEventListener("message", handleMessage);

                // Success Handler
                const handleSuccess = () => {
                    console.log('✅ Login Success detected!');
                    clearInterval(checkInterval);
                    window.removeEventListener("message", handleMessage);
                    try { bc.close(); } catch (e) { }

                    router.push("/dashboard");
                    router.refresh();
                };

                // 3. Poll for popup close and check session (Last Resort)
                const checkInterval = setInterval(async () => {
                    if (popup.closed) {
                        clearInterval(checkInterval);
                        window.removeEventListener("message", handleMessage);
                        try { bc.close(); } catch (e) { }

                        // Check if session was created
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session) {
                            handleSuccess();
                        } else {
                            setIsLoading(false);
                        }
                    }
                }, 500);
            }

        } catch (err: any) {
            setMessage("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!supabase) {
            setMessage("System is loading...");
            return;
        }

        // Strict Gmail Validation
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            setMessage("Please use a valid Gmail address (Example: name@gmail.com)");
            return;
        }

        setMessage("");
        setIsLoading(true);

        try {
            if (view === "signin") {
                // --- Sign In Logic ---
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    if (error.message.includes("Invalid login credentials")) {
                        setMessage("Invalid login credentials.");
                    } else if (error.message.includes("Email not confirmed")) {
                        setMessage("Email not confirmed.");
                    } else {
                        setMessage(`Error: ${error.message}`);
                    }
                } else if (data.user && data.session) {
                    // Sync Logic 
                    try {
                        const googleIdentity = data.user.identities?.find((i: any) => i.provider === 'google');
                        const googleId = googleIdentity?.id ||
                            data.user.user_metadata?.provider_id ||
                            data.user.user_metadata?.sub ||
                            data.user.id;

                        await fetch('/api/auth/sync-session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: googleId,
                                supabaseId: data.user.id,
                                email: data.user.email,
                                name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
                                picture: data.user.user_metadata?.avatar_url || ''
                            })
                        });
                    } catch (syncError) {
                        console.warn("⚠️ Failed to sync session:", syncError);
                    }

                    setTimeout(() => {
                        router.push("/dashboard");
                        router.refresh();
                    }, 1000);
                } else {
                    setMessage("Login failed.");
                }

            } else if (view === "signup") {
                // --- Sign Up Logic ---
                const appUrl =
                    process.env.NEXT_PUBLIC_APP_URL ||
                    (typeof window !== "undefined" ? window.location.origin : "");

                const redirectUrl = appUrl
                    ? `${appUrl}/authentication/confirm-email`
                    : undefined;

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: redirectUrl,
                        data: { full_name: fullName },
                    },
                });

                if (signUpError) {
                    if (signUpError.message.includes("User already registered")) {
                        setMessage("This email is already registered. Please sign in or check your email to confirm your account.");
                    } else {
                        setMessage(`Registration Error: ${signUpError.message}`);
                    }
                } else if (data.user) {
                    if (data.session) {
                        setMessage("Registration successful! Redirecting to dashboard...");
                        setTimeout(() => {
                            router.push("/dashboard");
                            router.refresh();
                        }, 1000);
                    } else {
                        setMessage("Registration successful! Please check your email to confirm your account.");
                    }
                } else {
                    setMessage("Registration initiated. Please check your email for confirmation.");
                }
            } else if (view === "forgot") {
                // --- Forgot Password Logic ---
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
                // Typically redirects to a reset password page that handles the token
                const redirectUrl = appUrl ? `${appUrl}/authentication/reset-password?mode=reset` : undefined;

                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: redirectUrl,
                });

                if (error) {
                    setMessage(`Error: ${error.message}`);
                } else {
                    setMessage("Password reset link sent! Check your email.");
                }
            }
        } catch (err: any) {
            setMessage("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const socialOptions = [
        { icon: <AppleIcon />, provider: 'apple', disabled: true },
        { icon: <GoogleIcon />, provider: 'google', disabled: false },
        { icon: <XIcon />, provider: 'twitter', disabled: true }
    ];

    return (
        <div className="relative w-full flex items-center justify-center font-sans">
            <div
                className="relative w-full p-8 space-y-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl dark:shadow-zinc-900/50"
                style={{ maxWidth: '500px', width: '95vw' }}
            >
                {/* Decorative gradient blur behind the card */}
                <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/10 rounded-2xl opacity-50" />

                {/* Close Button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        type="button"
                    >
                        <CloseIcon />
                    </button>
                )}

                {view === "forgot" && (
                    <button
                        onClick={() => { setView("signin"); setMessage(""); }}
                        className="absolute top-8 left-8 p-1 -ml-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        title="Back to login"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                )}

                <div className="text-center space-y-3">
                    <div className="inline-flex p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm">
                        {view === "forgot" ? (
                            <KeyIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        )}

                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                            {view === "signin" && "Welcome back"}
                            {view === "signup" && "Create an account"}
                            {view === "forgot" && "Reset Password"}
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {view === "signin" && "Enter your credentials to access your account"}
                            {view === "signup" && "Enter your details to get started"}
                            {view === "forgot" && "Enter your email to receive a reset link"}
                        </p>
                    </div>
                </div>

                {view !== "forgot" && (
                    <div className="grid grid-cols-3 gap-3">
                        {socialOptions.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                disabled={item.disabled}
                                onClick={() => !item.disabled && handleOAuthSignIn(item.provider as any)}
                                className={`flex items-center justify-center h-10 px-3 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 ${item.disabled
                                    ? "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 opacity-40 cursor-not-allowed grayscale"
                                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md hover:-translate-y-0.5"
                                    }`}
                            >
                                {item.icon}
                            </button>
                        ))}
                    </div>
                )}

                {view !== "forgot" && (
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider">
                            <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-400 dark:text-zinc-500 font-medium">
                                Or continue with email
                            </span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    {view === "signup" && (
                        <div className="space-y-2">
                            <label htmlFor="fullname" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-200">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullname"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 dark:focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-200">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@gmail.com"
                            className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 dark:focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>

                    {view !== "forgot" && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-200">
                                    Password
                                </label>
                                {view === "signin" && (
                                    <button
                                        type="button"
                                        onClick={() => { setView("forgot"); setMessage(""); }}
                                        className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={view === "signin" ? "Enter your password" : "Create a password"}
                                    className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 pr-10 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 dark:focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                    )}

                    {message && <p className={`text-center text-sm font-medium p-3 rounded-lg border ${message.includes("sent") ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20" : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"}`}>{message}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full h-11 flex items-center justify-center rounded-xl text-sm font-semibold text-white shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-70 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/20 hover:-translate-y-0.5 active:translate-y-0 duration-200"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                {view === "signin" && "Sign In"}
                                {view === "signup" && "Sign Up"}
                                {view === "forgot" && "Send Reset Link"}
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-2">
                    {view === "forgot" ? (
                        <button
                            onClick={() => { setView("signin"); setMessage(""); }}
                            className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                            Return to Sign In
                        </button>
                    ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {view === "signin" ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => {
                                    setView(view === "signin" ? "signup" : "signin");
                                    setMessage("");
                                }}
                                className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors focus:outline-none"
                            >
                                {view === "signin" ? "Create an account" : "Sign In"}
                            </button>
                        </p>
                    )}

                </div>

            </div>
        </div>
    );
}
