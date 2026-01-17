"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Key, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Login from "@/components/ui/login";

// --- Icons ---
// Reusing Lucide icons imported above for this standalone page version

// --- Supabase Hook ---
const useSupabaseClient = () => {
    const [supabase, setSupabase] = useState<any>(null);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('@/utils/supabase/client').then((module) => {
                setSupabase(module.supabase);
            });
        }
    }, []);
    return supabase;
};

// --- Component ---
const ForgotPasswordForm: React.FC = () => {
    const supabase = useSupabaseClient();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        // Strict Gmail Validation matching modal
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            setMessage("Please use a valid Gmail address (Example: name@gmail.com)");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
            const redirectUrl = appUrl ? `${appUrl}/authentication/reset-password?mode=reset` : undefined;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) {
                setMessage(`Error: ${error.message}`);
            } else {
                setIsSuccess(true);
                setMessage("Password reset link sent! Please check your email inbox.");
            }
        } catch (err: any) {
            setMessage("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="relative w-full flex items-center justify-center font-sans py-[60px] md:py-[80px]">
                <div
                    className="relative w-full p-8 space-y-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl dark:shadow-zinc-900/50"
                    style={{ maxWidth: '500px', width: '95vw' }}
                >
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Check Your Inbox</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">{message}</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="inline-block mt-4 text-purple-600 dark:text-purple-400 font-medium hover:underline">
                                    Back to Sign In
                                </button>
                            </DialogTrigger>
                            <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
                                <Login />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full flex items-center justify-center font-sans py-[60px] md:py-[80px]">
            <div
                className="relative w-full p-8 space-y-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl dark:shadow-zinc-900/50"
                style={{ maxWidth: '500px', width: '95vw' }}
            >
                {/* Decorative gradient blur behind the card */}
                <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/10 rounded-2xl opacity-50" />

                <div className="text-center space-y-3">
                    <div className="inline-flex p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm">
                        <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                            Forgot Password?
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Enter your email to receive a reset link
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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

                    {message && <p className="text-center text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">{message}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full h-11 flex items-center justify-center rounded-xl text-sm font-semibold text-white shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-70 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/20 hover:-translate-y-0.5 active:translate-y-0 duration-200"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                Sending...
                            </>
                        ) : "Send Reset Link"}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Sign In
                            </button>
                        </DialogTrigger>
                        <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
                            <Login />
                        </DialogContent>
                    </Dialog>
                </div>

            </div>
        </div>
    );
};

export default ForgotPasswordForm;
