import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
};

export default nextConfig;
