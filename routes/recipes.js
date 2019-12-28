const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
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

        const aggregationQuery = [];
        if (req.query.tags) {
            const filterTags = req.query.tags.split(',');
            aggregationQuery.push({
                $match: {
                    tags: {
                        $all: filterTags,
                    }
                }
            })
        }
        if (req.query.author) {
            aggregationQuery.push({
                $match: {author_id: req.query.author}
            });
        }
        if (req.query.searchTerm) {
            const escapedInput = req.query.searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedInput, 'gmi');
            aggregationQuery.push({
                $match: {
                    $or: [
                        {name: regex},
                        {
                            ingredients: {
                                $elemMatch: {name: regex}
                            }
                        }
                    ]
                }
            })
        }

        aggregationQuery.push({
            $sort: {[req.query.sortBy]: req.query.orderBy === 'desc' ? -1 : 1}
        }, {
            $project: {
                author_id: 1,
                name: 1,
                image: 1,
                image_defined: {
                    $cond: [
                        {$ifNull: ["$image", false]},
                        true,
                        false
                    ]
                },
                contains_ingredients: {$gt: [{$size: "$ingredients"}, 0]},
            }
        }, {
            $sort: {"contains_ingredients": -1, "image_defined": -1}
        }, {
            $skip: skip
        }, {
            $limit: page_size,
        });

        await Recipe.aggregate(aggregationQuery)
            .exec((err, recipes) => {
                Recipe.populate(recipes, {
                    path: "author_id",
                    ref: "users",
                    select: "id username profileImage"
                }, function(err, populatedRecipes) {
                    return res.status(200).send({recipes: populatedRecipes});
                });

            })
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
    .get((req, res) => {
        Recipe.findById(req.params.recipe_id, (err, recipe) => {
            if (err) {
                return res.status(404).send({detail: err.message});
            }
            return res.status(200).json({recipe: recipe});
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
