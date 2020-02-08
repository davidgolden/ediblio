const express = require('express'),
    router = express.Router(),
    middleware = require('../middleware'),
    cloudinary = require('cloudinary');

const db = require('../db');

const {Pool} = require('pg')
const pool = new Pool()

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

// get all recipes
router.route('/recipes')
    .get(async (req, res) => {
        let page_size = req.query.page_size || 12;
        let page = req.query.page || 0;
        const skip = page * page_size;

        let text = `SELECT DISTINCT recipes.*, users.profile_image AS author_image 
        FROM recipes 
        INNER JOIN users ON users.id = recipes.author_id `,
            values;

        if (req.query.author && req.query.searchTerm) {
            text += `INNER JOIN ingredients ON ingredients.id in (
                    SELECT ingredient_id FROM recipes_ingredients
                    where recipes_ingredients.recipe_id = recipes.id
                    )
                    WHERE recipes.author_id = $1 AND (lower(recipes.name) LIKE $2 OR lower(ingredients.name) LIKE $2) 
                    ORDER BY ${req.query.sortBy} ${req.query.orderBy} LIMIT ${page_size} OFFSET ${skip};`;
            values = [req.query.author, "%" + req.query.searchTerm.toLowerCase() + "%"];
        } else if (req.query.author) {
            text += `WHERE recipes.author_id = $1  
            ORDER BY ${req.query.sortBy} ${req.query.orderBy} LIMIT ${page_size} OFFSET ${skip};`;
            values = [req.query.author];
        } else if (req.query.searchTerm) {
            text += `INNER JOIN ingredients ON ingredients.id in (
                    SELECT ingredient_id FROM recipes_ingredients
                    where recipes_ingredients.recipe_id = recipes.id
                    ) WHERE (lower(recipes.name) LIKE $1 OR lower(ingredients.name) LIKE $1) 
                    ORDER BY ${req.query.sortBy} ${req.query.orderBy} LIMIT ${page_size} OFFSET ${skip};`;
            values = ["%" + req.query.searchTerm.toLowerCase() + "%"];
        } else {
            text += `ORDER BY ${req.query.sortBy} ${req.query.orderBy} LIMIT ${page_size} OFFSET ${skip};`;
            values = [];
        }

        const recipes = await db.query({
            text,
            values,
        });

        return res.status(200).send({recipes: recipes.rows});
    })
    .post(middleware.isLoggedIn, async (req, res) => {
        // create new recipe

        const {name, url, notes, image, ingredients} = req.body.recipe;
        const text = `INSERT INTO recipes (name, url, notes, image, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING recipes.id;`;
        const values = [name, url, notes, image, req.user.id];

        let recipeRes = await db.query(text, values);

        if (ingredients.length > 0) {
            await db.query(
                `INSERT INTO ingredients (name, quantity, measurement, recipe_id)
                VALUES ${ingredients.map(ing => `('${ing.name}', '${ing.quantity}', '${ing.measurement}', '${recipeRes.rows[0].id}'), `)}`
            );

            recipeRes = await db.query(`
                SELECT DISTINCT recipes.*, ingredients.* AS "ingredients[]" FROM recipes INNER JOIN ingredients ON recipes.id = ingredients.recipe_id WHERE recipes.id = ${recipeRes.rows[0].id};
            `);
        }

        return res.status(200).json({recipe: recipeRes.rows[0]});
    });

