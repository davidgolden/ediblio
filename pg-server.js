const { Pool } = require('pg');

const pool = new Pool();

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
    CREATE TABLE ingredients (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        quantity INT NOT NULL,
        measurement TEXT NOT NULL
    );
    CREATE TABLE recipes (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        name TEXT NOT NULL,
        url TEXT,
        notes TEXT,
        image TEXT,
        author_id BIGSERIAL REFERENCES users(id) ON DELETE NO ACTION
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
    CREATE TABLE recipe_ingredient (
        recipe_id BIGSERIAL REFERENCES recipes(id) ON DELETE CASCADE,
        ingredient_id BIGSERIAL REFERENCES ingredients(id) ON DELETE CASCADE
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
