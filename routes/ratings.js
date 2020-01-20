const express = require('express'),
    router = express.Router(),
    User = require("../models/user"),
    Rating = require('../models/rating'),
    middleware = require('../middleware');

router.post('/rating', middleware.isLoggedIn, async (req, res) => {
    const exists = await Rating.findOne({
        recipe_id: req.body.recipe_id,
        author_id: req.user._id,
    });

    // edit or create new rating
    let rating;
    if (exists) {
        exists.rating = req.body.rating;
        await exists.save();
        rating = exists;
    } else {
        const newRating = new Rating({
            recipe_id: req.body.recipe_id,
            author_id: req.user._id,
            rating: req.body.rating,
        });
        await newRating.save();
        rating = newRating;
    }

    const avgRating = await Rating.aggregate([
        {
            "$group": {
                "_id": "$recipe_id",
                "avgRating": {"$avg": {"$ifNull": ["$rating", 0]}}
            }
        }
    ]);

    return res.status(200).json({
        rating,
        avgRating,
    });
});

module.exports = router;
