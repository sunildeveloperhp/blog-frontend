import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Laravel allows 2 MB images. The extra room is for the other form fields.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;