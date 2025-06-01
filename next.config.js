// No need for NextConfig import or type annotation
const createNextIntlPlugin = require("next-intl/plugin");

// استدعاء الـ plugin وتحديد مسار ملف إعدادات الطلب
const withNextIntl = createNextIntlPlugin(
  "./src/i18n.ts"
);

/** @type {import("next").NextConfig} */
// إعدادات مبسطة جداً
const nextConfig = {
  reactStrictMode: true,
  // تم إزالة إعدادات images و rewrites للتبسيط
};

// تصدير الإعدادات بعد دمجها مع next-intl
module.exports = withNextIntl(nextConfig);
