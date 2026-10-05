import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove X-Powered-By header (minor security + bandwidth saving)
  poweredByHeader: false,
  // Enable gzip/brotli compression for all responses
  compress: true,

  async rewrites() {
    return {
      beforeFiles: [
        { source: "/sitemap.xml", destination: "/sitemap.xml" },
        { source: "/robots.txt", destination: "/robots.txt" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async headers() {
    return [
      {
        // Cache the geo detection endpoint — client already caches via cookie,
        // but this prevents duplicate server invocations on CDN edges.
        source: "/api/geo",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        // Cache product search results at the edge for 60s
        source: "/api/products",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      {
        // Static assets — cache aggressively (Next.js already hashes filenames)
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { hostname: "ibb.co" },
      { hostname: "i.ibb.co" },
      { protocol: "https", hostname: "albilaad-ksa.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.samsung.com" },
      // Backend-hosted images (banners, category banners, company logo)
      { protocol: "https", hostname: "masaar-phone-backend.vercel.app" },
      { protocol: "https", hostname: "masar-phone-backend.vercel.app" },
      // Allow any hostname as a fallback for self-hosted backends (dev + prod)
      { protocol: "http", hostname: "localhost", port: "5000" },
    ],
    // Only generate 2 sizes — reduces Image Transformation count
    deviceSizes: [640, 1080],
    imageSizes: [128, 256, 400],
    qualities: [75],
    formats: ["image/webp"],
    // Cache optimized images for 30 days — drastically cuts Image Transformations and Cache Writes
    minimumCacheTTL: 2592000,
  },
};

export default nextConfig;
