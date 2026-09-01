import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        // Optimized variants are safe to retain because thumbnail changes use
        // a new source filename.
        minimumCacheTTL: 31_536_000,
    },
    async headers() {
        const geoJsonAssetHeaders = [
            {
                key: "Cache-Control",
                value: isDevelopment
                    ? "no-store"
                    : "public, max-age=31536000, immutable",
            },
        ];
        const immutableAssetHeaders = [
            {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
            },
        ];

        return [
            {
                source: "/geojson/:path*",
                headers: geoJsonAssetHeaders,
            },
            {
                source: "/thumbnails/:path*",
                headers: immutableAssetHeaders,
            },
        ];
    },
};

export default nextConfig;
