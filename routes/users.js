const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Collection = require('../models/collection'),
    middleware = require('../middleware');

const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'recipecloud',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// const Collection = require("../models/collection");
// (async function() {
//     const users = await User.find({});
//     for (let i = 0; i < users.length; i++) {
//         const user = users[i];
//         console.log(user.username);
//         user.collections = [{
//             name: "Favorites",
//             recipes: [],
//         }]
//         await user.save();
//     }
// })();


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

            req.login(user, function() {
                res.status(200).json({user: req.user});
            });
        });
    });

router.route('/users/:user_id')
// update user
    .patch(middleware.isLoggedIn, (req, res) => {
        User.findOne({"_id": req.user._id}, function (err, user) {
            if (err) {
                return res.status(404).send({detail: err.message})
            }
            for (let key in req.body) {
                if (req.body.hasOwnProperty(key) && key !== 'profileImage') {
                    user[key] = req.body[key];
                } else if (key === 'profileImage') {
                    cloudinary.v2.uploader.upload(req.body.profileImage,
                        {
                            resource_type: "image",
                            public_id: `users/${req.user._id}/profileImage`,
                            overwrite: true,
                            transformation: [
                                {width: 400, height: 400, gravity: "face", radius: "max", crop: "crop"},
                                {height: 200, width: 200, crop: "fill"}
                            ]
                        },
                        (error, result) => {
                            user.profileImage = result.secure_url;
                            user.save();
                        });
                }
            }
            user.save();

            return res.status(200).json({user: user})

        });
    })
    // this will ALWAYS return the logged in user's details; can't get another user's data
    .get(middleware.isLoggedIn, (req, res) => {
        User.findOne({"_id": req.user._id}, (err, user) => {
            if (err) {
                return res.status(404).send({detail: err.message});
            }
            return res.status(200).json({user: user})
        });
    })
    // delete user account
    .delete((req, res) => {

    });

// DISPLAY GROCERY LIST
router.get('/users/:user_id/list', middleware.isLoggedIn, (req, res) => {
    User.findById(req.user._id).populate('menu').exec(function (err, user) {
        if (err) {
            return res.status(404).send({detail: err.message})
        }
        return res.status(200).send({groceryList: user.groceryList, menu: user.menu});
    });
});

// get certain collection details about a user's collections
router.get('/users/:user_id/collections', async (req, res) => {
    const collections = await Collection.find({
        "ownerId": req.params.user_id,
    });
    return res.status(200).send({
        collections: collections.map(c => {
            return {
                _id: c._id,
                name: c.name,
                recipes: c.recipes
                    .slice(0, 4)
                    .map(r => r.image)
            }
        })
    })
});

module.exports = router;
