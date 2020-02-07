const db = require("../db/index");

var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(404).send({ detail: 'You need to be logged in to do that!' })
};

middlewareObj.checkRecipeOwnership = async (req, res, next) => {
  // is user logged in?
  if(req.isAuthenticated()) {
    const response = await db.query({
      text: `SELECT * FROM recipes WHERE id = $1 AND author_id = $2`,
      values: [req.params.recipe_id, req.user.id]
    });

    if (response.rows.length === 0) {
      return res.status(404).send({ detail: "You don't have permission to do that!" })
    }

    next();
  } else {
    return res.status(404).send({ detail: 'You need to be logged in to do that!' })
  }
};

module.exports = middlewareObj;
