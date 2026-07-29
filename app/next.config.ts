import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        // Optimized variants are safe to retain because thumbnail changes use
        // a new source filename.
        minimumCacheTTL: 31_536_000,
    },
    async headers() {
        const immutableAssetHeaders = [
            {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
            },
        ];

        return [
            {
                source: "/geojson/:path*",
                headers: immutableAssetHeaders,
            },
            {
                source: "/thumbnails/:path*",
                headers: immutableAssetHeaders,
            },
        ];
    },
};

export default nextConfig;
