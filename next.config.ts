import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  // 允许局域网访问开发服务器（手机测试）
  experimental: {
    allowedDevOrigins: [
      '192.168.31.218',  // WLAN IP
      '192.168.1.100',   // 以太网 IP
    ],
  },
};

export default withNextIntl(nextConfig);
