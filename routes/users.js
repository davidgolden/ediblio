const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
    middleware = require('../middleware'),
    ing = require('../js/conversions');

// SHOW USER'S RECIPES
// router.get('/users/:user_id', middleware.isLoggedIn, function(req, res) {
//
//     User.findById(req.params.user_id).populate('recipes').exec(function(err, user) {
//         if (err) {
//             return res.status(404).send(err)
//         }
//         else {
//             // return res.status(200).send({ user: user, recipes: req.user.recipes });
//
//             User.findById(req.params.user_id, function(err, user) {
//               if(err) {
//                 return res.status(404).send(err)
//               }
//               return res.status(200).send({ recipes: recipes, user: user });
//             })
//         }
//     });
// });

router.get('/users/:user_id', middleware.isLoggedIn, function(req, res) {
  let myRecipes = req.user.recipes;
  // find all recipes in user's recipe cloud
  Recipe.find({ '_id': { $in: myRecipes } }, function(err, recipes) {
    if (err) {
      return res.status(404).send(err)
    }
    else {
      return res.status(200).send({ recipes: recipes, user: req.user });
    }
  });
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

    User.findById(req.user._id, function(err, user) {
      if(err) {
        return res.status(404).send(err)
      }
      user.groceryList.splice(0, user.groceryList.length);
      ingredients.forEach((item) => {
        user.groceryList.push(item);
      })
      user.save();
      return res.status(200).send(JSON.stringify({ groceryList: user.groceryList }));
    })
});


// // DISPLAY GROCERY LIST STORE VERSION
// router.get('/grocery-list-text', middleware.isLoggedIn, function(req, res) {
//     User.findById(req.user._id).populate('menu').exec(function(err, user) {
//         if (err) {
//             return res.redirect('back');
//         }
//         res.render('grocery-list-text', { groceryList: user.groceryList, menu: user.menu });
//     });
// });
//
//
// // EDIT USER ROUTE
// router.post('/users/:user_id', middleware.isLoggedIn, function(req, res) {
//
//     User.findOne(req.user._id, function(err, user) {
//         if (err) {
//             return res.redirect('back');
//         }
//         // if username is changed, make sure it doesn't already exist
//         else if(req.body.username !== user.username) {
//             User.findOne({ username: req.body.username }, function(err, user) {
//                 if (err || user) {
//                     return res.redirect('back');
//                 }
//             });
//         }
//
//         // if email is changed, make sure it doesn't already exist
//         else if(req.body.email !== user.email) {
//             User.findOne({ email: req.body.email }, function(err, user) {
//                 if (err || user) {
//                     return res.redirect('back');
//                 }
//             });
//         }
//
//         else {
//             // update user information
//             user.username = req.body.username;
//             user.email = req.body.email;
//             user.password = req.body.password;
//             user.save();
//
//             // now update all recipe's authors with username
//             Recipe.find({ "author.id": user._id }, function(err, foundRecipes) {
//                 if (err) {
//                     return res.redirect('back');
//                 }
//                 foundRecipes.forEach(recipe => {
//                     recipe.author.username = req.body.username;
//                     recipe.save();
//                 });
//             });
//             res.redirect('back');
//         }
//
//     });
// });

module.exports = router;
