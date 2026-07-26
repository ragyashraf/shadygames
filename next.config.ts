import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: false },
      { source: '/account.html', destination: '/login', permanent: false },
      { source: '/dashboard.html', destination: '/dashboard', permanent: false },
      { source: '/staff.html', destination: '/staff', permanent: false },
      { source: '/checkout.html', destination: '/pricing', permanent: false },
      { source: '/tiktok-games.html', destination: '/games', permanent: false },
    ];
  },
};

export default nextConfig;
