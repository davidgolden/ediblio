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
    .get((req, res) => {
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
            .populate('author_id', {
                'id': 'author_id',
                'username': 'username',
                'profileImage': 'profileImage',
            }, 'users')
            .exec((err, recipes) => {
                if (err) {
                    res.status(404).send({detail: err.message})
                }
                return res.status(200).send({recipes: recipes});
            });
    })
    .post(middleware.isLoggedIn, (req, res) => {
        // create new recipe
        Recipe.create(req.body.recipe, function (err, newRecipe) {
            if (err) {
                return res.status(404).send({detail: err.message});
            }

            cloudinary.v2.uploader.upload(req.body.recipe.image,
                {
                    resource_type: "image",
                    public_id: `users/${req.user._id}/recipes/${newRecipe._id}`,
                    overwrite: true,
                },
                (error, result) => {
                    newRecipe.image = result.secure_url;

                    // add author info to recipe
                    newRecipe.author_id = req.user._id;
                    // save recipe
                    newRecipe.save();
                    // add recipe to user

                    // TODO: this needs to be replaced with adding to user's favorites
                    // User.findOne({"_id": req.user._id}, (err, user) => {
                    //     user.recipes.push(newRecipe);
                    //     user.save();
                    // });

                    return res.sendStatus(200);
                });
        });
    });

router.route('/recipes/:recipe_id')
    .get((req, res) => {
        Recipe.findById(req.params.recipe_id)
            .populate('author_id', {
                'username': 'username',
                'profileImage': 'profileImage',
            }, 'users')
            .exec((err, recipe) => {
            if (err) {
                return res.status(404).send({detail: err.message});
            }
            return res.status(200).json({recipe: recipe});
        })
    })
    .patch(middleware.checkRecipeOwnership, (req, res) => {
        Recipe.findOneAndUpdate({_id: req.params.recipe_id}, {...req.body}, {new: true}, (err, recipe) => {
            if (err) {
                return res.status(404).send({detail: err.message})
            }

            if (req.body.image) {
                cloudinary.v2.uploader.upload(req.body.image,
                    {
                        resource_type: "image",
                        public_id: `users/${req.user._id}/recipes/${recipe._id}`,
                        overwrite: true,
                    },
                    (error, result) => {
                        recipe.image = result.secure_url;
                        recipe.save();
                        return res.status(200).json({recipe: recipe});
                    });
            } else {
                return res.status(200).json({recipe: recipe});
            }
        });
    })
    .delete(middleware.checkRecipeOwnership, (req, res) => {
        Recipe.findById(req.params.recipe_id, (err, recipe) => {
            if (err) {
                return res.status(404).send({detail: err.message})
            }

            recipe.remove();

            return res.status(200).send('Success!')
        });
    });


module.exports = router;
