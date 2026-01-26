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
  serverExternalPackages: ['@libsql/client', 'libsql'],
  // transpilePackages: ['@mastra/core', '@mastra/libsql', '@mastra/memory'],
}

export default nextConfig
