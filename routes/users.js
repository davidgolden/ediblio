const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
    middleware = require('../middleware'),
    ing = require('../src/utils/conversions');

router.route('/users')
    // get all users
    .get((req, res) => {
        User.find({}, function (err, users) {
            if (err) {
                return res.status(404).send(err)
            }
            else {
                return res.status(200).send({users: users});
            }
        }).sort({'Date': -1});
    })
    // create new user (register)
    .post((req, res) => {
        User.findOne({ "$or":[{ username: req.body.username }, { email: req.body.email }] }, function(err, user) {
            if (err) {
                return res.status( 404 ).send(err);
            }

            if(user) {
                return res.status( 404 ).send('A user with that username or email already exists!');
            }

            let newUser = new User({username: req.body.username, email: req.body.email.toLowerCase(), password: req.body.password});
            newUser.save();

            req.logIn(newUser, function(err) {
                if (err) return res.status( 404 ).send(err);
                return res.status( 200 ).json({ user: req.user });
            });
        });
    });

router.route('/users/:user_id')
    // update user
    .patch(middleware.isLoggedIn, (req, res) => {
        User.findOne(req.user._id, function(err, user) {
            if (err) {
                return res.status(404).send(err)
            }
            for (let key in req.body) {
                if (req.body.hasOwnProperty(key)) {
                    user[key] = req.body[key];
                }
            }
            user.save();

            return res.status(200).json({ user: user })

        });
    })
    // delete user account
    .delete((req, res) => {

    });

// DISPLAY GROCERY LIST
// router.get('/grocery-list', middleware.isLoggedIn, function(req, res) {
//     User.findById(req.user._id).populate('menu').exec(function(err, user) {
//         if (err) {
//             return res.status(404).send(err)
//         }
//         return res.status(200).send({ groceryList: user.groceryList, menu: user.menu });
//     });
// });

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

module.exports = router;
