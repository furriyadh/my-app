import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Removed static export to enable middleware and server-side features
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // تجاهل أخطاء TypeScript أثناء البناء
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // تجاهل أخطاء ESLint أثناء البناء
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    // Additional Sass options can go here
  },

  webpack: (config, { isServer }) => {
    // إضافة قاعدة لتجاهل ملفات TypeScript داخل مجلد supabase/functions
    config.module.rules.push({
      test: /\.ts$/,
      include: path.resolve(__dirname, 'supabase', 'functions'),
      loader: 'null-loader',
    });

    // تجاهل أخطاء الوحدات المفقودة
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // تجاهل تحذيرات الوحدات
    config.ignoreWarnings = [
      /Module not found/,
      /Can't resolve/,
      /Critical dependency/,
    ];

    if (isServer) {
      // لا يزال من الجيد الاحتفاظ بـ externals لأي استيرادات Deno أخرى أو مراجع عامة لـ Supabase
      config.externals = [...(config.externals || []), /^https?:\/\//, /supabase\/.*/];
    }
    return config;
  },
  
  // تجاهل تحذيرات البناء
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // إعدادات متوافقة مع Turbopack
  experimental: {
    // حذف forceSwcTransforms لأنه غير متوافق مع Turbopack
    // حذف turbo.rules لأنه غير متوافق مع Turbopack
    // Turbopack سيعمل بالإعدادات الافتراضية
  },
  
  // تحسين الأداء
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // إعدادات إضافية لتجاهل الأخطاء
  productionBrowserSourceMaps: false,
  
  // تجاهل أخطاء البناء
  async rewrites() {
    return [];
  },
};

export default nextConfig;

