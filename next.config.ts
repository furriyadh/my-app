import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// استدعاء الـ plugin وتحديد مسار ملف إعدادات الطلب
const withNextIntl = createNextIntlPlugin(
  './src/i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['shown.io'],
  },
  // تكوين المسارات الثابتة للأصول
  async rewrites() {
    return [
      {
        source: '/favicons/:path*',
        destination: '/public/favicons/:path*',
      },
      {
        source: '/assets/:path*',
        destination: '/public/assets/:path*',
      },
      {
        source: '/static/:path*',
        destination: '/public/static/:path*',
      },
    ];
  },
};

// تصدير الإعدادات بعد دمجها مع next-intl
export default withNextIntl(nextConfig);
