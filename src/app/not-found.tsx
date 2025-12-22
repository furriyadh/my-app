"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-4 animate-bounce">
            404
          </div>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>

          <Link
            href="/"
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Go to Homepage
          </Link>

          <Link
            href="/dashboard"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Go to Dashboard
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle size={20} />
            Quick Links
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/authentication/sign-in"
              className="text-blue-600 hover:text-blue-800 text-left py-2 px-3 rounded hover:bg-blue-50 transition-colors duration-200"
            >
              â†’ Sign In
            </Link>
            <Link
              href="/authentication/sign-up"
              className="text-blue-600 hover:text-blue-800 text-left py-2 px-3 rounded hover:bg-blue-50 transition-colors duration-200"
            >
              â†’ Create Account
            </Link>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 text-left py-2 px-3 rounded hover:bg-blue-50 transition-colors duration-200"
            >
              â†’ Dashboard
            </Link>
            <Link
              href="/authentication/forgot-password"
              className="text-blue-600 hover:text-blue-800 text-left py-2 px-3 rounded hover:bg-blue-50 transition-colors duration-200"
            >
              â†’ Reset Password
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help? Contact our{" "}
            <a
              href="mailto:support@furriyadh.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

