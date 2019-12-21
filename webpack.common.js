const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

outputFolder = 'client/dist/';

module.exports = {
    entry: ["./polyfills.js", "./client/src/index.js"],
    output: {
        path: path.resolve(__dirname, outputFolder),
        filename: "bundle.js",
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
                loader: 'babel-loader',
                options: {
                    babelrc: true,
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

            }
        ]
    },

};
