const express = require('express'),
    router = express.Router(),
    {hashPassword} = require("../utils"),
    uuidv1 = require('uuid/v1'),
    bcrypt = require('bcrypt-nodejs'),
    middleware = require('../middleware');

const cloudinary = require('cloudinary');

const db = require("../db/index");

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
                text: `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
                values: [req.body.username, req.body.email.toLowerCase(), hashPassword(req.body.password)]
            });

            req.login(response.rows[0], function () {
                res.status(200).json({user: req.user});
            });

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/users/:user_id/menu')
    .post(middleware.isLoggedIn, async (req, res) => {
        try {
            await db.query({
                text: `INSERT INTO users_menu_recipe (user_id, recipe_id) VALUES ($1, $2)`,
                values: [req.user.id, req.body.recipe_id]
            });
            res.sendStatus(200);

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/users/:user_id/collections/:collection_id')
    .post(middleware.isLoggedIn, async (req, res) => {
        try {
            await db.query({
                text: `INSERT INTO users_collections_followers (id, user_id, collection_id) VALUES ($1, $2, $3)`,
                values: [uuidv1(), req.user.id, req.params.collection_id],
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

// DISPLAY GROCERY LIST
router.route('/users/:user_id/list')
    .get(middleware.isLoggedIn, async (req, res) => {
        const response = await db.query({
            text: `SELECT
            COALESCE(json_agg(m) FILTER (WHERE m IS NOT NULL), '[]') menu,
            COALESCE(json_agg(g) FILTER (WHERE g IS NOT NULL), '[]') grocery_list
            FROM users
            LEFT JOIN LATERAL (
            SELECT * FROM recipes
            WHERE recipes.id IN (
            SELECT id FROM users_recipes_menu
            WHERE users_recipes_menu.user_id = users.id
            )
            ) m ON true
            LEFT JOIN LATERAL (
            SELECT *
            FROM ingredients
            WHERE ingredients.id IN (
            SELECT user_id FROM users_ingredients_groceries
            WHERE users_ingredients_groceries.user_id = users.id
            )
            ) g ON true
            where users.id = $1
            group by users.id;`,
            values: [req.user.id],
        });

        return res.status(200).send({groceryList: response.rows[0].grocery_list, menu: response.rows[0].menu});
    });

// get certain collection details about a user's collections
router.get('/users/:user_id/collections', async (req, res) => {
    const query = await db.query({
        text: `SELECT collections.*, author.profile_image author_image,
COALESCE(json_agg(recipes.image) FILTER (WHERE recipes IS NOT NULL), '[]') recipes
FROM collections
LEFT JOIN LATERAL (
select recipes.image from recipes
where recipes.id in (
select recipe_id from recipes_collections
where recipes_collections.collection_id = collections.id
)
limit 4
) recipes ON TRUE 
LEFT JOIN LATERAL (
select profile_image from users
where users.id = collections.author_id
) author ON TRUE
WHERE collections.author_id = $1
group by collections.id, author.profile_image;`,
        values: [req.params.user_id],
    });
    return res.status(200).send({collections: query.rows});
});

module.exports = router;
