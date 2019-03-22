const mongoose = require('mongoose');
const IngredientSchema = require('./ingredient');

const recipeSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    url: { type: String, trim: true },
    notes: String,
    image: { type: String, trim: true, required: true },
    tags: [String],
    ingredients: [
            IngredientSchema,
        ],
    author: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        username: String
      }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

module.exports = mongoose.model('recipes', recipeSchema);
