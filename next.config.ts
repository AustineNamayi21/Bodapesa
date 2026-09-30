import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-postgres optionally loads a native binding (pg-native) that bundlers
  // try to resolve. Keeping pg external leaves it to Node's own resolver.
  serverExternalPackages: ["pg"],

  // Photos come from Unsplash's CDN, which resizes on request (see image-loader.ts).
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
