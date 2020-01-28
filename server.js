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
// const connectStore = require('connect-mongo');
// const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {Strategy, ExtractJwt} = require('passport-jwt');
// const MongoStore = connectStore(session);
// const User = require('./models/user');
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

// mongoose.Promise = global.Promise;

// mongoose.connect(1 ? process.env.MONGO : process.env.MONGO_DEV,
//     {useNewUrlParser: true, autoIndex: false, useCreateIndex: true})
//     .then(() => console.log(`Database connected`))
//     .catch(err => console.log(`Database connection error: ${err.message}`));

const SESS_LIFETIME = 1000 * 60 * 60 * 24 * 30;

//Configure Passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async function (email, password, done) {
    const userRes = await db.query(`SELECT * FROM users WHERE users.email = '${email}';`);
    const user = userRes.rows[0];

    // const user = await User.findOne({email: email})
    //     .populate('collections');
    if (!user) return done(null, false, {message: 'Incorrect email.'});

    bcrypt.compare(password, user.password, function(err, res) {
        if (res) {
            return done(null, user);
        } else {
            return done(null, false, {message: 'Incorrect password.'});
        }
    })
    // user.comparePassword(password, function (err, isMatch) {
    //     if (isMatch) {
    //         return done(null, user);
    //     } else {
    //         return done(null, false, {message: 'Incorrect password.'});
    //     }
    // });
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
    const userRes = await db.query(`
        SELECT users.*, jsonb_set(to_jsonb(recipes.*), '{recipeIds}', "recipeIds") AS menu 
        FROM users LEFT JOIN (
            SELECT user_id AS id, jsonb_agg(recipe_id) AS "recipeIds"
        ) FROM users_menu_recipe WHERE users.id = '${id}' GROUP BY users.id, recipes.id;`);
    // const userRes = await db.query(`SELECT to_json(sub) AS container_with_things
    //     FROM  (
    //        SELECT users.*, recipes.*
    //        FROM   users
    //        LEFT   JOIN LATERAL (
    //           SELECT ARRAY (
    //              SELECT *
    //              FROM   recipes
    //              WHERE  container_id = c.id
    //              ) AS "thingIds"
    //           ) ct ON true
    //        WHERE  c.id IN (<list of container ids>)
    //        ) sub;`);
    console.log(userRes.rows[0]);
    done(null, userRes.rows[0]);
    // const user = await User.findById(id)
    //     .populate('collections');
    // done(null, user);
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
