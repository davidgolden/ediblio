const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const IngredientSchema = require('./ingredient');

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    isAdmin: {type: Boolean, default: false},
    profileImage: {type: String, default: ''},
    password: {type: String, required: true},
    resetToken: String,
    tokenExpires: Date,
    recipes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'recipes'
        }
    ],
    menu: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'recipes'
        }
    ],
    groceryList: {
        type: [IngredientSchema]
    }
});

userSchema.pre('save', function (next) {
    var user = this;
    var SALT_FACTOR = 5;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.post('remove', function (user) {
    Recipes.deleteMany({'author.id': user._id})
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', userSchema);
