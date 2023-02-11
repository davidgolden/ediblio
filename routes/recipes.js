const express = require('express'),
    router = express.Router(),
    middleware = require('../middleware/legacy');

const {getRecipe} = require("../utils/serverUtils");

const multer = require('multer');
const upload = multer();

const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const db = require('../db');

const {Pool} = require('pg');
const pool = new Pool();

/*

/reset
/forgot
/scrape

/r -> get all recipes [GET recipes, POST recipe]
/u -> get all users [GET users, POST user]
/u/:u -> get specific user [GET user, PUT user]
/u/:u/r -> get all user recipes [GET recipes]
/u/:u/r/:r -> get specific user recipe

 */



// get all recipes
router.route('/recipes')
    .post(middleware.isLoggedIn, upload.single("image"), async (req, res) => {
        // create new recipe

        const client = await db.pool.connect();
        try {
            await client.query("BEGIN");
            const {name, url, notes, ingredients} = req.body;
            const text = `INSERT INTO recipes (name, url, notes, author_id) VALUES ($1, $2, $3, $4) RETURNING recipes.id;`;
            const values = [name, url, notes, req.user.id];

            let recipeRes = await client.query(text, values);

            // upload image to s3
            const recipeId = recipeRes.rows[0].id;

            if (req.file) {
                const imagePath = `users/${req.user.id}/recipes/${recipeId}/${req.file.originalname}`;
                const data = await s3.upload({Bucket: "ediblio", Key: imagePath, Body: req.file.buffer}).promise();

                await client.query(`UPDATE recipes SET image = $1 WHERE id = $2`, [data.Key, recipeId]);
            }

            if (ingredients && ingredients.length > 0) {
                const parsedIngredients = JSON.parse(ingredients);
                for (let x = 0; x < parsedIngredients.length; x++) {
                    const ing = parsedIngredients[x];

                    await client.query({
                        text: 'INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity) VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4)',
                        values: [recipeId, ing.name, ing.measurement, ing.quantity]
                    })
                }
            }

            await client.query("COMMIT");
            const recipe = await getRecipe(recipeRes.rows[0].id, req.user.id);
            return res.status(200).json({recipe});
        } catch (e) {
            await client.query("ROLLBACK");
            return res.status(400).json(e);
        } finally {
            client.release();
        }
    });

router.route('/recipes/:recipe_id')
    .patch(middleware.checkRecipeOwnership, upload.single("image"), async (req, res) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const {name, url, notes} = req.body;
            let {ingredients} = req.body;
            const updateValues = [];
            const values = [];

            function updateQuery(key, value) {
                updateValues.push(`${key} = $${values.length + 1}`);
                values.push(value);
            }

            if (typeof name === 'string') {
                updateQuery('name', name);
            }
            if (typeof url === 'string') {
                updateQuery('url', url);
            }
            if (typeof notes === 'string') {
                updateQuery('notes', notes);
            }
            if (ingredients) {

                await client.query({
                    text: `DELETE FROM recipes_ingredients WHERE recipe_id = $1`,
                    values: [req.params.recipe_id]
                });

                const parsedIngredients = JSON.parse(ingredients);
                for (let x = 0; x < parsedIngredients.length; x++) {
                    const ing = parsedIngredients[x];

                    await client.query({
                        text: 'INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity) VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4);',
                        values: [req.params.recipe_id, ing.name, ing.measurement, ing.quantity]
                    })
                }
            }

            if (updateValues.length > 0) {
                await client.query({
                    text: `UPDATE recipes SET ${updateValues.join(", ")} WHERE id = $${values.length + 1}`,
                    values: values.concat([req.params.recipe_id]),
                });
            }

            if (req.file) {
                const imagePath = `users/${req.user.id}/recipes/${req.params.recipe_id}/${req.file.originalname}`;
                const data = await s3.upload({Bucket: "ediblio", Key: imagePath, Body: req.file.buffer}).promise();

                await client.query(`UPDATE recipes SET image = $1 WHERE id = $2`, [data.Key, req.params.recipe_id]);
            }

            await client.query('COMMIT');

            const recipeRes = await db.query({
                text: `
                SELECT recipes.*, avg(ratings.rating) avg_rating, count(ratings) total_ratings, avg(user_ratings.rating) user_rating, author.username author_username,
                COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients
                FROM recipes
                LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE 
                LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                    and ratings.author_id = $1
                ) user_ratings ON TRUE
                LEFT JOIN LATERAL (
                    SELECT recipes_ingredients.id, recipes_ingredients.quantity, recipes_ingredients.name, m.short_name measurement
                    FROM recipes_ingredients
                    LEFT JOIN LATERAL (
                        SELECT short_name FROM measurements
                        WHERE measurements.id = recipes_ingredients.measurement_id
                    ) m ON true
                    WHERE recipes_ingredients.recipe_id = recipes.id
                ) ingredients ON true
                LEFT JOIN LATERAL (
                    select username
                    from users
                    where users.id = recipes.author_id
                ) author ON TRUE
                WHERE recipes.id = $2
                group by recipes.id, author.username;
                `,
                values: [req.user.id, req.params.recipe_id]
            });

            return res.status(200).json({recipe: recipeRes.rows[0]});
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(404).send({detail: error});
        } finally {
            client.release();
        }
    })
    .delete(middleware.checkRecipeOwnership, async (req, res) => {
        try {
            const response = await db.query({
                text: `DELETE FROM recipes WHERE id = $1 RETURNING *`,
                values: [req.params.recipe_id],
            });

            if (response.rows[0].image) {
                // delete all resources associated with the recipe
                const recipePath = `users/${req.user.id}/recipes/${response.rows[0].id}/`;

                const data = await s3.listObjects({Bucket: "ediblio", Prefix: recipePath}).promise();

                const deleteParams = {Bucket: "ediblio"};
                deleteParams.Delete = {Objects:[]};

                data.Contents.forEach(function(content) {
                    deleteParams.Delete.Objects.push({Key: content.Key});
                });

                await s3.deleteObjects(deleteParams).promise();
            }

            return res.status(200).send('Success!')
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });

router.route('/recipes/:recipe_id/ingredients')
    .post(middleware.checkRecipeOwnership, async (req, res) => {
        // add ingredient to recipe
        try {
            const response = await db.query({
                text: `
                INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity)
                VALUES ($1,
                    $2,
                    (SELECT id FROM measurements WHERE short_name = $3),
                    $4
                ) RETURNING *`,
                values: [req.params.recipe_id, req.body.name, req.body.measurement, req.body.quantity],
            });

            return res.status(200).send(response.rows[0]);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    })
    .delete(middleware.checkRecipeOwnership, async (req, res) => {
        // remove list of ingredients from recipe
        try {
            await db.query({
                text: `
                DELETE FROM recipes_ingredients
                WHERE id IN (${req.body.ingredient_ids.map(id => "'" + id + "'").join(", ")})
                `,
            });

            res.sendStatus(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    });


module.exports = router;
