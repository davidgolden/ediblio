import {checkRecipeOwnership, getRecipe, getUserIdFromRequest} from "../../../utils/serverUtils";
import db from "../../../db";

const {Pool} = require('pg');
const pool = new Pool();

const multer = require('multer');
const upload = multer();

import {S3} from "aws-sdk";
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

export default async function handler(req, res) {
    if (req.method === "GET") {
        const userId = getUserIdFromRequest(req);
        const recipe = await getRecipe(req.query.recipe_id, userId);

        return res.status(200).json({
            recipe
        })
    } else if (req.method === "PATCH") {
        await checkRecipeOwnership(req, res);

        upload.single("image")(req, {}, async err => {
            const userId = getUserIdFromRequest(req);

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
                        values: [req.query.recipe_id]
                    });

                    const parsedIngredients = JSON.parse(ingredients);
                    for (let x = 0; x < parsedIngredients.length; x++) {
                        const ing = parsedIngredients[x];

                        await client.query({
                            text: 'INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity) VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4);',
                            values: [req.query.recipe_id, ing.name, ing.measurement, ing.quantity]
                        })
                    }
                }

                if (updateValues.length > 0) {
                    await client.query({
                        text: `UPDATE recipes SET ${updateValues.join(", ")} WHERE id = $${values.length + 1}`,
                        values: values.concat([req.query.recipe_id]),
                    });
                }

                if (req.file) {
                    const imagePath = `users/${userId}/recipes/${req.query.recipe_id}/${req.file.originalname}`;
                    const data = await s3.upload({Bucket: "ediblio", Key: imagePath, Body: req.file.buffer}).promise();

                    await client.query(`UPDATE recipes SET image = $1 WHERE id = $2`, [data.Key, req.query.recipe_id]);
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
                    values: [userId, req.query.recipe_id]
                });

                return res.status(200).json({recipe: recipeRes.rows[0]});
            } catch (error) {
                await client.query('ROLLBACK');
                res.status(404).send({detail: error});
            } finally {
                client.release();
            }
        })
    } else if (req.method === "DELETE") {
        try {
            await checkRecipeOwnership(req, res);

            const userId = getUserIdFromRequest(req);

            const response = await db.query({
                text: `DELETE FROM recipes WHERE id = $1 RETURNING *`,
                values: [req.query.recipe_id],
            });

            if (response.rows[0].image) {
                // delete all resources associated with the recipe
                const recipePath = `users/${userId}/recipes/${response.rows[0].id}/`;

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
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};