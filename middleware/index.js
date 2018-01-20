var Recipe = require('../models/recipe');

var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(404).send('You need to be logged in to do that!')
};

middlewareObj.checkRecipeOwnership = (req, res, next) => {
  // is user logged in?
  if(req.isAuthenticated()) {
    Recipe.findById(req.params.recipe_id, function(err, recipe) {
      if(err) {
        return res.status(404).send(err)
      } else if(!recipe) {
        return res.status(404).send('Recipe does not exist!')
      } else {
        // does user own the campground?
        // use equals because one is mongoose object and one is string
        if(recipe.author.id.equals(req.user._id) || req.user.isAdmin === true) {
          // if so, redirect
          next();
        } else {
          // if not, redirect
          return res.status(404).send("You don't have permission to do that!")
        }
      }
    });
  } else {
    return res.status(404).send('You need to be logged in to do that!')
  }
};

module.exports = middlewareObj;
