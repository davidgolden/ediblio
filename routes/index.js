const bcrypt = require('bcryptjs');
const request = require('request').defaults({ encoding: null });

const express = require('express'),
    router = express.Router(),
    nodemailer = require('nodemailer'),
    mg = require('nodemailer-mailgun-transport'),
    urlMetadata = require('url-metadata'),
    URLSafeBase64 = require('urlsafe-base64');

const {hashPassword} = require('../utils');

const db = require("../db/index");
const {usersSelector, encodeJWT, decodeJWT} = require("../utils");

// handle login logic
router.get('/login', async function (req, res) {
    try {
        const {email, password, redirect_url} = decodeJWT(req.query.jwt);

        const userRes = await db.query({
            text: `${usersSelector}
where users.email = $1
group by users.id;`, values: [email]
        });
        const user = userRes.rows[0];

        if (!user) res.status(404).send({detail: "No user found with that email!"});

        const isCorrectPassword = bcrypt.compareSync(password, user.password);

        if (!isCorrectPassword) res.status(404).send({detail: "Incorrect password!"});

        const jwt = encodeJWT({
            user: {
                id: user.id,
                profile_image: user.profile_image,
                username: user.username,
            }
        });

        res.redirect(redirect_url + '?jwt=' + jwt);

    } catch (error) {
        // TODO need to handle error
        res.redirect(500, `/_error?err=${error.message}`);
    }
});

//logout
router.post('/logout', function (req, res) {
    try {
        res.append('x-access-token', null);
        return res.redirect('back');
    } catch (err) {
        res.status(422).send({message: err});
    }
});

// reset password route
router.post('/forgot', function (req, res) {
    let email = req.body.email;
    if (req.user) {
        return res.status(404).send({detail: 'User is already logged in!'})
    }

    (function generateToken() {
        let buf = Buffer.alloc(16);
        for (let i = 0; i < buf.length; i++) {
            buf[i] = Math.floor(Math.random() * 256);
        }
        let token = URLSafeBase64.encode(buf).toString();

        (async function assignToken(err) {
            if (err) {
                return res.status(404).send({detail: 'There was a problem assigning a token!'})
            }

            await db.query('BEGIN');
            const response = await db.query({
                text: `SELECT * FROM users WHERE email = $1`,
                values: [email],
            });

            if (response.rows.length === 0) {
                await db.query('ROLLBACK');
                return res.status(404).send({detail: 'No user found!'})
            }

            await db.query({
                text: `UPDATE users SET reset_token = $1, token_expires = $2 WHERE email = $3`,
                values: [token, Date.now() + 3600000, email],
            });
            await db.query('COMMIT');

            const auth = {
                auth: {
                    api_key: process.env.MAILGUN_API,
                    domain: 'mg.recipe-cloud.com'
                }
            };

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
                    return res.status(404).send({detail: 'There was a problem sending reset email.'})
                } else {
                    return res.status(200).send('Success!')
                }
            });
        })();
    })();
});

// reset password
router.post('/reset', async function (req, res) {

    // TODO this needs to use a client connection
    await db.query('BEGIN');
    const response = await db.query({
        text: `SELECT * FROM users WHERE reset_token = $1 AND token_expires > $2`,
        values: [req.body.token, Date.now()]
    });

    if (response.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).send('Token is invalid or has expired.')
    }

    const userRes = await db.query({
        text: `UPDATE users SET password = $1, reset_token = NULL, token_expires = NULL RETURNING *`,
        values: [await hashPassword(req.body.newPassword)],
    });

    await db.query('COMMIT');

    req.logIn(userRes.rows[0], function (err) {
        if (err) return res.status(404).send({detail: err});
        return res.status(200);
    });
});

//IMAGE SCRAPER
router.post('/scrape', function (req, res) {
    urlMetadata(req.body.imageUrl, {timeout: 0}).then(
        async function (metadata) { // success handler
            const imageUrl = metadata["og:image"];

            request.get(imageUrl, function (err, response, body) {
                return res.status(200).json(body);
            });
        },
        function (error) { // failure handler
            return res.status(404).send('')
        });
});

module.exports = router;
