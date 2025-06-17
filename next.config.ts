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
};

export default nextConfig;