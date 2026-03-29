import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Default is 1MB; post cover uploads allow up to 5MB (see post-cover-upload.ts).
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
