/** @type {import('next').NextConfig} */
const nextConfig = {
  // إعدادات التجريب
  experimental: {
    serverComponentsExternalPackages: [
      'googleapis', 
      'google-auth-library',
      '@supabase/supabase-js'
    ],
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'app.furriyadh.com',
        'furriyadh.com'
      ]
    }
  },

  // متغيرات البيئة المخصصة
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // إعدادات الصور
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mkzwqbgcfdzcqmkgzwgy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // إعدادات الأمان والHeaders
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://app.furriyadh.com,https://furriyadh.com'
              : '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // إعدادات إعادة التوجيه
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: false,
      },
      {
        source: '/signup',
        destination: '/',
        permanent: false,
      },
      {
        source: '/auth',
        destination: '/',
        permanent: false,
      },
      // إعادة توجيه OAuth القديمة
      {
        source: '/api/auth/callback',
        destination: '/api/oauth/callback',
        permanent: true,
      }
    ]
  },

  // إعدادات إعادة الكتابة
  async rewrites() {
    return [
      {
        source: '/api/oauth/callback',
        destination: '/api/oauth/callback'
      },
      {
        source: '/api/google-ads/:path*',
        destination: '/api/google-ads/:path*'
      },
      {
        source: '/api/merchant-center/:path*',
        destination: '/api/merchant-center/:path*'
      }
    ]
  },

  // إعدادات Webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // إضافة fallbacks للـ Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }

    // تحسين bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          google: {
            test: /[\\/]node_modules[\\/](googleapis|google-auth-library)[\\/]/,
            name: 'google-apis',
            chunks: 'all',
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
          }
        }
      }
    }

    return config
  },

  // إعدادات TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // إعدادات ESLint
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src', 'pages', 'components', 'lib', 'utils']
  },

  // إعدادات الضغط
  compress: true,

  // إعدادات PoweredByHeader
  poweredByHeader: false,

  // إعدادات الـ Trailing Slash
  trailingSlash: false,

  // إعدادات الـ Output
  output: 'standalone',

  // إعدادات الـ SWC
  swcMinify: true,

  // إعدادات الـ Compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // إعدادات الـ Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development'
    }
  },

  // إعدادات الـ DevIndicators
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right'
  },

  // إعدادات الـ OnDemandEntries
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // إعدادات الـ Generate Build ID
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },

  // إعدادات الـ Page Extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // إعدادات الـ Sass
  sassOptions: {
    includePaths: ['./src/styles'],
  },

  // إعدادات الـ Modularize Imports
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    }
  },

  // إعدادات الـ Bundle Analyzer (للتطوير)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analyzer-report.html'
          })
        )
      }
      return config
    }
  })
}

module.exports = nextConfig

