import db from "../../db";
import {getRecipe, getUserIdFromRequest} from "../../utils/serverUtils";

const multer = require('multer');
const upload = multer();

const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const userId = getUserIdFromRequest(req);
        let page_size = req.query.page_size || 12;
        let page = req.query.page || 0;
        const skip = page * page_size;

        try {

            let text = `
            SELECT DISTINCT recipes.*, users.profile_image AS author_image, avg(ratings.rating) avg_rating, count(ratings) total_ratings
            `,
                values = [];

            if (userId) {
                text += `, CASE WHEN in_menu.id IS NULL THEN FALSE ELSE TRUE END AS in_menu `;
                values.push(userId);
            }

            text += `FROM recipes 
            INNER JOIN users ON users.id = recipes.author_id
            LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE `;

            if (userId) {
                text += `
                LEFT JOIN LATERAL (
                    SELECT id FROM users_recipes_menu
                    WHERE users_recipes_menu.recipe_id = recipes.id
                    AND users_recipes_menu.user_id = $1
                    LIMIT 1
                ) in_menu ON True
                `
            }

            if (req.query.author && req.query.searchTerm) {
                text += `
                    INNER JOIN recipes_ingredients ON recipes_ingredients.recipe_id = recipes.id
                    WHERE recipes.author_id = $${values.length + 1} AND (lower(recipes.name) LIKE $${values.length + 2} OR lower(recipes_ingredients.name) LIKE $${values.length + 2}) 
                    GROUP BY recipes.id, users.profile_image ${userId ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push(req.query.author, "%" + req.query.searchTerm.toLowerCase() + "%");
            } else if (req.query.author) {
                text += `
                    WHERE recipes.author_id = $${values.length + 1}  
                    GROUP BY recipes.id, users.profile_image ${userId ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push(req.query.author);
            } else if (req.query.searchTerm) {
                text += `
                    INNER JOIN recipes_ingredients ON recipes_ingredients.recipe_id = recipes.id
                    WHERE (lower(recipes.name) LIKE $${values.length + 1} OR lower(recipes_ingredients.name) LIKE $${values.length + 1}) 
                    GROUP BY recipes.id, users.profile_image ${userId ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push("%" + req.query.searchTerm.toLowerCase() + "%");
            } else {
                text += ` GROUP BY recipes.id, users.profile_image ${userId ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
            }

            const recipes = await db.query({
                text,
                values,
            });

            return res.status(200).send({recipes: recipes.rows});
        } catch (error) {
            console.log(error);
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "POST") {
        // create new recipe
        upload.single("image")(req, {}, async err => {
            const userId = getUserIdFromRequest(req);

            const client = await db.connect();
            try {
                await client.query("BEGIN");
                const {name, url, notes, ingredients} = req.body;
                const text = `INSERT INTO recipes (name, url, notes, author_id) VALUES ($1, $2, $3, $4) RETURNING recipes.id;`;
                const values = [name, url, notes, userId];

                let recipeRes = await client.query(text, values);

                // upload image to s3
                const recipeId = recipeRes.rows[0].id;

                if (req.file) {
                    const imagePath = `users/${userId}/recipes/${recipeId}/${req.file.originalname}`;
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
                const recipe = await getRecipe(recipeRes.rows[0].id, userId);
                return res.status(200).json({recipe});
            } catch (e) {
                await client.query("ROLLBACK");
                return res.status(400).json(e);
            } finally {
                client.release();
            }
        })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};