router.route('/recipes/:recipe_id')
    .get(async (req, res) => {
        let response;

        if (req.user) {
            response = await db.query({
                text: `SELECT recipes.*, avg(ratings.rating) avg_rating, count(ratings) total_ratings, avg(user_ratings.rating) user_rating, author.username author_username,
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
select * from ingredients
where ingredients.id in (
select ingredient_id from recipes_ingredients
where recipes_ingredients.recipe_id = recipes.id
)
) ingredients ON TRUE
LEFT JOIN LATERAL (
select username
from users
where users.id = recipes.author_id
) author ON TRUE
WHERE recipes.id = $2
group by recipes.id, author.username;`,
                values: [req.user.id, req.params.recipe_id]
            })
        } else {
            response = await db.query({
                text: `SELECT recipes.*, avg(ratings.rating) avg_rating, count(ratings) total_ratings, author.username author_username,
COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients
FROM recipes
LEFT JOIN LATERAL (
select rating from ratings
where ratings.recipe_id = recipes.id
) ratings ON TRUE 
LEFT JOIN LATERAL (
select * from ingredients
where ingredients.id in (
select id from recipes_ingredients
where recipes_ingredients.recipe_id = recipes.id
)
) ingredients ON TRUE
LEFT JOIN LATERAL (
select username
from users
where users.id = recipes.author_id
) author ON TRUE
WHERE recipes.id = $1
group by recipes.id, author.username;`,
                values: [req.params.recipe_id]
            });
        }

        return res.status(200).json({
            recipe: response.rows[0]
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

            function updateIngredientsQuery(type, values, updateString) {
                for (let k in ingredients) {
                    if (ingredients.hasOwnProperty(k)) {
                        const ingredient = ingredients[k];
                        values.push(ingredient.id, ingredient[type]);
                        updateString += `WHEN $${values.length - 1} THEN $${values.length} `
                    }
                }
                return updateString;
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

                let newIngredients = ingredients.filter(i => !i.id);
                ingredients = ingredients.filter(i => i.id);

                if (newIngredients.length > 0) {
                    let count = 1;
                    let text = newIngredients.map(() => {
                        const str = `($${count}, $${count + 1}, $${count + 2})`;
                        count += 3;
                        return str;
                    }).join(", ");
                    const ingRes = await client.query({
                        text: `INSERT INTO ingredients (name, measurement, quantity) VALUES ${text} RETURNING id`,
                        values: newIngredients.reduce((acc, curr) => acc.concat([curr.name, curr.measurement, curr.quantity]), [])
                    });

                    // this is important so we don't delete it later
                    newIngredients = ingRes.rows;

                    count = 1;
                    text = ingRes.rows.map(() => {
                        const str = `($${count}, $${count + 1})`;
                        count += 2;
                        return str;
                    }).join(", ");
                    await client.query({
                        text: `INSERT INTO recipes_ingredients (recipe_id, ingredient_id) VALUES ${text}`,
                        values: ingRes.rows.reduce((acc, curr) => acc.concat([req.params.recipe_id, curr.id]), [])
                    });
                }

                const values = [];
                let ingredientUpdateString = `UPDATE ingredients SET measurement = CASE id `;
                ingredientUpdateString = updateIngredientsQuery('measurement', values, ingredientUpdateString);
                ingredientUpdateString += 'END, name = CASE id ';
                ingredientUpdateString = updateIngredientsQuery('name', values, ingredientUpdateString);
                ingredientUpdateString += 'END, quantity = CASE id ';
                ingredientUpdateString = updateIngredientsQuery('quantity', values, ingredientUpdateString);
                ingredientUpdateString += `END WHERE id IN (${Array.from(Object.values(ingredients)).map(i => i.id).join(", ")}) RETURNING id`;

                const updatedIngredients = await client.query(ingredientUpdateString, values);

                await client.query({
                    text: `DELETE FROM ingredients
                    WHERE ingredients.id IN (
                        SELECT ingredient_id FROM recipes_ingredients
                        WHERE recipes_ingredients.recipe_id = $1
                        AND recipes_ingredients.ingredient_id
                        NOT IN (${Array.from(Object.values(updatedIngredients.rows)).map(i => i.id).join(", ")})
                        ${newIngredients.length > 0 ? `AND recipes_ingredients.ingredient_id
                        NOT IN (${newIngredients.map(i => i.id).join(", ")})` : ''}
                )`,
                    values: [req.params.recipe_id]
                });
            }

            if (updateValues.length > 0) {
                await client.query({
                    text: `UPDATE recipes SET ${updateValues.join(", ")} WHERE id = $${values.length + 1}`,
                    values: values.concat([req.params.recipe_id]),
                });
            }

            await client.query('COMMIT');

            const recipeRes = await db.query({
                text: `SELECT recipes.*, avg(ratings.rating) avg_rating, count(ratings) total_ratings, avg(user_ratings.rating) user_rating, author.username author_username,
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
select * from ingredients
where ingredients.id in (
select ingredient_id from recipes_ingredients
where recipes_ingredients.recipe_id = recipes.id
)
) ingredients ON TRUE
LEFT JOIN LATERAL (
select username
from users
where users.id = recipes.author_id
) author ON TRUE
WHERE recipes.id = $2
group by recipes.id, author.username;`,
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
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query({
                text: `DELETE FROM ingredients where id IN (
                    SELECT id FROM recipes_ingredients
                    WHERE recipes_ingredients.recipe_id = $1
                )`,
                values: [req.params.recipe_id],
            });

            await client.query({
                text: `DELETE FROM recipes WHERE id = $1`,
                values: [req.params.recipe_id],
            });

            await client.query('COMMIT');

            return res.status(200).send('Success!')
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(404).send(error);
        } finally {
            client.release();
        }
    });


module.exports = router;
