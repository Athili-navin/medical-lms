import type { NextConfig } from "next";

const PDFJS_TRACE_PATHS = ["./node_modules/pdfjs-dist/**"];
const CANVAS_TRACE_PATHS = [
  "./node_modules/@napi-rs/canvas/**",
  "./node_modules/@napi-rs/canvas-linux-x64-gnu/**",
  "./node_modules/@napi-rs/canvas-linux-x64-musl/**",
];

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "@opentelemetry/api",
    "pdfjs-dist",
    "razorpay",
  ],
  outputFileTracingIncludes: {
    "/api/pdfs/page": [...PDFJS_TRACE_PATHS, ...CANVAS_TRACE_PATHS],
    "/api/pdfs/info": [...PDFJS_TRACE_PATHS, ...CANVAS_TRACE_PATHS],
    "/api/pdfs/view": [...PDFJS_TRACE_PATHS, ...CANVAS_TRACE_PATHS],
  },
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
