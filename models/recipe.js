var mongoose = require('mongoose');

var recipeSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    url: { type: String, trim: true },
    notes: String,
    image: { type: String, trim: true, required: true },
    tags: [String],
    ingredients: [
            {
                quantity: Number,
                measurement: String,
                name: { type: String, lowercase: true, trim: true }
            },
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
