"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye as LucideEye,
  EyeOff as LucideEyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  Shield,
  Lock,
  Award
} from "lucide-react";

// --- Icons (Shared Style) ---

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

// --- Password Strength ---
const checkPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

// --- Component ---
const ResetPasswordForm: React.FC = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResetMode = searchParams?.get('mode') === 'reset';

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const validateForm = useCallback(() => {
    if (!isResetMode && !formData.oldPassword.trim()) return "Old password is required";
    if (!formData.newPassword.trim()) return "New password is required";
    if (checkPasswordStrength(formData.newPassword) < 3) return "Password is too weak (mix of letters, numbers, symbols required)";
    if (!formData.confirmPassword.trim()) return "Confirm password is required";
    if (formData.newPassword !== formData.confirmPassword) return "Passwords do not match";
    return null;
  }, [formData, isResetMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const errorMsg = validateForm();
    if (errorMsg) {
      setMessage(errorMsg);
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage("Password updated successfully!");
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (error: any) {
      setMessage(error.message || "An error occurred while updating password");
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
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Password Updated!</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Your password has been changed successfully. Redirecting...</p>
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
        {/* Decorative gradient blur */}
        <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/10 rounded-2xl opacity-50" />

        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm">
            <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              {isResetMode ? "Reset Password" : "Change Password"}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Create a new strong password for your account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isResetMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-200">Old Password</label>
              <div className="relative">
                <input
                  type={showPasswords.old ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  placeholder="Current password"
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 pr-10 text-sm shadow-sm transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 dark:focus-visible:border-purple-500"
                />
                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1">
                  {showPasswords.old ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-200">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="New strong password"
                className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 pr-10 text-sm shadow-sm transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 dark:focus-visible:border-purple-500"
              />
              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1">
                {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {/* Simple Strength Bar */}
            {formData.newPassword && (
              <div className="flex gap-1 h-1 mt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`flex-1 rounded-full transition-colors ${i < checkPasswordStrength(formData.newPassword) ? 'bg-purple-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-200">Confirm Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 pr-10 text-sm shadow-sm transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 dark:focus-visible:border-purple-500"
              />
              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1">
                {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.includes("success") ? "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"}`}>
              {message.includes("success") ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center rounded-xl text-sm font-semibold text-white shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-70 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/20 hover:-translate-y-0.5 active:translate-y-0 duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Updating...
              </>
            ) : "Update Password"}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
