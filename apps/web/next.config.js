import { env } from "next-runtime-env";
import { configureRuntimeEnv } from "next-runtime-env/build/configure.js";

configureRuntimeEnv();

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/settings",
        destination: "/settings/account",
      },
    ];
  },
};

// Only allow external images when OIDC is configured (for OIDC provider avatars)
if (
  env("OIDC_CLIENT_ID") &&
  env("OIDC_CLIENT_SECRET") &&
  env("OIDC_DISCOVERY_URL")
) {
  config.images?.remotePatterns?.push({
    protocol: "https",
    hostname: "**",
  });
}

export default config;
