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
  // Dynamic: Railway in production, localhost in development
  async rewrites() {
    const BACKEND_URL = process.env.NODE_ENV === 'production'
      ? (process.env.RAILWAY_BACKEND_URL || 'https://my-app-production-28d2.up.railway.app')
      : 'http://127.0.0.1:5000';

    console.log(`[next.config] Backend URL: ${BACKEND_URL} (env: ${process.env.NODE_ENV})`);

    return [
      {
        source: '/api/youtube/:path*',
        destination: `${BACKEND_URL}/api/youtube/:path*`,
      },
      {
        source: '/api/ai-campaign/:path*',
        destination: `${BACKEND_URL}/api/ai-campaign/:path*`,
      },
      {
        source: '/api/ai-campaign-flow/:path*',
        destination: `${BACKEND_URL}/api/ai-campaign-flow/:path*`,
      },
      {
        source: '/api/user/accounts',
        destination: `${BACKEND_URL}/api/user/accounts`,
      },
      // Add other backend routes if needed (merchant, gtm, etc.)
      {
        source: '/api/merchant/:path*',
        destination: `${BACKEND_URL}/api/merchant/:path*`,
      },
      {
        source: '/api/gtm/:path*',
        destination: `${BACKEND_URL}/api/gtm/:path*`,
      },
      {
        source: '/api/analytics/:path*',
        destination: `${BACKEND_URL}/api/analytics/:path*`,
      },
      // ⚡ Zero-Latency Neuro-Link: Status Check Route
      {
        source: '/api/check-link-status/:path*',
        destination: `${BACKEND_URL}/api/check-link-status/:path*`,
      },
      // 🧪 Test Endpoint for Socket Simulation
      {
        source: '/api/test/:path*',
        destination: `${BACKEND_URL}/api/test/:path*`,
      },
      // ⚡ Webhooks Rewrite - Critical for Pub/Sub Push
      {
        source: '/api/webhooks/:path*',
        destination: `${BACKEND_URL}/api/webhooks/:path*`,
      },
      // ⚡ SSE Endpoint for Real-time Status Updates
      {
        source: '/api/account-status-stream',
        destination: `${BACKEND_URL}/api/account-status-stream`,
      },
      // 🏥 Neuro-Link Health Check
      {
        source: '/api/neuro-link/:path*',
        destination: `${BACKEND_URL}/api/neuro-link/:path*`,
      },
      // Stripe API Proxy
      {
        source: '/api/stripe/:path*',
        destination: `${BACKEND_URL}/api/stripe/:path*`,
      },
      // Socket.IO Proxy (for production)
      {
        source: '/socket.io/:path*',
        destination: `${BACKEND_URL}/socket.io/:path*`,
      }
    ];
  },
};

export default nextConfig;