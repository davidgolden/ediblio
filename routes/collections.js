const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    middleware = require('../middleware');

router.patch('/users/:user_id/collections/:collection_id', middleware.isLoggedIn, async (req, res) => {

    const user = await User.findOneAndUpdate({"_id": req.session.user._id, "collections._id": req.params.collection_id}, {
        "$set": {
            [`collections.$`]: req.body,
        }
    });

    res.status(200).json({user})
});

module.exports = router;
