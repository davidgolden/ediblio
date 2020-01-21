require('dotenv').config({path: './.env'});
const {Pool} = require('pg');
const mongoose = require('mongoose');
const User = require('./models/user');
const Recipe = require("./models/recipe");

const pool = new Pool();

function populate() {
    mongoose.connect(1 ? process.env.MONGO : process.env.MONGO_DEV,
        {useNewUrlParser: true, autoIndex: false, useCreateIndex: true})
        .then(async () => {

            User.find({}, async (err, users) => {
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    const userRes = await pool.query(`
                    INSERT INTO users (username, email, profile_image, password)
                    VALUES ('${user.username}', '${user.email}', '${user.profileImage}', '${user.password}') RETURNING *;
                `);

                    await Recipe.find({author_id: user._id}, async (err, recipes) => {
                        for (let i = 0; i < recipes.length; i++) {
                            const recipe = recipes[i];

                            const recipeRes = await pool.query({
                                text: 'INSERT INTO recipes (name, url, notes, image, author_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                                values: [recipe.name, recipe.url, recipe.notes, recipe.image, userRes.rows[0].id, recipe.created_at],
                            });

                            for (let x = 0; x < recipe.ingredients.length; x++) {
                                const ing = recipe.ingredients[x];
                                await pool.query({
                                    text: 'INSERT INTO ingredients (name, quantity, measurement, recipe_id) VALUES ($1, $2, $3, $4)',
                                    values: [ing.name, ing.quantity, ing.measurement, recipeRes.rows[0].id],
                                });
                            }
                        }
                    })
                }
            });
        })
        .catch(err => console.log(`Database connection error: ${err.message}`));
}

function create() {
    pool.query(`
    CREATE TABLE users (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        profile_image TEXT,
        password TEXT NOT NULL,
        reset_token TEXT,
        token_expires TIMESTAMP
    );
    CREATE TABLE collections (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        name TEXT NOT NULL,
        author_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE recipes (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name TEXT NOT NULL,
        url TEXT,
        notes TEXT,
        image TEXT,
        author_id BIGSERIAL REFERENCES users(id) ON DELETE NO ACTION
    );
    CREATE TABLE ingredients (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        recipe_id BIGSERIAL REFERENCES recipes(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        quantity TEXT NOT NULL,
        measurement TEXT NOT NULL
    );
    CREATE TABLE users_menu_recipe (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        user_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE,
        recipe_id BIGSERIAL REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE TABLE users_grocerylist_recipe (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        user_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE,
        ingredient_id BIGSERIAL REFERENCES ingredients(id) ON DELETE CASCADE
    );
    CREATE TABLE users_collections (
        user_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE,
        collection_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE ratings (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        recipe_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE,
        author_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE,
        rating INT NOT NULL
    );
`, (err, res) => {
        if (err) {
            return console.log('err: ', err);
        }
        console.log('success');
    });

}

async function reset() {
    await pool.query(`
        DELETE FROM recipes;
        DELETE FROM users;
        DELETE FROM ingredients;
    `)
}

// create();
reset()
    .then(populate);
