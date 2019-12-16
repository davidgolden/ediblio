const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipes'
    }],
    name: {
        type: mongoose.Schema.Types.String,
        required: true,
    }
});

module.exports = collectionSchema;
