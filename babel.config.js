const progressiveTargets = {
    "chrome": "79",
    "edge": "76",
    "safari": "13",
    "firefox": "70",
    "node": true,
};

module.exports = function(api) {
    api.cache(true);

    return {
        presets: [['@babel/preset-env', {
            "modules": false,
            "useBuiltIns": "entry",
            "corejs": 3,
            "targets": progressiveTargets,

        }], '@babel/preset-react'],
        plugins: [
            "@babel/plugin-transform-runtime",
            ["@babel/plugin-proposal-decorators", {"legacy": true}],
            ["@babel/plugin-proposal-class-properties", {"loose": true}],
            "@babel/plugin-proposal-optional-chaining",
        ],
    }
};
