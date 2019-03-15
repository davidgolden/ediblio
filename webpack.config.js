var webpack = require('webpack');
const path = require('path');

outputFolder = 'dist/';

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, outputFolder),
        filename: "bundle.js",
        // publicPath: '/public/'
    },
    // optimization: {
    //     splitChunks: {
    //         chunks: "all"
    //     }
    // },
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
        // new ExtractTextPlugin({filename: 'app.css', allChunks: true}),
        // new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        historyApiFallback: true,
        // contentBase: './'
        // contentBase: path.join(__dirname, 'dist'),
        compress: true,
        // port: 9000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                pathRewrite: {'^/api': ''},
            }
        }
    }
};
