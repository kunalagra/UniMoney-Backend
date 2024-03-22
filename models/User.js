// define the user module
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    gender: String,
    age: Number,
    goals: [String],
    goalsProgress: [String],
    categories: [String], 
    categoriesLimits : [Number],
    });

const User = mongoose.model('User', userSchema);

module.exports = User;
