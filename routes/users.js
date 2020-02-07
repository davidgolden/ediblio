const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Collection = require('../models/collection'),
    middleware = require('../middleware');

const cloudinary = require('cloudinary');

const db = require("../db/index");

cloudinary.config({
    cloud_name: 'recipecloud',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

router.route('/users')
    // get all users
    .get((req, res) => {
        User.find({}, function (err, users) {
            if (err) {
                return res.status(404).send({detail: err.message})
            } else {
                return res.status(200).send({users: users});
            }
        }).sort({'Date': -1});
    })
    // create new user (register)
    .post((req, res) => {
        let newUser = new User({
            username: req.body.username,
            email: req.body.email.toLowerCase(),
            password: req.body.password
        });
        newUser.save((err, user) => {
            if (err) {
                return res.status(404).send({detail: err.message});
            }

            req.login(user, function () {
                res.status(200).json({user: req.user});
            });
        });
    });

router.route('/users/:user_id/menu')
    .post(middleware.isLoggedIn, async (req, res) => {
        db.query(`INSERT INTO users_menu_recipe (user_id, recipe_id) VALUES ($1, $2)`, [req.user.id, req.body.recipe_id]);
    });

router.route('/users/:user_id')
    // update user
    .patch(middleware.isLoggedIn, async (req, res) => {
        const update = {};

        for (let key in req.body) {
            if (req.body.hasOwnProperty(key) && key !== 'profileImage') {
                update[key] = req.body[key];
            } else if (key === 'profileImage') {
                update.profileImage = await cloudinary.v2.uploader.upload(req.body.profileImage,
                    {
                        resource_type: "image",
                        public_id: `users/${req.user._id}/profileImage`,
                        overwrite: true,
                        transformation: [
                            {width: 400, height: 400, gravity: "face", radius: "max", crop: "crop"},
                            {height: 200, width: 200, crop: "fill"}
                        ]
                    });
            }
        }

        const user = await User.findOneAndUpdate({"_id": req.user._id}, update, {new: true})
            .populate('collections');

        return res.status(200).json({user: user})
    })
    .get(async (req, res) => {
        let response;
        if (req.isAuthenticated() && req.user.id.toString() === req.params.user_id) {
            response = await db.query({
                text: `SELECT * FROM users
                WHERE users.id = $1`,
                values: [req.params.user_id]
            })
        } else {
            response = await db.query({
                text: `SELECT username, profile_image FROM users
                WHERE users.id = $1`,
                values: [req.params.user_id]
            })
        }
        return res.status(200).json({
            user: response.rows[0]
        });
    })
    // delete user account
    .delete((req, res) => {

    });

// DISPLAY GROCERY LIST
router.route('/users/:user_id/list')
    .get(middleware.isLoggedIn, async (req, res) => {
        const response = await db.query({
            text: `SELECT
            COALESCE(json_agg(m) FILTER (WHERE m IS NOT NULL), '[]') menu,
            COALESCE(json_agg(g) FILTER (WHERE g IS NOT NULL), '[]') grocery_list
            FROM users
            LEFT JOIN LATERAL (
            SELECT * FROM recipes
            WHERE recipes.id IN (
            SELECT id FROM users_recipes_menu
            WHERE users_recipes_menu.user_id = users.id
            )
            ) m ON true
            LEFT JOIN LATERAL (
            SELECT *
            FROM ingredients
            WHERE ingredients.id IN (
            SELECT user_id FROM users_ingredients_groceries
            WHERE users_ingredients_groceries.user_id = users.id
            )
            ) g ON true
            where users.id = $1
            group by users.id;`,
            values: [req.user.id],
        });

        return res.status(200).send({groceryList: response.rows[0].grocery_list, menu: response.rows[0].menu});
    });

// get certain collection details about a user's collections
router.get('/users/:user_id/collections', async (req, res) => {
    const query = await db.query({
        text: `SELECT collections.*, author.profile_image author_image,
COALESCE(json_agg(recipes.image) FILTER (WHERE recipes IS NOT NULL), '[]') recipes
FROM collections
LEFT JOIN LATERAL (
select recipes.image from recipes
where recipes.id in (
select recipe_id from recipes_collections
where recipes_collections.collection_id = collections.id
)
limit 4
) recipes ON TRUE 
LEFT JOIN LATERAL (
select profile_image from users
where users.id = collections.author_id
) author ON TRUE
WHERE collections.author_id = $1
group by collections.id, author.profile_image;`,
        values: [req.params.user_id],
    });
    return res.status(200).send({collections: query.rows});
    // const user = await User.findOne({
    //     "_id": req.params.user_id,
    // })
    //     .populate('collections')
    //     .exec();
    //
    // Collection.populate(user.collections, {
    //     path: 'ownerId',
    //     select: '_id profileImage'
    // }, (err, populatedCollections) => {
    //     return res.status(200).send({
    //         collections: populatedCollections.map(c => {
    //             return {
    //                 _id: c._id,
    //                 name: c.name,
    //                 ownerId: c.ownerId,
    //                 recipes: c.recipes
    //                     .slice(0, 4)
    //                     .map(r => r.image)
    //             }
    //         })
    //     })
    // })
});

module.exports = router;
