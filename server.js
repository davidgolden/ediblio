require('dotenv').config({path: './.env'});
const path = require('path');

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var methodOverride = require('method-override');

const User = require('./models/user');

const userRoutes = require('./routes/users'),
    recipeRoutes = require('./routes/recipes'),
    indexRoutes = require('./routes/index');

const env = process.env.NODE_ENV || "development";

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO, {useNewUrlParser: true, autoIndex: false, useCreateIndex: true})
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    maxAge: 1000 * 60 * 60 * 24,
}));

//Configure Passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function (email, password, done) {
    User.findOne({email: email}, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, {message: 'Incorrect email.'});
        user.comparePassword(password, function (err, isMatch) {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Incorrect password.'});
            }
        });
    });
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

const forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
};
if (env === 'production') {
    app.use(forceSsl);
}

// NEED TO IMPORT ROUTES
app.use('/api/', indexRoutes);
app.use('/api/', userRoutes);
app.use('/api/', recipeRoutes);

// this is needed in order to send static files like index.html... DO NOT GET RID OF IT!!!
app.use(express.static(path.join(__dirname, "client")));

app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Listening at http://localhost:5000');
});
