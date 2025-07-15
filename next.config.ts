import type { NextConfig } from "next";
import * as path from 'path';
import { fileURLToPath } from 'url';

// إصلاح مشكلة __dirname في ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  // ✅ تم إزالة output: 'export' لحل مشكلة prerender error
  // ❌ output: 'export', // هذا السطر كان يسبب:
  // - Error occurred prerendering page '/_not-found'
  // - Cannot find module '@/utils/supabase/client'
  // - مشاكل مع dynamic imports والـ Supabase client
  // 💡 الحل: إزالة static export لتمكين server-side features
  
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // إعدادات TypeScript
  typescript: {
    ignoreBuildErrors: false, // إظهار أخطاء TypeScript للتشخيص
  },
  
  // إعدادات ESLint
  eslint: {
    ignoreDuringBuilds: true, // تجاهل أخطاء ESLint أثناء البناء
  },
  
  // إعدادات Sass
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },

  // إعدادات Webpack لحل مشاكل الاستيراد
  webpack: (config, { isServer }) => {
    // ✅ إضافة webpack aliases لحل مشكلة '@/utils/supabase/client'
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

    // تجاهل ملفات Supabase functions
    config.module.rules.push({
      test: /\.ts$/,
      include: path.resolve(__dirname, 'supabase', 'functions'),
      loader: 'null-loader',
    });

    // إعدادات fallback للوحدات المفقودة
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // تقليل التحذيرات غير المهمة
    config.ignoreWarnings = [
      /Critical dependency/,
    ];

    // إعدادات خاصة بالخادم
    if (isServer) {
      config.externals = [...(config.externals || []), /^https?:\/\//, /supabase\/.*/];
    }
    
    return config;
  },
  
  // إعدادات الأداء
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // إعدادات تجريبية
  experimental: {
    // إعدادات متوافقة مع Turbopack
  },
  
  // تحسين الأداء في الإنتاج
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // إعدادات إضافية
  productionBrowserSourceMaps: false,
  
  // إعدادات إعادة التوجيه
  async rewrites() {
    return [];
  },
};

export default nextConfig;

