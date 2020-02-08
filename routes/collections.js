const express = require('express'),
    router = express.Router(),
    Collection = require('../models/collection'),
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

router.delete('/collections/:collection_id', middleware.isLoggedIn, async (req, res) => {
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

router.patch('/collections/:collection_id', middleware.isLoggedIn, async (req, res) => {
    const collection = await Collection.findOneAndUpdate({"_id": req.params.collection_id}, req.body, {new: true});
    res.status(200).json({collection});
});

router.get('/collections/:collection_id', async (req, res) => {
    const response = await db.query({
        text: `SELECT collections.*,
COALESCE(json_agg(recipes) FILTER (WHERE recipes IS NOT NULL), '[]') recipes
FROM collections
LEFT JOIN LATERAL (
select recipes.*, users.profile_image author_image
from recipes
LEFT JOIN LATERAL (
select profile_image
from users
where users.id = recipes.author_id
) users ON True
where recipes.id in (
select recipe_id
from recipes_collections
where recipes_collections.collection_id = collections.id
)
) recipes ON TRUE 
WHERE collections.id = $1
group by collections.id;`,
        values: [req.params.collection_id]
    });
    res.status(200).json({
        collection: response.rows[0],
    });

});

module.exports = router;
