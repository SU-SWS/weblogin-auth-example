import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    CONTEXT: process.env.CONTEXT,
    DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
    URL: process.env.URL,
  },
};

export default nextConfig;
