import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/api", "@repo/db", "@repo/shared"],
  serverExternalPackages: ["libsql", "@libsql/client"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize libsql native modules for server
      config.externals = [...(config.externals || []), "libsql"];
    }
    return config;
  },
};

export default nextConfig;
