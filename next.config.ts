import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Removed static export to enable middleware and server-side features
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
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

    if (isServer) {
      // لا يزال من الجيد الاحتفاظ بـ externals لأي استيرادات Deno أخرى أو مراجع عامة لـ Supabase
      config.externals = [...(config.externals || []), /^https?:\/\//, /supabase\/.*/];
    }
    return config;
  },
};

export default nextConfig;
