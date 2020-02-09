const bcrypt = require('bcrypt-nodejs');

function hashPassword(password) {
    var SALT_FACTOR = 5;

    return new Promise((res, rej) => {
        bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
            if (err) rej(err);
            bcrypt.hash(password, salt, false, function(err, hash) {
                if (err) rej(err);
                res(hash);
            });
        });
    });
}

module.exports = {
    hashPassword,
};
