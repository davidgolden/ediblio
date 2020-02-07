const express = require('express'),
    router = express.Router(),
    Collection = require('../models/collection'),
    User = require("../models/user"),
    Recipe = require("../models/recipe"),
    middleware = require('../middleware');

const db = require("../db/index");

router.post('/collections', middleware.isLoggedIn, async (req, res) => {
    const collection = new Collection({
        recipes: [],
        name: req.body.name,
        ownerId: req.user._id,
    });
    await collection.save();
    const user = await User.findByIdAndUpdate(req.user._id, {
        "$push": {
            collections: collection._id,
        }
    }, {new: true})
        .populate('collections')
        .exec();
    res.status(200).json({user});
});

router.delete('/collections/:collection_id', middleware.isLoggedIn, async (req, res) => {
    const collection = await Collection.findById(req.params.collection_id);
    if (collection.ownerId.toString() === req.user._id.toString()) {
        await Collection.findByIdAndDelete(req.params.collection_id);
        const user = await User.findByIdAndUpdate(req.user._id, {
            "$pull": {
                collections: req.params.collection_id,
            }
        }, {new: true});
        return res.status(200).json({user});
    }
    return res.sendStatus(404);
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
