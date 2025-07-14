import type { NextConfig } from "next";
import * as path from 'path';
import { fileURLToPath } from 'url';

// إصلاح مشكلة __dirname في ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  // Removed static export to enable middleware and server-side features
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // تجاهل أخطاء TypeScript أثناء البناء (مؤقتاً حتى يتم حل مشاكل الاستيراد)
  typescript: {
    ignoreBuildErrors: false, // تم تغييرها لـ false لرؤية أخطاء الاستيراد
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
    // إضافة webpack aliases لحل مشاكل الاستيراد
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/providers': path.resolve(__dirname, 'src/providers'),
    };

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

    // تقليل تحذيرات الوحدات (لكن الاحتفاظ بأخطاء الاستيراد المهمة)
    config.ignoreWarnings = [
      /Critical dependency/,
      // إزالة "Module not found" و "Can't resolve" لرؤية مشاكل الاستيراد
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
    // تم إزالة forceSwcTransforms لأنه غير متوافق مع Turbopack
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

