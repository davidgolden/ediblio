const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

outputFolder = 'client/dist/';

module.exports = {
    entry: "./client/src/index.js",
    output: {
        path: path.resolve(__dirname, outputFolder),
        filename: "bundle.js",
    },
    optimization: {
        minimizer: [
            new TerserPlugin(),
            new OptimizeCSSAssetsPlugin({})
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
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
                test: /\.s?css$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    {
                        loader: 'css-loader', options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]_[hash].[ext]'
                        }
                    },
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
};
