const express = require('express'),
    router = express.Router(),
    middleware = require('../middleware');

const db = require("../db/index");

router.post('/rating', middleware.isLoggedIn, async (req, res) => {
    try {
        await db.query("BEGIN");
        const exists = await db.query({
            text: `SELECT * FROM ratings WHERE recipe_id = $1 AND author_id = $2`,
            values: [req.body.recipe_id, req.user.id],
        });

        // edit or create new rating
        let rating;
        if (exists.rows.length > 0) {
            // exists
            rating = await db.query({
                text: `UPDATE ratings SET rating = $1 WHERE id = $2 RETURNING *`,
                values: [req.body.rating, exists.rows[0].id],
            });
        } else {
            rating = await db.query({
                text: `INSERT INTO ratings (recipe_id, author_id, rating) VALUES ($1, $2, $3) RETURNING *`,
                values: [req.body.recipe_id, req.user.id, req.body.rating],
            })
        }

        const average = await db.query({
            text: `SELECT avg(rating) FROM ratings WHERE recipe_id = $1 GROUP BY id`,
            values: [req.body.recipe_id],
        });

        await db.query('COMMIT');


        return res.status(200).json({
            rating: rating.rows[0],
            avg_rating: average.rows[0].avg,
        });
    } catch (error) {
        await db.query('ROLLBACK');
        return res.status(404).send(error);
    }
});

module.exports = router;
