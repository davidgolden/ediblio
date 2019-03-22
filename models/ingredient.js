const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    quantity: { type: String, trim: true, required: true },
    measurement: { type: String, trim: true, required: true }
});

module.exports = IngredientSchema;
