const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user'),
    nodemailer = require('nodemailer'),
    mg = require('nodemailer-mailgun-transport'),
    urlMetadata = require('url-metadata'),
    URLSafeBase64 = require('urlsafe-base64');

// authenticate user
router.post('/authenticate', async function (req, res) {
    if (req.session.user) {
        const user = await User.findById(req.session.user._id);
        return res.status(200).send({user});
    } else {
        return res.sendStatus(200);
    }
});

// handle login logic
router.post('/login', emailToLowerCase, function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return res.status(404).send({ detail: err });
        }
        if (!user) {
            return res.status(404).send({ detail: 'No user found with those user credentials!' });
        } else {
            req.session.user = user;
            return res.status(200).send(JSON.stringify({user: user}));
        }
    })(req, res, next);
});

function emailToLowerCase(req, res, next) {
    req.body.email = req.body.email.toLowerCase();
    next();
}

//logout
router.get('/logout', function (req, res) {
    try {
        const user = req.session.user;
        if (user) {
            req.session.destroy(err => {
                if (err) throw (err);
                res.clearCookie('recipecloudsession');
                return res.sendStatus(200);
            });
        } else {
            throw new Error('Something went wrong');
        }
    } catch (err) {
        res.status(422).send({message: err});
    }
});

// reset password route
router.post('/forgot', function (req, res) {
    let email = req.body.email;
    if (req.isAuthenticated()) {
        return res.status(404).send({ detail: 'User is already logged in!'})
    }

    (function generateToken() {
        let buf = Buffer.alloc(16);
        for (let i = 0; i < buf.length; i++) {
            buf[i] = Math.floor(Math.random() * 256);
        }
        let token = URLSafeBase64.encode(buf).toString();

        (function assignToken(err) {
            if (err) {
                return res.status(404).send({ detail: 'There was a problem assigning a token!' })
            }

            User.findOne({email: email}, function (err, user) {
                if (err) {
                    return res.status(404).send({ detail: err })
                }
                if (!user) {
                    return res.status(404).send({ detail: 'No user found!' })
                }

                user.resetToken = token;
                user.tokenExpires = Date.now() + 3600000; // 1 hour

                user.save();

                const auth = {
                    auth: {
                        api_key: process.env.MAILGUN_API,
                        domain: 'mg.recipe-cloud.com'
                    }
                }

                const transporter = nodemailer.createTransport(mg(auth));

                let mailOptions = {
                    from: 'Recipe Cloud <donotreply@recipe-cloud.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Password Reset', // Subject line
                    html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br /><br />
                    Your password reset token is ${user.resetToken}. Enter this token on the forgot password page to change your
                    password. Note: This token will expire after 1 hour.<br /><br />
                    If you did not request this, please ignore this email and your password will remain unchanged.` // html body
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(404).send({ detail: 'There was a problem sending reset email.' })
                    } else {
                        return res.status(200).send('Success!')
                    }
                });
            });
        })();
    })();
});

// reset password
router.post('/reset', function (req, res) {
    User.findOne({resetToken: req.body.token, tokenExpires: {$gt: Date.now()}}, function (err, user) {
        if (err) {
            return res.status(404).send({ detail: err.message })
        }
        if (!user) {
            return res.status(404).send('Token is invalid or has expired.')
        }
        user.password = req.body.newPassword;
        user.resetToken = undefined;
        user.tokenExpires = undefined;
        user.save();

        req.logIn(user, function (err) {
            if (err) return res.status(404).send({ detail: err });
            return res.status(200).json({user: req.session.user});
        });
    });
});

//IMAGE SCRAPER
router.post('/scrape', function (req, res) {
    urlMetadata(req.body.imageUrl, {timeout: 0}).then(
        function (metadata) { // success handler
            return res.status(200).json({imageUrl: metadata["og:image"]});
        },
        function (error) { // failure handler
            return res.status(404).send('')
        });
});

module.exports = router;
