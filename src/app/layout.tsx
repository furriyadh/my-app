import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

// globals
import "./globals.css";

import LayoutProvider from "@/providers/LayoutProvider";
import { CampaignProvider } from "../lib/context/CampaignContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});
  
export const metadata: Metadata = {
  title: "Trezo - Tailwind Nextjs Admin Dashboard Templat",
  description: "Tailwind Nextjs Admin Dashboard Templat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${inter.variable} antialiased`}
      >
        <CampaignProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </CampaignProvider>
      </body>
    </html>
  );
}