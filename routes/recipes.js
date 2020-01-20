const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
    Rating = require('../models/rating'),
    middleware = require('../middleware'),
    cloudinary = require('cloudinary');

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

        let q = Recipe.find({});
        if (req.query.tags) {
            const filterTags = req.query.tags.split(',');
            q = q.where({
                'tags': {
                    '$all': filterTags,
                }
            })
        }
        if (req.query.author) {
            q = q.where('author_id')
                .equals(req.query.author);
        }
        if (req.query.searchTerm) {
            const escapedInput = req.query.searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedInput, 'gmi');
            q = q.or([
                {'name': regex},
                {
                    'ingredients': {
                        '$elemMatch': {name: regex}
                    }
                }
            ]);
        }
        q.limit(page_size)
            .skip(skip)
            .sort({[req.query.sortBy]: req.query.orderBy})
            .exec((err, recipes) => {
                if (err) {
                    res.status(404).send({detail: err.message})
                }
                return res.status(200).send({recipes: recipes});
            });
    })
    .post(middleware.isLoggedIn, (req, res) => {
        // create new recipe
        Recipe.create({
            ...req.body.recipe,
            author_id: req.user._id,
        }, function (err, newRecipe) {
            if (err) {
                return res.status(404).send({detail: err.message});
            }

            newRecipe.save();
            return res.sendStatus(200);
        });
    });

router.route('/recipes/:recipe_id')
    .get(async (req, res) => {
        const recipe = await Recipe.findById(req.params.recipe_id);
        const rating = await Rating.aggregate([
            { "$group": {
                    "_id": "$recipe_id",
                    "avgRating": { "$avg": { "$ifNull": ["$rating",0 ] } }
                }}
        ]);
        console.log('rating: ', rating);
        return res.status(200).json({
            recipe: {
                ...recipe._doc,
                rating,
            }
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
