const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipes'
    }],
    name: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: true,
    }
}, {
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    }
});

collectionSchema.pre('find', function() {
    this.populate('recipes');
});

collectionSchema.pre('findOne', function() {
    this.populate('recipes');
});

collectionSchema.pre('findOneAndUpdate', function() {
    this.populate('recipes');
});

module.exports = mongoose.model('collections', collectionSchema);
