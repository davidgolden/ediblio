const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
    middleware = require('../middleware'),
    ing = require('../public/js/conversions'),
    urlMetadata = require('url-metadata');

/*

/reset
/forgot
/scrape

/r -> get all recipes [GET recipes]
/u -> get all users [GET users, POST user]
/u/:u -> get specific user [GET user, PUT user]
/u/:u/r -> get all user recipes [GET recipes, POST user recipe]
/u/:u/r/:r -> get specific user recipe

 */

// SHOW ALL RECIPES
router.get('/recipes', function (req, res) {
    // find all recipes not in user's recipe cloud
    Recipe.find({}, function (err, recipes) {
        if (err) {
            return res.status(404).send(err)
        }
        else {
            return res.status(200).send({recipes: recipes});
        }
    }).sort({'Date': -1});
});

// CREATE RECIPE ROUTE
router.post('/users/:user_id/recipes', middleware.isLoggedIn, function (req, res) {
    let id = req.body.id;

    Recipe.findById(id, function (err, recipe) {
        if (err) {
            return res.status(404).send(err);
        } else if (!recipe) {
            User.findById(req.user._id, function (err, user) {
                if (err) {
                    return res.status(404).send(err);
                }
                else {
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
                        user.recipes.push(newRecipe);
                        user.save();
                        console.log('created!')
                        return res.sendStatus(200);
                    });
                }
            });
        } else if (recipe) {
            // update recipe here
            let newRecipe = req.body.recipe;
            // update ingredients
            recipe.name = newRecipe.name;
            recipe.url = newRecipe.url;
            recipe.notes = newRecipe.notes;
            recipe.image = newRecipe.image;
            recipe.tags = newRecipe.tags;
            recipe.ingredients.splice(0, recipe.ingredients.length);
            newRecipe.ingredients.forEach((ingredient) => {
                recipe.ingredients.push(ingredient);
            })
            recipe.save();
            // send recipe in response
            return res.status(200).send(JSON.stringify({recipe: recipe}))
        }
    })

});

// UPDATE user
router.put('/users/:user_id', middleware.isLoggedIn, function (req, res) {
    let recipe = req.body.recipe;
    User.findById(req.user._id, function (err, user) {
        if (err) {
            return res.status(404).send(err)
        }
        let has = false;
        for (let i = 0; i < user.recipes.length; i++) {
            if (recipe._id.toString() === user.recipes[i].toString()) {
                has = true;
            }
        }
        if (has === false) {
            user.recipes.push(recipe);
            user.save();
            return res.status(200).send('Recipe added!')
        }
    });
});

// AJAX Remove (not delete) Recipe Route
router.post('/recipes/remove', function (req, res) {
    var recipe = req.body.recipe;
    User.findById(req.user._id, function (err, user) {
        if (err) {
            return res.status(404).send(err)
        }

        for (var i = 0; i < user.recipes.length; i++) {
            if (user.recipes[i].toString() === recipe._id.toString()) {
                user.recipes.splice(i, 1);
                user.save();
                return res.status(200).send('Recipe added!')
            }
        }
    });
});

// Delete Recipe Route
router.delete('/recipes/:recipe_id', middleware.checkRecipeOwnership, function (req, res) {
    Recipe.findByIdAndRemove(req.params.recipe_id, function (err) {
        if (err) {
            return res.status(404).send(err)
        }
        return res.status(200).send('Success!')
    });
});

router.get('/recipes/:recipe_id', (req, res) => {
    Recipe.findById(req.params.recipe_id, (err, recipe) => {
        if (err) {
            return res.status(404).send(err);
        }
        return recipe;
    })
});


// add recipe ingredients to grocery list
router.post('/recipes/:recipe_id/add', function (req, res) {
    let ingredients = req.body.ingredients;
    let recipe = req.params.recipe_id;

    User.findById(req.user._id, function (err, user) {
        if (err) {
            return res.status(404).send(err)
        }

        user.menu.splice(user.menu.length, 0, recipe);
        // user.menu.push(recipe);
        user.save();

        var currentListItems = user.groceryList.map((item) => {
            return item.name;
        })

        function onCurrentList(ingredient) {
            function equalsPossibleForm(item) {
                if (item === ingredient || item === ingredient + 's' || item === ingredient + 'es' || item === ingredient.slice(0, -1) || item === ingredient.slice(0, -2)) {
                    return true;
                } else {
                    return false;
                }
            }

            let i = currentListItems.findIndex(equalsPossibleForm)
            return i;
        }

        // for each item on ingredient list
        ingredients.forEach((ingredient) => {
            if (ingredient.quantity === null || ingredient.name === '') {
                console.log('returning')
                return;
            } else {
                console.log('adding ingredient')
                if (onCurrentList(ingredient.name) >= 0) {
                    let i = onCurrentList(ingredient.name);
                    let m = user.groceryList[i].measurement;
                    let q = user.groceryList[i].quantity;
                    // check if item can be added
                    if (ing.canBeAdded(m, ingredient.measurement) === true) {
                        // if it can be added, add it
                        let newQM = ing.add(q, m, Number(ingredient.quantity), ingredient.measurement);
                        user.groceryList[i].quantity = newQM.quantity;
                        user.groceryList[i].measurement = newQM.measurement;
                        return user.save();
                    } else {
                        // if it can't be added, push it to grocery list
                        user.groceryList.splice(user.groceryList.length, 0, ingredient);
                        // user.groceryList.push(ingredient);
                        return user.save();
                    }
                } else {
                    // here if ingredient is not on current list
                    user.groceryList.splice(user.groceryList.length, 0, ingredient);
                    // user.groceryList.push(ingredient);
                    return user.save();
                }
            }
        })
        return res.status(200).send({message: 'Added recipe!'})
    })

});


module.exports = router;
