const withSass = require('@zeit/next-sass');
const withCSS = require('@zeit/next-css');

module.exports = withCSS(withSass({
    cssModules: true,
    cssLoaderOptions: {
        // url: false, // otherwise not resolving url(image.png) -> url(./image.png)
        // exportOnlyLocals: false,
        localIdentName: '[local]_[hash:base64:5]',
    },
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
}));
