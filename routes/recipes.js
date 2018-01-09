const express = require('express'),
router = express.Router(),
User = require('../models/user'),
Recipe = require('../models/recipe'),
middleware = require('../middleware'),
ing = require('../js/conversions'),
urlMetadata = require('url-metadata');

// SHOW ALL RECIPES
router.get('/recipes', middleware.isLoggedIn, function(req, res) {
  let myRecipes = req.user.recipes;
  // find all recipes not in user's recipe cloud
  Recipe.find({ '_id': { $nin: myRecipes } }, function(err, recipes) {
    if (err) {
      return res.status(404).send(err)
    }
    else {
      return res.status(200).send({ recipes: recipes, user: req.user });
    }
  });
});

//IMAGE SCRAPER
router.post('/scrape', function(req, res) {
  urlMetadata(req.body.imageUrl, {timeout: 10000}).then(
    function(metadata) { // success handler
      return res.status(200).send(metadata["og:image"]);
    },
    function(error) { // failure handler
      return res.status(404).send('')
    });
  });


  // CREATE RECIPE ROUTE
  router.post('/recipes', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user) {
      if (err) {
        return res.status(404).send(err);
      }
      else {
        Recipe.create(req.body.recipe, function(err, newRecipe) {
          if (err) {
            return res.status(404).send(err);
          }
          // add author info to recipe
          newRecipe.author.id = req.user._id;
          newRecipe.author.username = req.user.username;

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
  });

  // ADD RECIPE TO OWN CLOUD
  router.post('/recipes/add', middleware.isLoggedIn, function(req, res) {
      let recipe = req.body.recipe;
      User.findById(req.user._id, function(err, user) {
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
  router.post('/recipes/remove', function(req, res) {
      var recipe = req.body.recipe;
      User.findById(req.user._id, function(err, user) {
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


  //
  // // Edit Recipe Route
  // router.put('/recipes/:recipe_id', middleware.checkRecipeOwnership, function(req, res) {
  //
  //     // here need to find recipe by id, delete all ingredients, and push new ingredients
  //     let updatedRecipe = req.body.recipe;
  //     let ingredients = req.body.ingredient;
  //     let count;
  //     if (Array.isArray(ingredients.measurement)) { count = ingredients.measurement.length; }
  //     else { count = 1 }
  //
  //     // find current user
  //     Recipe.findOne({ "_id": req.params.recipe_id }, function(err, recipe) {
  //         if (err) {
  //             return res.redirect('back');
  //         }
  //         // delete all list items
  //         recipe.name = updatedRecipe.name;
  //         recipe.url = updatedRecipe.url;
  //         recipe.notes = updatedRecipe.notes;
  //         recipe.image = updatedRecipe.image;
  //         recipe.tags = updatedRecipe.tags;
  //         recipe.ingredients.splice(0, recipe.ingredients.length);
  //         recipe.save();
  //         // loop of number of ingredients
  //         for (let i = 0; i < count; i++) {
  //             // if checkbox is on, delete grocery list ingredient with id at index i
  //             recipe.ingredients.push(ing.createIng(ingredients, i));
  //             recipe.save();
  //         }
  //
  //         res.redirect(`/recipes/${recipe._id}`);
  //     });
  //
  //
  // });
  //
  // Delete Recipe Route
  router.delete('/recipes/:recipe_id', middleware.checkRecipeOwnership, function(req, res) {
      Recipe.findByIdAndRemove(req.params.recipe_id, function(err) {
          if (err) {
              return res.status(404).send(err)
          }
          return res.status(200).send('Success!')
      });
  });



  // add recipe ingredients to grocery list
  router.post('/recipes/:recipe_id/add', function(req, res) {
    let ingredients = req.body.ingredients;
    let recipe = req.params.recipe_id;

    User.findById(req.user, function(err, user) {
      if (err) {
        return res.status(404).send(err)
      }
      Recipe.findById({ "_id": recipe }, function(err, recipe) {
        if (err) {
          return res.status(404).send(err)
        }
        // user.menu.push(recipe);
        user.save();
      });

      var currentListItems = user.groceryList.map((item) => {
        return item.name;
      })

      function onCurrentList(ingredient) {
        function equalsPossibleForm(item) {
          if(item === ingredient || item === ingredient+'s' || item === ingredient+'es' || item === ingredient.slice(0,-1) || item === ingredient.slice(0,-2)) {
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
        if(onCurrentList(ingredient.name) >= 0) {
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
            user.groceryList.push(ingredient);
            return user.save();
          }
        } else {
          // here if ingredient is not on current list
          user.groceryList.splice(ingredients.length, 0, ingredient);
          return user.save();
        }
      })
      return res.status(200).send({message: 'Added recipe!'})
    })

  });


  module.exports = router;
