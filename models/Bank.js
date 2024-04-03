// define the bank module
const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    name: String,
    img: String,
    code: {type: String, unique: true },
    website: String
})

module.exports = mongoose.model('Bank', bankSchema);
