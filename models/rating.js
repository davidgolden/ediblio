const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    recipe_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipes',
        required: true,
    },
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    rating: {
        type: mongoose.Schema.Types.Number,
        required: true,
    }
});

module.exports = mongoose.model('ratings', ratingSchema);
