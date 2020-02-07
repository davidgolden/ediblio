const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
    Rating = require('../models/rating'),
    middleware = require('../middleware'),
    cloudinary = require('cloudinary');

const db = require('../db');

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

        let text = `SELECT DISTINCT recipes.*, recipes.id::int, users.profile_image AS author_image 
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

        // Recipe.create({
        //     ...req.body.recipe,
        //     author_id: req.user._id,
        // }, function (err, newRecipe) {
        //     if (err) {
        //         return res.status(404).send({detail: err.message});
        //     }
        //
        //     newRecipe.save();
        //     return res.sendStatus(200);
        // });
    });

router.route('/recipes/:recipe_id')
    .get(async (req, res) => {
        let response;

        if (req.user) {
            response = await db.query({
                text: `SELECT recipes.*, recipes.id::int, avg(ratings.rating) avg_rating, count(ratings) total_ratings, avg(user_ratings.rating) user_rating, author.username author_username,
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
select id from recipes_ingredients
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
                text: `SELECT recipes.*, recipes.id::int, avg(ratings.rating) avg_rating, count(ratings) total_ratings, author.username author_username,
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
        // if (req.body.image) { // delete old image before image is changed
        //     const recipe = await Recipe.findById(req.params.recipe_id);
        //     cloudinary.v2.uploader.destroy(recipe.image);
        // }
        Recipe.findOneAndUpdate({_id: req.params.recipe_id}, {...req.body}, {new: true}, (err, recipe) => {
            if (err) {
                return res.status(404).send({detail: err.message})
            }
            return res.status(200).json({recipe: recipe});
        });
    })
    .delete(middleware.checkRecipeOwnership, async (req, res) => {
        Recipe.findById(req.params.recipe_id, (err, recipe) => {
            if (err) {
                return res.status(404).send({detail: err.message})
            }

            // cloudinary.v2.uploader.destroy(recipe.image);
            recipe.remove();

            return res.status(200).send('Success!')
        });
    });


module.exports = router;
