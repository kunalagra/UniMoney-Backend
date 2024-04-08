// define the category module
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    name: String,
    description: String,
    target: Number,
    emoji: String,
    progress: Number
})

module.exports = mongoose.model('Goal', goalSchema);
