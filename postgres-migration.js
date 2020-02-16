require('dotenv').config({path: './.env'});
const mongoose = require('mongoose');
const User = require('./models/user');
const Recipe = require("./models/recipe");
const Collection = require("./models/collection");
const Rating = require("./models/rating");

const db = require("./db/index");

async function populate() {
    await mongoose.connect(1 ? process.env.MONGO : process.env.MONGO_DEV,
        {useNewUrlParser: true, autoIndex: false, useCreateIndex: true});

    const users = await User.find({});

    await db.query(`INSERT INTO measurements (short_name, long_name, long_name_plural, type) VALUES
            ('tsp', 'teaspoon', 'teaspoons', 'volume'),
            ('tbsp', 'tablespoon', 'tablespoons', 'volume'),
            ('pt', 'pint', 'pints', 'volume'),
            ('fl oz', 'fluid ounce', 'fluid ounces', 'volume'),
            ('qt', 'quart', 'quarts', 'volume'),
            ('oz', 'ounce', 'ounces', 'weight'),
            ('ml', 'milliliter', 'milliliters', 'volume'),
            ('lb', 'pound', 'pounds', 'weight'),
            ('gal', 'gallon', 'gallons', 'volume'),
            ('l', 'liter', 'liters', 'volume'),
            ('cup', 'cup', 'cups', 'volume'),
            ('g', 'gram', 'grams', 'weight'),
            ('#', '#', '', 'amount')`);

    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        const userRes = await db.query({
            text: `INSERT INTO users (username, email, profile_image, password)
                        VALUES ($1, $2, $3, $4) RETURNING *`,
            values: [user.username, user.email, user.profileImage, user.password]
        });

        await db.query({
            text: `INSERT INTO collections (name, author_id, is_primary) VALUES ($1, $2, $3)`,
            values: ['Favorites', userRes.rows[0].id, true]
        });

        // add all user's created recipes
        await Recipe.find({author_id: user._id}, async (err, recipes) => {
            for (let i = 0; i < recipes.length; i++) {
                const recipe = recipes[i];

                const recipeRes = await db.query({
                    text: 'INSERT INTO recipes (name, url, notes, image, author_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    values: [recipe.name, recipe.url, recipe.notes, recipe.image, userRes.rows[0].id, recipe.created_at],
                });

                for (let x = 0; x < recipe.ingredients.length; x++) {
                    const ing = recipe.ingredients[x];

                    await db.query({
                        text: 'INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity) VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4)',
                        values: [recipeRes.rows[0].id, ing.name, ing.measurement ? ing.measurement : "#", Number(ing.quantity)]
                    })
                }
            }
        });
    }

    const ratings = await Rating.find({})
        .populate('recipe_id')
        .populate('author_id');

    for (let x = 0; x < ratings.length; x++) {
        const recipeRes = await db.query({
            text: 'SELECT id FROM recipes WHERE name = $1',
            values: [ratings[x].recipe_id.name]
        });
        const userRes = await db.query({
            text: 'SELECT id FROM users WHERE email = $1',
            values: [ratings[x].author_id.email]
        });
        await db.query({
            text: 'INSERT INTO ratings (recipe_id, author_id, rating) VALUES ($1, $2, $3)',
            values: [recipeRes.rows[0].id, userRes.rows[0].id, ratings[x].rating],
        })
    }

    const collections = await Collection.find({})
        .populate('recipes')
        .populate('ownerId')

    for (let i = 0; i < collections.length; i++) {
        const userRes = await db.query({
            text: 'SELECT id FROM users where email = $1',
            values: [collections[i].ownerId.email]
        });

        const collectionRes = await db.query({
            text: 'INSERT INTO collections (name, author_id) VALUES ($1, $2) RETURNING *',
            values: [collections[i].name, userRes.rows[0].id],
        });

        for (let x = 0; x < collections[i].recipes.length; x++) {
            const recipe = collections[i].recipes[x];
            const recipeRes = await db.query({
                text: 'SELECT id FROM recipes WHERE name = $1',
                values: [recipe.name],
            });

            await db.query({
                text: 'INSERT INTO recipes_collections (collection_id, recipe_id) VALUES ($1, $2)',
                values: [collectionRes.rows[0].id, recipeRes.rows[0].id]
            })
        }
    }
}

async function create() {
    await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE users (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        profile_image TEXT,
        password TEXT NOT NULL,
        reset_token TEXT,
        token_expires TIMESTAMP
    );
    CREATE TABLE measurements (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        short_name TEXT NOT NULL UNIQUE,
        long_name TEXT NOT NULL UNIQUE,
        long_name_plural TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL
    );
    CREATE TABLE collections (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        name TEXT NOT NULL,
        author_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT false
    );
    CREATE TABLE recipes (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name TEXT NOT NULL,
        url TEXT,
        notes TEXT,
        image TEXT,
        author_id UUID REFERENCES users(id) ON DELETE NO ACTION
    );
    CREATE TABLE recipes_collections (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
        recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
        UNIQUE (recipe_id, collection_id)
    );
    CREATE TABLE recipes_ingredients (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
        quantity NUMERIC NOT NULL,
        name TEXT NOT NULL,
        measurement_id UUID REFERENCES measurements(id) ON DELETE CASCADE NOT NULL
    );
    CREATE TABLE users_recipes_menu (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        deleted BOOLEAN DEFAULT FALSE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE TABLE users_ingredients_groceries (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        deleted BOOLEAN DEFAULT FALSE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        measurement_id UUID REFERENCES measurements(id) ON DELETE CASCADE NOT NULL,
        quantity NUMERIC NOT NULL
    );
    CREATE TABLE users_collections_followers (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
        UNIQUE (user_id, collection_id)
    );
    CREATE TABLE ratings (
        id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v1(),
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
        author_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rating NUMERIC NOT NULL,
        UNIQUE (recipe_id, author_id)
    );
`);
}

create()
    .then(() => console.log('created'))
    .then(populate)
    .then(() => console.log('populated'));
// after running this must run  psql recipecloud -p 5433 < node_modules/connect-pg-simple/table.sql to get sessions working
