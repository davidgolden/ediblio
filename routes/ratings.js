const express = require('express'),
    router = express.Router(),
    User = require("../models/user"),
    Rating = require('../models/rating'),
    middleware = require('../middleware');

router.post('/rating', middleware.isLoggedIn, async (req, res) => {
    const rating = new Rating({
        recipe_id: req.body.recipe_id,
        author_id: req.user._id,
        rating: req.body.rating,
    });
    await rating.save();
    return res.status(200).json({rating});
});

module.exports = router;
