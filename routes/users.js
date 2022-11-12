const express = require('express'),
    router = express.Router(),
    {hashPassword} = require("../utils"),
    middleware = require('../middleware');

const cloudinary = require('cloudinary');
const {usersSelector} = require("../utils");
const {addIngredient, canBeAdded} = require("../client/utils/conversions");

const multer = require('multer');
const upload = multer();

const db = require("../db/index");

const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

cloudinary.config({
    cloud_name: 'recipecloud',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

async function selectUserGroceries(user_id) {
    const groceries = await db.query({
        text: `
                SELECT g.id, g.quantity, g.name, m.short_name measurement, g.item_index
                FROM users_ingredients_groceries g
                LEFT JOIN LATERAL (
                    SELECT short_name FROM measurements
                    WHERE measurements.id = g.measurement_id
                ) m ON true
                WHERE g.user_id = $1 AND g.deleted = false
                ORDER BY g.item_index;`,
        values: [user_id],
    });
    return groceries.rows;
}

async function selectUserMenu(user_id) {
    const menu = await db.query({
        text: `
                SELECT * FROM recipes
                WHERE recipes.id IN (
                    SELECT recipe_id FROM users_recipes_menu
                    WHERE users_recipes_menu.user_id = $1
                );`,
        values: [user_id],
    });
    return menu.rows;
}

async function insertUserGroceries(user_id, ingredients) {
    const client = await db.pool.connect();

    try {
        await client.query("BEGIN");

        for (let x = 0; x < ingredients.length; x++) {
            const ing = ingredients[x];

            // find a similar ingredient on user's grocery list
            const similarIngredient = await client.query({
                text: `
                    SELECT users_ingredients_groceries.*, measurements.short_name AS measurement
                    FROM users_ingredients_groceries
                    INNER JOIN measurements ON measurements.id = users_ingredients_groceries.measurement_id
                    WHERE (users_ingredients_groceries.name ILIKE $1
                    OR users_ingredients_groceries.name ILIKE $2
                    OR users_ingredients_groceries.name ILIKE $3
                    OR users_ingredients_groceries.name ILIKE $4
                    OR users_ingredients_groceries.name ILIKE $5)
                    AND users_ingredients_groceries.user_id = $6
                    AND deleted = false
                    LIMIT 1
                    `,
                values: [ing.name, ing.name + "s", ing.name + "es", ing.name.slice(0, -1), ing.name.slice(0, -2), user_id],
            });

            if (similarIngredient.rows.length > 0) {
                // if there's a similar ingredient
                // check if it can be added
                let m = similarIngredient.rows[0].measurement;
                let q = similarIngredient.rows[0].quantity;
                // check if item can be added
                if (canBeAdded(m, ing.measurement)) {
                    // if it can be added, add it
                    let newQM = addIngredient(Number(q), m, Number(ing.quantity), ing.measurement);

                    await client.query({
                        text: `UPDATE users_ingredients_groceries SET quantity = $1, measurement_id = (SELECT id FROM measurements WHERE short_name = $2) WHERE id = $3`,
                        values: [newQM.quantity, newQM.measurement, similarIngredient.rows[0].id],
                    });

                } else {
                    // if it can't be added, push it to grocery list
                    await client.query({
                        text: `
                            INSERT INTO users_ingredients_groceries (user_id, name, measurement_id, quantity, item_index) 
                            VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4, (
                                SELECT count(*)
                                FROM users_ingredients_groceries ug
                                WHERE ug.user_id = $1 AND ug.deleted = false
                                )
                            )`,
                        values: [user_id, ing.name, ing.measurement, ing.quantity]
                    })
                }

            } else {
                // if there aren't any matching ingredients
                await client.query({
                    text: `
                            INSERT INTO users_ingredients_groceries (user_id, name, measurement_id, quantity, item_index) 
                            VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4, (
                                SELECT count(*)
                                FROM users_ingredients_groceries ug
                                WHERE ug.user_id = $1 AND ug.deleted = false
                                )
                            )`,
                    values: [user_id, ing.name, ing.measurement, ing.quantity]
                })
            }
        }

        await client.query("COMMIT");

        return await selectUserGroceries(user_id);

    } catch (error) {
        await client.query("ROLLBACK");

        return error;
    } finally {
        client.release();
    }
}

router.route('/users')
    // get all users
    .get(async (req, res) => {
        const response = await db.query({
            text: `SELECT profile_image, username FROM users`
        });
        return res.status(200).send({users: response.rows});
    });

router.route('/users/:user_id/recipes')
    .get(middleware.isLoggedIn, async (req, res) => {
        // get menu
        try {
            const menu = await selectUserMenu(req.user.id);

            res.status(200).send({menu});

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
            const {name, measurement, quantity} = req.body;
            const newGroceryList = await insertUserGroceries(req.user.id, [{name, measurement, quantity}]);

            return res.status(200).send({groceryList: newGroceryList});
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .get(middleware.isLoggedIn, async (req, res) => {
        // get grocery list
        try {
            const groceryList = await selectUserGroceries(req.user.id);

            res.status(200).send({groceryList});
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .delete(middleware.isLoggedIn, async (req, res) => {
        // remove list of ingredients from grocery list
        try {
            await db.query({
                text: `
                UPDATE users_ingredients_groceries
                SET deleted = true
                WHERE id IN (${req.body.ingredient_ids.map(id => "'" + id + "'").join(", ")})
                `,
            });

            const groceryList = await selectUserGroceries(req.user.id);

            res.status(200).send({groceryList});
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/users/:user_id/staples')
    .post(middleware.isLoggedIn, async (req, res) => {
        // add ingredient to grocery list
        try {
            const {name, measurement, quantity} = req.body;

            const response = await db.query({
                text: `
                            INSERT INTO users_staples (user_id, name, measurement_id, quantity) 
                            VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4)
                            RETURNING id, name, $3 as measurement, quantity
                            `,
                values: [req.user.id, name, measurement, quantity]
            })

            return res.status(200).send(response.rows);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .get(middleware.isLoggedIn, async (req, res) => {
        try {
            const response = await db.query({
                text: `
                    SELECT id, name, quantity, (SELECT short_name as measurement FROM measurements where id = measurement_id) 
                    FROM users_staples 
                    WHERE user_id = $1
                    `,
                values: [req.user.id],
            })

            res.status(200).send({staples: response.rows});
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })

router.route('/users/:user_id/staples/:staple_id')
    .delete(middleware.isLoggedIn, async (req, res) => {
        try {
            await db.query({
                text: `DELETE FROM users_staples WHERE id = $1 AND user_id = $2`,
                values: [req.params.staple_id, req.user.id]
            })
            res.sendStatus(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })

router.route('/users/:user_id/ingredients/order')
    .post(middleware.isLoggedIn, async (req, res) => {
        // expects req.body.ingredients to be an ordered list of all grocery IDs
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            let groceryList = await selectUserGroceries(req.user.id);
            for (let i = 0; i < req.body.ingredients.length; i++) {
                const groceryIndex = groceryList.findIndex(g => g.id === req.body.ingredients[i]);
                const updatedItem = await client.query({
                    text: `
                    UPDATE users_ingredients_groceries
                    SET item_index = $1
                    WHERE id = $2`,
                    values: [i, groceryList[groceryIndex].id],
                });
                groceryList[groceryIndex] = updatedItem;
            }

            await client.query('COMMIT');

            groceryList = await selectUserGroceries(req.user.id);

            return res.status(200).send({groceryList});

        } catch (error) {
            await client.query("ROLLBACK");
            res.status(404).send({detail: error.message});
        } finally {
            client.release();
        }
    });

router.route('/users/:user_id/ingredients/:ingredient_id')
    .patch(middleware.checkIngredientOwnership, async (req, res) => {
        try {
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

        const client = await db.pool.connect();

        try {
            // insert recipe into menu
            await client.query("BEGIN");
            await db.query({
                text: `INSERT INTO users_recipes_menu (user_id, recipe_id) VALUES ($1, $2)`,
                values: [req.user.id, req.params.recipe_id]
            });

            const recipeIngredients = await db.query({
                text: `SELECT name, quantity, (SELECT short_name as measurement FROM measurements m WHERE m.id = r.measurement_id) FROM recipes_ingredients r WHERE r.recipe_id = $1`,
                values: [req.params.recipe_id],
            });

            const newGroceryList = await insertUserGroceries(req.user.id, recipeIngredients.rows);
            const menu = await selectUserMenu(req.user.id);
            await client.query("COMMIT");
            res.status(200).send({groceryList: newGroceryList, menu});

        } catch (error) {
            await client.query("ROLLBACK");
            res.status(404).send({detail: error.message});
        } finally {
            client.release();
        }
    })
    .patch(middleware.isLoggedIn, async (req, res) => {
        // add partial recipe to grocery list
        try {
            // insert recipe into menu
            await db.query({
                text: `INSERT INTO users_recipes_menu (user_id, recipe_id) VALUES ($1, $2)`,
                values: [req.user.id, req.params.recipe_id]
            });

            const newGroceryList = await insertUserGroceries(req.user.id, req.body.ingredients);
            const menu = await selectUserMenu(req.user.id);

            res.status(200).send({groceryList: newGroceryList, menu});

        } catch (error) {
            res.status(404).send({detail: error.message});
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
    .patch(middleware.isLoggedIn, upload.single("profile_picture"), async (req, res) => {
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

            if (req.file) {
                const imagePath = `users/${req.user.id}/profile_picture`;
                const data = await s3.upload({Bucket: "ediblio", Key: imagePath, Body: req.file.buffer}).promise();
                updateQuery('profile_image', data.Key);
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
        if (req.user && req.user.id && req.user.id.toString() === req.params.user_id) {

            response = await db.query({
                text: `${usersSelector}
where users.id = $1
group by users.id;`,
                values: [req.params.user_id]
            });
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
        COALESCE(json_agg(recipes.*) FILTER (WHERE recipes.id IS NOT NULL), '[]') recipes
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
