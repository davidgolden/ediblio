const bcrypt = require('bcrypt-nodejs');

function saltPassword() {
    var SALT_FACTOR = 5;

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
}

module.exports = {
    saltPassword,
};
