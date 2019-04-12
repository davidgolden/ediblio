const mongoose = require('mongoose');
const IngredientSchema = require('./ingredient');
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'recipecloud',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const recipeSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    url: { type: String, trim: true },
    notes: String,
    image: { type: String, trim: true, required: true },
    tags: [String],
    ingredients: [
            IngredientSchema,
        ],
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

recipeSchema.post('remove', function(doc) {
    cloudinary.uploader.destroy(`users/${doc.author_id}/recipes/${doc._id}`);
});

module.exports = mongoose.model('recipes', recipeSchema);
