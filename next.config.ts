import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Firebase user photo domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },

  // Suppress Firebase Admin dynamic require warnings
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
};

export default nextConfig;
