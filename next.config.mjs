const CACHE_NAME = "1.0.0";

import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
    enabled: process.env.ANALYZE,
});

const nextConfig = {
    publicRuntimeConfig: {
        CDN_URL: process.env.CDN_URL,
    },
    // generateInDevMode: true,
    webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
        config.module.rules.push({
            test: /\.(png|jpg|gif)$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192
                    }
                }
            ]
        });

        // config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ }))

        return config;
    },
    // workboxOpts: {
    //     runtimeCaching: [{
    //         urlPattern: /\.(eot|woff|woff2|ttf|ttc|png|svg|jpg|jpeg|gif|cgm|tiff|webp|bmp|ico)$/i,
    //         handler: 'CacheFirst',
    //         options: {
    //             cacheName: CACHE_NAME + "-media",
    //             expiration: {
    //                 maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    //             },
    //             cacheableResponse: {
    //                 statuses: [200],
    //             },
    //         },
    //     }, {
    //         urlPattern: /.*$/,
    //         handler: 'NetworkFirst',
    //         options: {
    //             cacheName: CACHE_NAME + "-pages",
    //             expiration: {
    //                 maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    //             },
    //             cacheableResponse: {
    //                 statuses: [200],
    //             },
    //         },
    //     }]
    // }
};

export default nextConfig;