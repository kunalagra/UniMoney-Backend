// define the user module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    userInfo: { type: Schema.Types.ObjectId, ref: 'UserInfo', }
    });

module.exports = mongoose.model('User', userSchema);;
