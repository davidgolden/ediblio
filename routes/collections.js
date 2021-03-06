const express = require('express'),
    router = express.Router(),
    middleware = require('../middleware');

const db = require("../db/index");

const selectUserWithCollections = `
        SELECT users.*,
        COALESCE(json_agg(c) FILTER (WHERE c IS NOT NULL), '[]') collections
        FROM users
        LEFT JOIN LATERAL (
            SELECT collections.*, COALESCE(json_agg(cr) FILTER (WHERE cr IS NOT NULL), '[]') recipes
                FROM collections LEFT JOIN LATERAL (
                SELECT * FROM recipes
        WHERE recipes.id IN (
            SELECT recipe_id FROM recipes_collections
            WHERE recipes_collections.collection_id = collections.id
        )
   ) cr ON true
   WHERE collections.author_id = users.id
   GROUP BY collections.id
) c ON true
WHERE users.id = $1
GROUP BY users.id;
        `;

const selectCollectionWithRecipes = `
SELECT collections.*,
COALESCE(json_agg(recipes) FILTER (WHERE recipes.id IS NOT NULL), '[]') recipes
FROM collections
LEFT JOIN LATERAL (
    select recipes.*, users.profile_image author_image, avg(ratings.rating) avg_rating, count(ratings) total_ratings
    from recipes
    LEFT JOIN LATERAL (
        select profile_image
        from users
        where users.id = recipes.author_id
    ) users ON True
    LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE
    where recipes.id in (
        select recipe_id
        from recipes_collections
        where recipes_collections.collection_id = collections.id
    )
    GROUP BY recipes.id, users.profile_image
) recipes ON TRUE 
WHERE collections.id = $1
GROUP BY collections.id;`;

router.post('/collections', middleware.isLoggedIn, async (req, res) => {
    await db.query({
        text: `INSERT INTO collections (name, author_id) VALUES ($1, $2)`,
        values: [req.body.name, req.user.id],
    });

    const response = await db.query({
        text: selectUserWithCollections,
        values: [req.user.id]
    });

    return res.status(200).json({user: response.rows[0]});
});

router.route('/collections/:collection_id')
    .get(async (req, res) => {
        const response = await db.query({
            text: selectCollectionWithRecipes,
            values: [req.params.collection_id]
        });
        res.status(200).json({
            collection: response.rows[0],
        });
    })
    .delete(middleware.isLoggedIn, async (req, res) => {
        try {
            const collectionRes = await db.query({
                text: `DELETE FROM collections WHERE id = $1 AND is_primary != true`,
                values: [req.params.collection_id],
            });

            if (collectionRes.rows.length > 0) {
                await db.query({
                    text: `DELETE FROM users_collections_followers WHERE collection_id = $1`,
                    values: [req.params.collection_id],
                });
            }

            const response = await db.query({
                text: selectUserWithCollections,
                values: [req.user.id],
            });

            return res.status(200).json({user: response.rows[0]});
        } catch (error) {
            return res.sendStatus(404);
        }
    });

router.route('/collections/:collection_id/recipes/:recipe_id')
    // add recipe to collection
    .post(middleware.checkCollectionOwnership, async (req, res) => {
        try {
            await db.query({
                text: `INSERT INTO recipes_collections (recipe_id, collection_id) VALUES ($1, $2)`,
                values: [req.params.recipe_id, req.params.collection_id],
            });

            return res.sendStatus(200);
        } catch (error) {
            return res.status(404).send({detail: error.message});
        }
    })
    // remove recipe from collection
    .delete(middleware.checkCollectionOwnership, async (req, res) => {
        try {
            await db.query({
                text: `DELETE FROM recipes_collections WHERE recipe_id = $1 AND collection_id = $2`,
                values: [req.params.recipe_id, req.params.collection_id],
            });

            return res.sendStatus(200);
        } catch (error) {
            return res.status(404).send({detail: error.message});
        }
    });

module.exports = router;
