const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
    middleware = require('../middleware'),
    urlMetadata = require('url-metadata');
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

// get all recipes
router.route('/recipes')
    .get((req, res) => {
        let q = Recipe.find({});
        if (req.query.tag) {
            q = q.where('tags')
                .in(req.query.tag)
        }
        if (req.query.author) {
            q = q.where('author.id')
                .equals(req.query.author);
        }
        q.exec((err, recipes) => {
            if (err) {
                res.status(404).send(err)
            }
            return res.status(200).send({recipes: recipes});
        });
    })
    .post(middleware.isLoggedIn, (req, res) => {
        // create new recipe
        Recipe.create(req.body.recipe, function (err, newRecipe) {
            if (err) {
                return res.status(404).send(err);
            }
            // add author info to recipe
            newRecipe.author.id = req.user._id;
            newRecipe.author.username = req.user.username;
            newRecipe.created = Date.now();
            // save recipe
            newRecipe.save();
            // add recipe to user
            req.user.recipes.push(newRecipe);
            req.user.save();
            return res.sendStatus(200);
        });
    });

router.route('/recipes/:recipe_id')
    .get((req, res) => {
        Recipe.findById(req.params.recipe_id, (err, recipe) => {
            if (err) {
                return res.status(404).send(err);
            }
            return res.status(200).json({recipe: recipe});
        })
    })
    .delete(middleware.checkRecipeOwnership, (req, res) => {
        Recipe.findByIdAndRemove(req.params.recipe_id, function (err) {
            if (err) {
                return res.status(404).send(err)
            }
            return res.status(200).send('Success!')
        });
    });

// router.route('/users/:user_id/recipes')
// // get all user recipes
//     .get((req, res) => {
//         Recipe.find({
//             $or: [
//                 {'_id': {$in: req.user.recipes}},
//                 {'author.id': req.params.user_id},
//             ]
//         }, function (err, recipes) {
//             if (err) {
//                 return res.status(404).send(err)
//             }
//             else {
//                 return res.status(200).send({recipes: recipes});
//             }
//         }).sort({'Date': -1});
//     });


module.exports = router;
