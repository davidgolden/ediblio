import {checkRecipeOwnership, getRecipe, getUserIdFromRequest} from "../../../utils/serverUtils";
import {prismaClient} from "../../../db";

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

            try {
                await prismaClient.$transaction(async (tx) => {
                    const {name, url, notes} = req.body;
                    let {ingredients} = req.body;
                    const updateValues = [];

                    function updateQuery(key, value) {
                        updateValues.push(`${key} = '${value}'`);
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

                        await tx.$queryRaw`DELETE FROM recipes_ingredients WHERE recipe_id = ${req.query.recipe_id}::uuid;`

                        const parsedIngredients = JSON.parse(ingredients);
                        const measurements = await tx.measurements.findMany();
                        for (let x = 0; x < parsedIngredients.length; x++) {
                            const ing = parsedIngredients[x];

                            await tx.recipes_ingredients.create({
                                data: {
                                    recipes: {
                                        connect: {
                                            id: req.query.recipe_id,
                                        }
                                    },
                                    name: ing.name,
                                    measurements: {
                                        connect: {
                                            id: measurements.find(m => m.short_name === ing.measurement).id,
                                        }
                                    },
                                    quantity: ing.quantity,
                                }
                            })
                        }
                    }

                    if (updateValues.length > 0) {
                        await tx.$queryRawUnsafe(`UPDATE recipes SET ${updateValues.join(", ")} WHERE id = '${req.query.recipe_id}';`);
                    }

                    if (req.file) {
                        const imagePath = `users/${userId}/recipes/${req.query.recipe_id}/${req.file.originalname}`;
                        const data = await s3.upload({
                            Bucket: "ediblio",
                            Key: imagePath,
                            Body: req.file.buffer
                        }).promise();

                        await tx.$queryRaw`UPDATE recipes SET image = ${data.Key} WHERE id = ${req.query.recipe_id}::uuid;`
                    }

                    const recipes = await tx.$queryRaw`
                        SELECT recipes.*, avg(ratings.rating) avg_rating, count(ratings)::text total_ratings, avg(user_ratings.rating) user_rating, author.username author_username,
                        COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients
                        FROM recipes
                        LEFT JOIN LATERAL (
                            select rating from ratings
                            where ratings.recipe_id = recipes.id
                        ) ratings ON TRUE 
                        LEFT JOIN LATERAL (
                            select rating from ratings
                            where ratings.recipe_id = recipes.id
                            and ratings.author_id = ${userId}::uuid
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
                        WHERE recipes.id = ${req.query.recipe_id}::uuid
                        group by recipes.id, author.username;
                        `;

                    return res.status(200).json({recipe: recipes[0]});
                })
            } catch (e) {
                console.error(e);
                res.status(404).send({detail: e});
            }
        })
    } else if (req.method === "DELETE") {
        try {
            await checkRecipeOwnership(req, res);

            const userId = getUserIdFromRequest(req);

            const response = await prismaClient.$queryRaw`DELETE FROM recipes WHERE id = ${req.query.recipe_id}::uuid RETURNING *;`

            if (response[0].image) {
                // delete all resources associated with the recipe
                const recipePath = `users/${userId}/recipes/${response[0].id}/`;

                const data = await s3.listObjects({Bucket: "ediblio", Prefix: recipePath}).promise();

                const deleteParams = {Bucket: "ediblio"};
                deleteParams.Delete = {Objects: []};

                data.Contents.forEach(function (content) {
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