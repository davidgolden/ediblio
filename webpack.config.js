const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

outputFolder = 'client/dist/';

module.exports = {
    entry: "./client/src/index.js",
    output: {
        path: path.resolve(__dirname, outputFolder),
        filename: "bundle.js",
        // publicPath: '/public/'
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js|.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                options: {
                    plugins: [['@babel/plugin-proposal-decorators', {
                        legacy: true,
                    }], ["@babel/plugin-proposal-class-properties", {"loose": true}],],
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    {loader: 'css-loader', options: {modules: true, importLoaders: 1}},
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     template: './index.html',
        //     // favicon: './public/favicon.ico'
        // }),
    ]
    // devServer: {
    //     historyApiFallback: true,
    //     compress: true,
    //     proxy: {
    //         '/api': {
    //             target: 'http://localhost:5000',
    //             pathRewrite: {'^/api': ''},
    //         }
    //     }
    // }
};
