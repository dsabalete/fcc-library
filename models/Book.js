const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: { type: String, required: true },
    comments: { type: Array, default: [] }
});

module.exports = mongoose.model('Book', bookSchema);