const express = require('express'),
    router = express.Router(),
    middleware = require('../middleware'),
    cloudinary = require('cloudinary');

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

cloudinary.config({
    cloud_name: 'recipecloud',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

async function getRecipe(recipe_id, user_id) {
    let response;

    if (user_id) {
        response = await db.query({
            text: `
                SELECT recipes.*, COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients,
                ratings.avg avg_rating, ratings.total total_ratings, avg(user_ratings.rating) user_rating, author.username author_username,
                CASE WHEN in_menu.id IS NULL THEN FALSE ELSE TRUE END AS in_menu
                FROM recipes
                LEFT JOIN LATERAL (
                    select avg(ratings.rating) avg, count(*) total from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE 
                LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                    and ratings.author_id = $1
                ) user_ratings ON TRUE
                LEFT JOIN LATERAL (
                    SELECT recipes_ingredients.id, recipes_ingredients.quantity, recipes_ingredients.name, recipes_ingredients.measurement_id, m.short_name measurement
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
                LEFT JOIN LATERAL (
                    SELECT id FROM users_recipes_menu
                    WHERE users_recipes_menu.recipe_id = recipes.id
                    AND users_recipes_menu.user_id = $1
                    LIMIT 1
                ) in_menu ON True
                WHERE recipes.id = $2
                group by recipes.id, author.username, in_menu.id, ratings.avg, ratings.total;`,
            values: [user_id, recipe_id]
        })
    } else {
        response = await db.query({
            text: `
                SELECT recipes.*, avg(ratings.rating) avg_rating, count(ratings) total_ratings, author.username author_username,
                COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients
                FROM recipes
                LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE 
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
                WHERE recipes.id = $1
                group by recipes.id, author.username;`,
            values: [recipe_id]
        });
    }

    return response.rows[0];
}

// get all recipes
router.route('/recipes')
    .get(async (req, res) => {
        let page_size = req.query.page_size || 12;
        let page = req.query.page || 0;
        const skip = page * page_size;

        try {

            let text = `
            SELECT DISTINCT recipes.*, users.profile_image AS author_image, avg(ratings.rating) avg_rating, count(ratings) total_ratings
            `,
                values = [];

            if (req.user) {
                text += `, CASE WHEN in_menu.id IS NULL THEN FALSE ELSE TRUE END AS in_menu `;
                values.push(req.user.id);
            }

            text += `FROM recipes 
            INNER JOIN users ON users.id = recipes.author_id
            LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE `;

            if (req.user) {
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
                    GROUP BY recipes.id, users.profile_image ${req.user ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push(req.query.author, "%" + req.query.searchTerm.toLowerCase() + "%");
            } else if (req.query.author) {
                text += `
                    WHERE recipes.author_id = $${values.length + 1}  
                    GROUP BY recipes.id, users.profile_image ${req.user ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push(req.query.author);
            } else if (req.query.searchTerm) {
                text += `
                    INNER JOIN recipes_ingredients ON recipes_ingredients.recipe_id = recipes.id
                    WHERE (lower(recipes.name) LIKE $${values.length + 1} OR lower(recipes_ingredients.name) LIKE $${values.length + 1}) 
                    GROUP BY recipes.id, users.profile_image ${req.user ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push("%" + req.query.searchTerm.toLowerCase() + "%");
            } else {
                text += ` GROUP BY recipes.id, users.profile_image ${req.user ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
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
    })
    .post(middleware.isLoggedIn, async (req, res) => {
        // create new recipe

        const client = await db.pool.connect();
        try {
            await client.query("BEGIN");
            const {name, url, notes, image, ingredients} = req.body.recipe;
            const text = `INSERT INTO recipes (name, url, notes, image, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING recipes.id;`;
            const values = [name, url, notes, image, req.user.id];

            let recipeRes = await client.query(text, values);

            if (ingredients && ingredients.length > 0) {
                for (let x = 0; x < ingredients.length; x++) {
                    const ing = ingredients[x];

                    await client.query({
                        text: 'INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity) VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4)',
                        values: [recipeRes.rows[0].id, ing.name, ing.measurement, ing.quantity]
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
    .get(async (req, res) => {
        const recipe = await getRecipe(req.params.recipe_id, req.user && req.user.id);

        return res.status(200).json({
            recipe
        })
    })
    .patch(middleware.checkRecipeOwnership, async (req, res) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const {name, url, image, notes} = req.body;
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
            if (typeof image === 'string') {
                updateQuery('image', image);
            }
            if (typeof notes === 'string') {
                updateQuery('notes', notes);
            }
            if (ingredients) {

                await client.query({
                    text: `DELETE FROM recipes_ingredients WHERE recipe_id = $1`,
                    values: [req.params.recipe_id]
                });

                for (let x = 0; x < ingredients.length; x++) {
                    const ing = ingredients[x];

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
            await db.query({
                text: `DELETE FROM recipes WHERE id = $1`,
                values: [req.params.recipe_id],
            });

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
