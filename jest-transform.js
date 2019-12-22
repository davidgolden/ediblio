const babelOptions = {
    presets: ['@babel/preset-react', '@babel/preset-env'],
    plugins: [
        "@babel/plugin-transform-runtime",
        ["@babel/plugin-proposal-decorators", {"legacy": true}],
        ["@babel/plugin-proposal-class-properties", {"loose": true}],
        "@babel/plugin-proposal-optional-chaining",
    ],
};

module.exports = require('babel-jest').createTransformer(babelOptions);
