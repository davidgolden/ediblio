module.exports = {
    stories: ['../client/**/*.stories.js[x]'],
    webpackFinal: config => {
        config.module.rules.push({
            test: /\.scss$/,
            use: ['style-loader', {
                loader: 'css-loader',
                options: {
                    modules: true,
                }
            }, 'sass-loader'],
        });

        return config;
    }
};
