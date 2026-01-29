import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// Force rebuild

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD", options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...options,
  }).format(amount);
}

export function formatLargeNumber(num: number): string {
  if (!num) return "0";

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }

  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }

  return num.toLocaleString();
}

export function generateUniqueId(prefix: string = "id") {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function formatDate(date: number | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}