const db = require("../db/index");
const {verifyJWT} = require("../utils");

var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.user && req.user.id) {
    next();
  } else {
    return res.status(404).send({ detail: 'You need to be logged in to do that!' })
  }
};

middlewareObj.checkRecipeOwnership = async (req, res, next) => {
  // is user logged in?
  middlewareObj.isLoggedIn(req, res, next);
  const response = await db.query({
    text: `SELECT * FROM recipes WHERE id = $1 AND author_id = $2`,
    values: [req.params.recipe_id, req.user.id]
  });

  if (response.rows.length === 0) {
    return res.status(404).send({ detail: "You don't have permission to do that!" })
  }

  next();
};

middlewareObj.checkIngredientOwnership = async (req, res, next) => {
  // is user logged in?
  middlewareObj.isLoggedIn(req, res, next);
  const response = await db.query({
    text: `SELECT * FROM users_ingredients_groceries WHERE id = $1 AND user_id = $2`,
    values: [req.params.ingredient_id, req.user.id]
  });

  if (response.rows.length === 0) {
    return res.status(404).send({ detail: "You don't have permission to do that!" })
  }

  next();
};

middlewareObj.checkCollectionOwnership = async (req, res, next) => {
  // is user logged in?
  middlewareObj.isLoggedIn(req, res, next);
  const response = await db.query({
    text: `SELECT * FROM collections WHERE id = $1 AND author_id = $2`,
    values: [req.params.collection_id, req.user.id]
  });

  if (response.rows.length === 0) {
    return res.status(404).send({ detail: "You don't have permission to do that!" })
  }

  next();
};

module.exports = middlewareObj;
