const withSass = require('@zeit/next-sass');
const withCSS = require('@zeit/next-css');
const withOffline = require('next-offline');

const CACHE_NAME = "1.0.0";

module.exports = withCSS(withSass(withOffline({
    cssModules: true,
    cssLoaderOptions: {
        localIdentName: '[local]_[hash:base64:5]',
    },
    generateInDevMode: true,
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

        const originalEntry = config.entry;
        config.entry = async () => {
            const entries = await originalEntry();

            if (
                entries['main.js'] &&
                !entries['main.js'].includes('./polyfills.js')
            ) {
                entries['main.js'].unshift('./polyfills.js')
            }

            return entries
        }

        return config;
    },
    workboxOpts: {
        runtimeCaching: [{
            urlPattern: /\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: CACHE_NAME + "-pages",
                expiration: {
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        }]
    }
})));
