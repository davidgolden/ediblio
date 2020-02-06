require('dotenv').config({path: './.env'});
const express = require('express');
const compression = require('compression');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {Strategy, ExtractJwt} = require('passport-jwt');
const bcrypt = require('bcrypt-nodejs');

const db = require("./db/index");

const userRoutes = require('./routes/users'),
    recipeRoutes = require('./routes/recipes'),
    collectionRoutes = require('./routes/collections'),
    ratingRoutes = require('./routes/ratings'),
    indexRoutes = require('./routes/index');

const env = process.env.NODE_ENV || "development";

const forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
};

const SESS_LIFETIME = 1000 * 60 * 60 * 24 * 30;

const usersSelector = `
SELECT users.*, users.id::int,
COALESCE(json_agg(m) FILTER (WHERE m IS NOT NULL), '[]') menu,
COALESCE(json_agg(c) FILTER (WHERE c IS NOT NULL), '[]') collections,
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
SELECT collections.*, json_agg(cr) recipes
FROM collections, LATERAL (
SELECT * FROM recipes
WHERE recipes.id IN (
SELECT recipe_id FROM recipes_collections
WHERE recipes_collections.collection_id = collections.id
)
) cr
WHERE collections.author_id = users.id
GROUP BY collections.id
) c ON true
LEFT JOIN LATERAL (
SELECT *
FROM ingredients
WHERE ingredients.id IN (
SELECT user_id FROM users_ingredients_groceries
WHERE users_ingredients_groceries.user_id = users.id
)
) g ON true
`;

//Configure Passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async function (email, password, done) {
    const userRes = await db.query({text: `${usersSelector}
where users.email = $1
group by users.id;`, values: [email]});
    const user = userRes.rows[0];

    if (!user) return done(null, false, {message: 'Incorrect email.'});

    bcrypt.compare(password, user.password, function(err, res) {
        if (res) {
            return done(null, user);
        } else {
            return done(null, false, {message: 'Incorrect password.'});
        }
    })
}));

passport.use('JWT', new Strategy({
    secretOrKey: process.env.SESSION_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    ignoreExpiration: true,
    session: true,
}, async (token, done) => {
    try {
        return done(null, token.user);
    } catch (error) {
        done(error);
    }
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    const userRes = await db.query({text: `${usersSelector}
where users.id = $1
group by users.id;`, values: [id]});
    done(null, userRes.rows[0]);
});

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

    server.use(session({
        name: 'recipecloudsession',
        secret: process.env.SESSION_SECRET,
        resave: true,
        store: new (require('connect-pg-simple')(session))(),
        cookie: {
            sameSite: true,
            secure: false,
            maxAge: SESS_LIFETIME
        },
        saveUninitialized: false,
    }));
    server.use(passport.initialize());
    server.use(passport.session());

    server.use('/api/', indexRoutes);
    server.use('/api/', userRoutes);
    server.use('/api/', recipeRoutes);
    server.use('/api/', collectionRoutes);
    server.use('/api/', ratingRoutes);

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
