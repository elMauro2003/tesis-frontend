import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/reports",
        destination: "/dashboard/reportes",
        permanent: true,
      },
      {
        source: "/dashboard/buildings",
        destination: "/dashboard/edificios",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
