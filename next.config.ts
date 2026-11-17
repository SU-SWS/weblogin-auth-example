import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /guide page reads these files at request time to show real code
  outputFileTracingIncludes: {
    '/guide': [
      './lib/saml-config.ts',
      './lib/auth.ts',
      './app/api/auth/**/route.ts',
      './app/api/protected/route.ts',
      './proxy.ts',
      './netlify.toml',
    ],
  },
  env: {
    CONTEXT: process.env.CONTEXT,
    DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
    URL: process.env.URL,
    WEBLOGIN_AUTH_SESSION_SECRET: process.env.WEBLOGIN_AUTH_SESSION_SECRET, // Only gets inlined on server side as long as we only use it on the server.
  },
};

export default nextConfig;
