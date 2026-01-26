import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@libsql/client': 'commonjs @libsql/client',
        'libsql': 'commonjs libsql',
      });
    }
    return config;
  },
  transpilePackages: ['@mastra/core', '@mastra/libsql', '@mastra/memory'],
  // 在构建时忽略 ESLint 错误（生产环境建议修复这些错误）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 在构建时忽略 TypeScript 错误（生产环境建议修复这些错误）
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
