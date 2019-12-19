const express = require('express'),
    router = express.Router(),
    Collection = require('../models/collection'),
    User = require("../models/user"),
    Recipe = require("../models/recipe"),
    middleware = require('../middleware');

router.post('/collections', middleware.isLoggedIn, async (req, res) => {
    const collection = new Collection({
        recipes: [],
        name: req.body.name,
        ownerId: req.session.user._id,
    });
    await collection.save();
    const user = await User.findByIdAndUpdate(req.session.user._id, {
        "$push": {
            collections: collection._id,
        }
    }, {new: true});
    res.status(200).json({user});
});

router.delete('/collections/:collection_id', middleware.isLoggedIn, async (req, res) => {
    const collection = await Collection.findById(req.params.collection_id);
    if (collection.ownerId.toString() === req.session.user._id) {
        await Collection.findByIdAndDelete(req.params.collection_id);
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
});

router.patch('/collections/:collection_id', middleware.isLoggedIn, async (req, res) => {
    const collection = await Collection.findOneAndUpdate({"_id": req.params.collection_id}, req.body, {new: true});
    res.status(200).json({collection});
});

router.get('/collections/:collection_id', async (req, res) => {
    const collection = await Collection.findById(req.params.collection_id);
    await Recipe.where({
        "_id": {
            "$in": collection.recipes,
        }
    })
        .populate('author_id', {
            'username': 'username',
            'profileImage': 'profileImage',
        }, 'users')
        .exec(function (err, recipes) {
            res.status(200).json({
                collection: {
                    _id: collection._id,
                    name: collection.name,
                    recipes
                }
            });
        });

});

module.exports = router;
