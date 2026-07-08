import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist", "razorpay"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  // OneDrive/synced folders corrupt webpack's disk cache — disable in dev
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
      // First compile of large client chunks can exceed the default timeout on slow/synced disks
      if (!isServer) {
        config.output = { ...config.output, chunkLoadTimeout: 120000 };
      }
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Permissions-Policy", value: "display-capture=(), screen-wake-lock=()" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
