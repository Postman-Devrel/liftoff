import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/liftoff",
  trailingSlash: true,
  async redirects() {
    return [
      // Keep existing links to the domain root working.
      { source: "/", destination: "/liftoff", basePath: false, permanent: false },
    ];
  },
};

export default nextConfig;
