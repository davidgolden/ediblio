require('dotenv').config({path: './.env'});
const express = require('express');
const compression = require('compression');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV === 'development';
const app = next({dev});
const handle = app.getRequestHandler();
const {google} = require('googleapis');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

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

const {usersSelector, encodeJWT, verifyJWT} = require("./utils");

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

    server.use(function(req, res, next) {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

        if (token) {
            const verified = verifyJWT(token);
            if (verified) {
                req.user = {id: verified.id};
            }
        }

        next();
    });

    server.use('/api/', indexRoutes);
    server.use('/api/', userRoutes);
    server.use('/api/', recipeRoutes);
    server.use('/api/', collectionRoutes);
    server.use('/api/', ratingRoutes);
    server.use('/api/', measurementRoutes);

    server.get('/auth/google', async (req, res) => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'online',
            scope: ['profile', 'email'],
            state: JSON.stringify({
                request_url: req.query.state
            }),
        });

        res.redirect(url);
    });

    server.get('/auth/google/callback', async function (req, res) {
        try {
            const {tokens} = await oauth2Client.getToken(req.query.code);
            oauth2Client.setCredentials(tokens);
            const oauth2 = google.oauth2({
                auth: oauth2Client,
                version: 'v2',
            });
            const response = await oauth2.userinfo.v2.me.get();

            const {email, picture, name, id} = response.data;
            const state = JSON.parse(req.query.state);

            const userRes = await db.query({
                text: `${usersSelector}
where users.email = $1
group by users.id`, values: [email]
            });

            if (userRes.rows.length > 0) {
                const userId = userRes.rows[0].id;
                const jwt = encodeJWT({id: userId});
                res.redirect(state.request_url+'?jwt='+jwt);
            } else {

                const userRes = await db.query({
                    text: `INSERT INTO users (username, email, third_party_id, third_party_domain, profile_image) VALUES ($1, $2, $3, 'google', $4) RETURNING *`,
                    values: [name, email.toLowerCase(), id, picture]
                });
                // create a favorites collection
                const userId = userRes.rows[0].id;
                await db.query({
                    text: `INSERT INTO collections (name, author_id, is_primary) VALUES ($1, $2, $3)`,
                    values: ['Favorites', userId, true]
                });

                const jwt = encodeJWT({id: userId});
                res.redirect(state.request_url+'/?jwt='+jwt);
            }
        } catch (error) {
            res.redirect(`/_error?err=${error.message}`);
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
