import type { NextConfig } from "next";

// تحميل متغيرات البيئة حسب البيئة
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: envFile });

const nextConfig: NextConfig = {
  // تكوين بسيط وآمن
  trailingSlash: false,
  images: {
    unoptimized: true,
    domains: [
      'furriyadh.com',
      'www.furriyadh.com',
      'localhost',
      'flagcdn.com',
      'play-lh.googleusercontent.com',  // Google Play app icons
      'lh3.googleusercontent.com',       // Google general images
    ],
  },
  // Fix Spline/ESM module issues
  transpilePackages: ['@splinetool/react-spline', '@splinetool/runtime'],

  // إعدادات البيئة
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
    // إضافة متغيرات Supabase للبناء
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // إعدادات الإنتاج
  ...(process.env.NODE_ENV === 'production' && {
    // output: 'standalone', // معطل لحل مشكلة symlink في Windows
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
  }),

  // إعدادات مرنة للتطوير
  typescript: {
    ignoreBuildErrors: true, // مؤقت لحل مشاكل TypeScript
  },

  eslint: {
    ignoreDuringBuilds: true, // مؤقت لحل مشاكل ESLint
  },


  // إعدادات محسنة للـ webpack (تحسين السرعة)
  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // تحسين الأداء في development mode
    if (dev) {
      config.cache = {
        type: 'filesystem',
      };

      // تقليل عدد workers في development
      config.parallelism = 1;

      // تحسين resolve
      config.resolve.symlinks = false;
    }

    return config;
  },


  // تحسينات إضافية للـ performance
  experimental: {
    // optimizeCss: true, // تعطيل مؤقت لحل مشكلة critters
    // إصلاح مشكلة clientReferenceManifest
    serverActions: {
      allowedOrigins: ['localhost:3000', 'furriyadh.com'],
    },
  },

  // تكوين turbopack الجديد
  turbopack: {
    rules: {
      '*.js': ['swc-loader'],
      '*.tsx': ['swc-loader'],
      '*.ts': ['swc-loader'],
    },
  },

  // Rewrites to proxy requests to Python Backend
  async rewrites() {
    return [
      {
        source: '/api/youtube/:path*',
        destination: 'http://127.0.0.1:5000/api/youtube/:path*',
      },
      {
        source: '/api/ai-campaign/:path*',
        destination: 'http://127.0.0.1:5000/api/ai-campaign/:path*',
      },
      {
        source: '/api/ai-campaign-flow/:path*',
        destination: 'http://127.0.0.1:5000/api/ai-campaign-flow/:path*',
      },
      {
        source: '/api/user/accounts',
        destination: 'http://127.0.0.1:5000/api/user/accounts',
      },
      // Add other backend routes if needed (merchant, gtm, etc.)
      {
        source: '/api/merchant/:path*',
        destination: 'http://127.0.0.1:5000/api/merchant/:path*',
      },
      {
        source: '/api/gtm/:path*',
        destination: 'http://127.0.0.1:5000/api/gtm/:path*',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://127.0.0.1:5000/api/analytics/:path*',
      }
    ];
  },
};

export default nextConfig;