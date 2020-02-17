module.exports = {
    apps : [{
        name: "recipecloud",
        script: "./server.js",
        env: {
            NODE_ENV: "production",
        },
    }]
};
