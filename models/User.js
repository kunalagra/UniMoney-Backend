// define the user module
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, index: {unique: true}, required: true},
    password: {type: String, required: true},
    image: String,
    });


module.exports = mongoose.model('User', userSchema);;
