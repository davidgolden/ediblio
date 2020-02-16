const express = require('express'),
    router = express.Router(),
    {hashPassword} = require("../utils"),
    middleware = require('../middleware');

const cloudinary = require('cloudinary');
const {usersSelector} = require("../utils");

const db = require("../db/index");
const {Pool} = require('pg');
const pool = new Pool();

cloudinary.config({
    cloud_name: 'recipecloud',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

router.route('/users')
    // get all users
    .get(async (req, res) => {
        const response = await db.query({
            text: `SELECT profile_image, username FROM users`
        });
        return res.status(200).send({users: response.rows});
    })
    // create new user (register)
    .post(async (req, res) => {
        try {
            const response = await db.query({
                text: `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *`,
                values: [req.body.username, req.body.email.toLowerCase(), await hashPassword(req.body.password)]
            });

            // create a favorites collection
            await db.query({
                text: `INSERT INTO collections (name, author_id, is_primary) VALUES ($1, $2, $3)`,
                values: ['Favorites', response.rows[0].id, true]
            });

            req.login(response.rows[0], function () {
                res.status(200).json({user: req.user});
            });

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/users/:user_id/recipes')
    .get(middleware.isLoggedIn, async (req, res) => {
        // get menu
        try {
            const response = await db.query({
                text: `
                SELECT * FROM recipes
                WHERE recipes.id IN (
                    SELECT recipe_id FROM users_recipes_menu
                    WHERE users_recipes_menu.user_id = $1
                );`,
                values: [req.user.id]
            });

            res.status(200).send({menu: response.rows});

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .delete(middleware.isLoggedIn, async (req, res) => {
        // remove list of recipes from menu
        try {
            await db.query({
                text: `
                DELETE FROM users_recipes_menu
                WHERE recipe_id IN (${req.body.recipe_ids.map(id => "'" + id + "'").join(", ")})
                `,
            });

            res.sendStatus(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/users/:user_id/ingredients')
    .post(middleware.isLoggedIn, async (req, res) => {
        // add ingredient to grocery list
        try {
            const response = await db.query({
                text: `
                INSERT INTO users_ingredients_groceries (user_id, name, measurement_id, quantity)
                VALUES ($1,
                    $2,
                    (SELECT id FROM measurements WHERE short_name = $3),
                    $4
                ) RETURNING *`,
                values: [req.user.id, req.body.name, req.body.measurement, req.body.quantity],
            });

            return res.status(200).send(response.rows[0]);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .get(middleware.isLoggedIn, async (req, res) => {
        // get grocery list
        try {
            const response = await db.query({
                text: `
                SELECT users_ingredients_groceries.id, users_ingredients_groceries.quantity, users_ingredients_groceries.name, m.short_name measurement
                FROM users_ingredients_groceries
                LEFT JOIN LATERAL (
                    SELECT short_name FROM measurements
                    WHERE measurements.id = users_ingredients_groceries.measurement_id
                ) m ON true
                WHERE users_ingredients_groceries.user_id = $1;`,
                values: [req.user.id],
            });

            res.status(200).send({groceryList: response.rows});
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .delete(middleware.isLoggedIn, async (req, res) => {
        // remove list of ingredients from grocery list
        try {
            await db.query({
                text: `
                DELETE FROM users_ingredients_groceries
                WHERE id IN (${req.body.ingredient_ids.map(id => "'" + id + "'").join(", ")})
                `,
            });

            res.sendStatus(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/users/:user_id/ingredients/:ingredient_id')
    .patch(middleware.checkIngredientOwnership, async (req, res) => {
        try {
            await db.query({
                text: `INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name`,
                values: [req.body.name],
            });

            const response = await db.query({
                text: `
            UPDATE users_ingredients_groceries
            SET name = $1, quantity = $2, measurement_id = (SELECT id FROM measurements WHERE short_name = $3)
            WHERE id = $4 RETURNING *
            `,
                values: [req.body.name, req.body.quantity, req.body.measurement, req.params.ingredient_id],
            });

            res.status(200).send(response.rows[0]);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/users/:user_id/recipes/:recipe_id')
    .post(middleware.isLoggedIn, async (req, res) => {
        // add full recipe to grocery list
        try {
            // insert recipe into menu
            await db.query({
                text: `INSERT INTO users_recipes_menu (user_id, recipe_id) VALUES ($1, $2)`,
                values: [req.user.id, req.params.recipe_id]
            });

            // insert all ingredients from recipe into grocery list
            await db.query({
                text: `
                INSERT INTO users_ingredients_groceries (user_id, name, measurement_id, quantity)
                SELECT $1, recipes_ingredients.name, recipes_ingredients.measurement_id, recipes_ingredients.quantity
                FROM recipes_ingredients
                WHERE recipes_ingredients.recipe_id = $2`,
                values: [req.user.id, req.params.recipe_id]
            });

            const response = await db.query({
                text: usersSelector + 'where users.id = $1 group by users.id',
                values: [req.user.id]
            });

            res.status(200).send({user: response.rows[0]});

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .patch(middleware.isLoggedIn, async (req, res) => {
        // add partial recipe to grocery list
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            // insert recipe into menu
            await client.query({
                text: `INSERT INTO users_recipes_menu (user_id, recipe_id) VALUES ($1, $2)`,
                values: [req.user.id, req.params.recipe_id]
            });

            for (let x = 0; x < req.body.ingredients.length; x++) {
                const ing = req.body.ingredients[x];

                await client.query({
                    text: 'INSERT INTO users_ingredients_groceries (user_id, name, measurement_id, quantity) VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4)',
                    values: [req.user.id, ing.name, ing.measurement, ing.quantity]
                })
            }

            await client.query("COMMIT");

            const response = await db.query({
                text: usersSelector + 'where users.id = $1 group by users.id',
                values: [req.user.id]
            });

            res.status(200).send({user: response.rows[0]});

        } catch (error) {
            await client.query("ROLLBACK");
            res.status(404).send({detail: error.message});
        } finally {
            client.release();
        }
    });

router.route('/users/:user_id/collections/:collection_id')
    .post(middleware.isLoggedIn, async (req, res) => {
        try {
            await db.query({
                text: `INSERT INTO users_collections_followers (user_id, collection_id) VALUES ($1, $2)`,
                values: [req.user.id, req.params.collection_id],
            });

            return res.sendStatus(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .delete(middleware.isLoggedIn, async (req, res) => {
        try {
            await db.query({
                text: `DELETE FROM users_collections_followers WHERE user_id = $1 AND collection_id = $2`,
                values: [req.user.id, req.params.collection_id],
            });

            return res.sendStatus(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/users/:user_id')
    // update user
    .patch(middleware.isLoggedIn, async (req, res) => {
        try {
            const {username, email, profileImage, password} = req.body;

            const updateValues = [];
            const values = [];

            function updateQuery(key, value) {
                updateValues.push(`${key} = $${values.length + 1}`);
                values.push(value);
            }

            if (typeof username === 'string') {
                updateQuery('username', username);
            }
            if (typeof email === 'string') {
                updateQuery('email', email);
            }
            if (typeof password === 'string') {
                const userRes = await db.query({
                    text: `SELECT password FROM users WHERE id = $1`,
                    values: [req.user.id],
                });
                if (password !== userRes.rows[0].password) {
                    updateQuery('password', await hashPassword(password));
                }
            }
            if (typeof profileImage === 'string') {
                updateQuery('profile_image', profileImage);
            }

            if (updateValues.length > 0) {
                const response = await db.query({
                    text: `UPDATE users SET ${updateValues.join(", ")} WHERE id = $${values.length + 1} RETURNING *`,
                    values: values.concat([req.user.id]),
                });

                return res.status(200).send({user: response.rows[0]})
            }

            return res.sendStatus(200);

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .get(async (req, res) => {
        let response;
        if (req.isAuthenticated() && req.user.id.toString() === req.params.user_id) {
            response = await db.query({
                text: `SELECT * FROM users
                WHERE users.id = $1`,
                values: [req.params.user_id]
            })
        } else {
            response = await db.query({
                text: `SELECT username, profile_image FROM users
                WHERE users.id = $1`,
                values: [req.params.user_id]
            })
        }
        return res.status(200).json({
            user: response.rows[0]
        });
    })
    // delete user account
    .delete((req, res) => {
        res.sendStatus(404);
    });

// get certain collection details about a user's collections
router.get('/users/:user_id/collections', async (req, res) => {
    const query = await db.query({
        text: `
        SELECT collections.*, author.profile_image author_image,
        COALESCE(json_agg(recipes.*) FILTER (WHERE recipes IS NOT NULL), '[]') recipes
        FROM collections
        LEFT JOIN LATERAL (
            select recipes.* from recipes
            where recipes.id in (
                select recipe_id from recipes_collections
                where recipes_collections.collection_id = collections.id
            )
        ) recipes ON TRUE 
        LEFT JOIN LATERAL (
            select profile_image from users
            where users.id = collections.author_id
        ) author ON TRUE
        WHERE collections.author_id = $1 OR collections.id IN (
            SELECT collection_id FROM users_collections_followers
            WHERE users_collections_followers.user_id = $1
        )
        group by collections.id, author.profile_image;`,
        values: [req.params.user_id],
    });
    return res.status(200).send({collections: query.rows});
});

module.exports = router;
