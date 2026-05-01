import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bn/shared'],
  typedRoutes: true,
};

export default config;
