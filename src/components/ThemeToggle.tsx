"use client";

import React from "react";
import { useTheme } from "../providers/ThemeProvider";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <span className="material-symbols-outlined text-yellow-500 text-[24px]">
                    light_mode
                </span>
            ) : (
                <span className="material-symbols-outlined text-gray-700 text-[24px]">
                    dark_mode
                </span>
            )}
        </button>
    );
}
