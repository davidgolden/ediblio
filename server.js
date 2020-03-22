require('dotenv').config({path: './.env'});
const express = require('express');
const compression = require('compression');
const next = require('next');
const path = require('path');
const axios = require('axios');

const dev = process.env.NODE_ENV === 'development';
const app = next({dev});
const handle = app.getRequestHandler();
const {google} = require('googleapis');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const session = require('express-session');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// var GoogleStrategy = require('passport-google-oauth20').Strategy;
// const {Strategy, ExtractJwt} = require('passport-jwt');
// const bcrypt = require('bcrypt-nodejs');

const db = require("./db/index");

const userRoutes = require('./routes/users'),
    recipeRoutes = require('./routes/recipes'),
    collectionRoutes = require('./routes/collections'),
    ratingRoutes = require('./routes/ratings'),
    measurementRoutes = require('./routes/measurements'),
    indexRoutes = require('./routes/index');

const env = process.env.NODE_ENV || "development";

const forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
};

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    (process.env.NODE_ENV === 'development' ? "http://localhost:5000" : "https://ediblio.com") + "/auth/google/callback",
);

// const SESS_LIFETIME = 1000 * 60 * 60 * 24 * 30;

const {usersSelector, encodeJWT} = require("./utils");

// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });
//
// passport.deserializeUser(async function (id, done) {
//     try {
//         const userRes = await db.query({
//             text: `${usersSelector}
// where users.id = $1
// group by users.id;`, values: [id]
//         });
//         done(null, userRes.rows[0]);
//     } catch (error) {
//         done(error);
//     }
// });

app.prepare().then(() => {
    const server = express();
    if (process.env.NODE_ENV === 'production') {
        server.use(forceSsl);
    }
    server.enable('trust proxy');
    server.use(compression());

    server.use(bodyParser.urlencoded({extended: false}));
    server.use(bodyParser.json());
    server.use(cookieParser());

    server.use('/api/', indexRoutes);
    server.use('/api/', userRoutes);
    server.use('/api/', recipeRoutes);
    server.use('/api/', collectionRoutes);
    server.use('/api/', ratingRoutes);
    server.use('/api/', measurementRoutes);

    server.get('/auth/google', (req, res) => {
        const url = oauth2Client.generateAuthUrl({
            scope: ['profile', 'email'],
            state: JSON.stringify({
                request_url: req.query.state
            }),
        });
        res.redirect(url);
    });

    server.get('/auth/google/callback', async function (req, res) {
        const {tokens} = await oauth2Client.getToken(req.query.code);
        const response = await axios.get(`https://openidconnect.googleapis.com/v1/userinfo?access_token=${tokens.access_token}`);
        const {email, picture, name, sub} = response.data;
        const state = JSON.parse(req.query.state);

        const userRes = await db.query({
            text: `${usersSelector}
where users.email = $1
group by users.id`, values: [email]
        });
        const user = userRes.rows[0];

        if (user) {
            const jwt = encodeJWT({id: user.id});
            res.redirect(state.request_url+'?jwt='+jwt);
        } else {
            const userRes = await db.query({
                text: `INSERT INTO users (username, email, third_party_id, third_party_domain, profile_image) VALUES ($1, $2, $3, 'google', $4) RETURNING *`,
                values: [name, email.toLowerCase(), sub, picture]
            });

            // create a favorites collection
            await db.query({
                text: `INSERT INTO collections (name, author_id, is_primary) VALUES ($1, $2, $3)`,
                values: ['Favorites', userRes.rows[0].id, true]
            });

            const user = userRes.rows[0];

            const jwt = encodeJWT({id: user.id});
            res.redirect(state.request_url+'/?jwt='+jwt);
        }
    });

    server.get('/service-worker.js', (req, res) => {
        const filePath = path.join(__dirname, '.next/service-worker.js');
        app.serveStatic(req, res, filePath)
    });

    server.all('*', (req, res) => {
        return handle(req, res)
    });

    const port = process.env.PORT || 5000;
    server.listen(port, err => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`)
    })
});
