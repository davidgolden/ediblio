const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
    middleware = require('../middleware'),
    ing = require('../js/conversions');

// SHOW USER'S RECIPES
router.get('/users/:user_id', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user) {
      if(err) {
        return res.status(404).send(err)
      }
      let recipes = user.recipes;
      // find all recipes in user's recipe cloud
      Recipe.find({ '_id': { $in: recipes } }, function(err, recipes) {
        if (err) {
          return res.status(404).send(err)
        }
        else {
          return res.status(200).send({ recipes: recipes, user: req.user });
        }
      }).sort({ 'Date': -1 });
    })
});

// DISPLAY GROCERY LIST
router.get('/grocery-list', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate('menu').exec(function(err, user) {
        if (err) {
            return res.status(404).send(err)
        }
        return res.status(200).send({ groceryList: user.groceryList, menu: user.menu });
    });
});

// UPDATE GROCERY LIST
router.put('/grocery-list', middleware.isLoggedIn, function(req, res) {
    let ingredients = req.body.ingredients;
    let menu = req.body.menu;

    User.findById(req.user._id, function(err, user) {
      if(err) {
        return res.status(404).send(err)
      }
      user.groceryList.splice(0, user.groceryList.length);
      ingredients.forEach((item) => {
        // user.groceryList.push(item);
        user.groceryList.splice(user.groceryList.length, 0, item);
        user.save();
      })

      user.menu.splice(0, user.menu.length);
      menu.forEach((item) => {
        // user.menu.push(item);
        user.menu.splice(user.menu.length, 0, item);
        user.save();
      })

      user.populate('menu', function(err, user) {
        if (err) {
            return res.status(404).send(err)
        }
        return res.status(200).send(JSON.stringify({ groceryList: user.groceryList, menu: user.menu }));
      })
    })
});

// EDIT USER ROUTE
router.post('/users/:user_id', middleware.isLoggedIn, function(req, res) {

    User.findOne(req.user._id, function(err, currentUser) {
        if (err) {
            return res.status(404).send(err)
        }
        // if username is changed, make sure it doesn't already exist
        if(req.body.username !== currentUser.username) {
            User.findOne({ username: req.body.username }, function(err, user) {
                if (err) {
                    return res.status(404).send(err)
                } else if(user) {
                  return res.status(404).send('Username already exists!')
                } else {
                  currentUser.username = req.body.username;
                  currentUser.save();

                  Recipe.find({ "author.id": currentUser._id }, function(err, foundRecipes) {
                      if (err) {
                          return res.status(404).send(err)
                      }
                      foundRecipes.forEach(recipe => {
                          recipe.author.username = req.body.username;
                          recipe.save();
                      });
                  });
                }
            });
        }

        // if email is changed, make sure it doesn't already exist
        else if(req.body.email !== currentUser.email) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (err) {
                    return res.status(404).send(err)
                } else if(user) {
                  return res.status(404).send('Email already exists!')
                } else {
                  currentUser.email = req.body.email;
                  currentUser.save();
                }
            });
        }

        else if(req.body.password !== currentUser.password) {
          currentUser.password = req.body.password;
          currentUser.save();
        }


        return res.status(200).send('Updated profile!')

    });
});

module.exports = router;
