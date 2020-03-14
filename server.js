require('dotenv').config({path: './.env'});
const express = require('express');
const compression = require('compression');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV === 'development';
const app = next({dev});
const handle = app.getRequestHandler();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const {Strategy, ExtractJwt} = require('passport-jwt');
const bcrypt = require('bcrypt-nodejs');

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

const SESS_LIFETIME = 1000 * 60 * 60 * 24 * 30;

const {usersSelector} = require("./utils");

//Configure Passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async function (email, password, done) {
    const userRes = await db.query({
        text: `${usersSelector}
where users.email = $1
group by users.id;`, values: [email]
    });
    const user = userRes.rows[0];

    if (!user) return done(null, false, {message: 'Incorrect email.'});

    bcrypt.compare(password, user.password, function (err, res) {
        if (res) {
            return done(null, user);
        } else {
            return done(null, false, {message: 'Incorrect password.'});
        }
    })
}));

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: (process.env.NODE_ENV === 'development' ? "http://localhost:5000" : "https://ediblio.com") + "/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
        try {
            const userRes = await db.query({
                text: `${usersSelector}
where users.email = $1
group by users.id`, values: [profile._json.email]
            });
            const user = userRes.rows[0];

            if (user) {
                done(null, user);
            } else {
                const userRes = await db.query({
                    text: `INSERT INTO users (username, email, third_party_id, third_party_domain, profile_image) VALUES ($1, $2, $3, 'google', $4) RETURNING *`,
                    values: [profile._json.name, profile._json.email.toLowerCase(), profile.id, profile._json.picture]
                });

                // create a favorites collection
                await db.query({
                    text: `INSERT INTO collections (name, author_id, is_primary) VALUES ($1, $2, $3)`,
                    values: ['Favorites', userRes.rows[0].id, true]
                });

                const user = userRes.rows[0];

                return done(null, user);
            }

        } catch (error) {
            done(error);
        }
    }
));

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
    try {
        const userRes = await db.query({
            text: `${usersSelector}
where users.id = $1
group by users.id;`, values: [id]
        });
        done(null, userRes.rows[0]);
    } catch (error) {
        done(error);
    }
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
    server.use('/api/', measurementRoutes);

    server.get('/auth/google',
        passport.authenticate('google', {scope: ['profile', 'email']}));

    server.get('/auth/google/callback',
        passport.authenticate('google', {failureRedirect: '/'}),
        function (req, res) {
            console.log(req.user)
            // res.status(200).json({user: req.user});
            res.redirect('/', {user: req.user})
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
