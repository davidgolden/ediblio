import {prismaClient} from "../../db";
import {getRecipe, getUserIdFromRequest} from "../../utils/serverUtils";

const multer = require('multer');
const upload = multer();

import {S3} from "aws-sdk";
const s3 = new S3({
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
            SELECT DISTINCT recipes.*, users.profile_image AS author_image, avg(ratings.rating) avg_rating, count(ratings)::text total_ratings
            `;

            if (userId) {
                text += `, CASE WHEN in_menu.id IS NULL THEN FALSE ELSE TRUE END AS in_menu `;
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
                    AND users_recipes_menu.user_id = '${userId}'
                    LIMIT 1
                ) in_menu ON True
                `
            }

            if (req.query.author && req.query.searchTerm) {
                text += `
                    INNER JOIN recipes_ingredients ON recipes_ingredients.recipe_id = recipes.id
                    WHERE recipes.author_id = '${req.query.author}' AND (lower(recipes.name) LIKE ${"%" + req.query.searchTerm.toLowerCase() + "%"} OR lower(recipes_ingredients.name) LIKE ${"%" + req.query.searchTerm.toLowerCase() + "%"}) 
                    GROUP BY recipes.id, users.profile_image ${userId ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
            } else if (req.query.author) {
                text += `
                    WHERE recipes.author_id = '${req.query.author}' 
                    GROUP BY recipes.id, users.profile_image ${userId ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
            } else if (req.query.searchTerm) {
                text += `
                    INNER JOIN recipes_ingredients ON recipes_ingredients.recipe_id = recipes.id
                    WHERE (lower(recipes.name) LIKE ${"%" + req.query.searchTerm.toLowerCase() + "%"} OR lower(recipes_ingredients.name) LIKE ${"%" + req.query.searchTerm.toLowerCase() + "%"}) 
                    GROUP BY recipes.id, users.profile_image ${userId ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
            } else {
                text += ` GROUP BY recipes.id, users.profile_image ${userId ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
            }

            const recipes = await prismaClient.$queryRawUnsafe(text);

            return res.status(200).send({recipes});
        } catch (error) {
            console.log(error);
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "POST") {
        // create new recipe
        upload.single("image")(req, {}, async err => {
            const userId = getUserIdFromRequest(req);

            try {
                await prismaClient.$transaction(async (tx) => {
                    const {name, url, notes, ingredients} = req.body;

                    const recipes = await tx.$queryRaw`INSERT INTO recipes (name, url, notes, author_id) VALUES (${name}, ${url}, ${notes}, ${userId}::uuid) RETURNING recipes.id;`
                    const recipeId = recipes[0].id;

                    if (req.file) {
                        const imagePath = `users/${userId}/recipes/${recipeId}/${req.file.originalname}`;
                        const data = await s3.upload({Bucket: "ediblio", Key: imagePath, Body: req.file.buffer}).promise();

                        await tx.$queryRaw`UPDATE recipes SET image = ${data.Key} WHERE id = ${recipeId};`;
                    }

                    if (ingredients && ingredients.length > 0) {
                        const parsedIngredients = JSON.parse(ingredients);
                        for (let x = 0; x < parsedIngredients.length; x++) {
                            const ing = parsedIngredients[x];

                            await tx.$queryRaw`INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity) VALUES (${recipeId}, ${ing.name}, (SELECT id FROM measurements WHERE short_name = ${ing.measurement}), ${ing.quantity});`
                        }
                    }

                    console.log(recipeId, userId);
                    const response = await getRecipe(recipeId, userId);
                    console.log(response);
                    return res.status(200).json({recipe: response});
                })
            } catch (e) {
                console.log(e);
                return res.status(400).json(e);
            }
        })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};