require('dotenv').config({path: './.env'});
const path = require('path');

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var methodOverride = require('method-override');

const Recipe = require('./models/recipe'),
    User = require('./models/user');

const userRoutes = require('./routes/users'),
      recipeRoutes = require('./routes/recipes'),
      indexRoutes = require('./routes/index');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO)
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));

// app.use('/public', express.static('public'));

// PASSPORT CONFIGURATION
app.use(require('express-session')({
  secret: 'Mac Dre is the king of the bay',
  resave: false,
  saveUninitialized: true
}));

//Configure Passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect email.' });
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  });
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// app.locals.tags = ['Dinner', 'Breakfast', 'Dessert', 'Quick/Easy', 'Vegetarian', 'Vegan', 'Dairy-Free', 'Gluten-Free'];

app.get('*', function(req, res) {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

// NEED TO IMPORT ROUTES
// NEED TO IMPORT MIDDLEWARE
app.use('/', indexRoutes);
app.use('/', userRoutes);
app.use('/', recipeRoutes);

const port = process.env.PORT || 5000;

app.listen(port, function(err) {
  if (err) {
    console.log(err);
    return;
  }
console.log('Listening at http://localhost:5000');
});
