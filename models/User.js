// define the user module
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    image: String,
    });

module.exports = mongoose.model('User', userSchema);;
