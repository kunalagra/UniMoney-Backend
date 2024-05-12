// define the reminder module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reminderSchema = new mongoose.Schema({
    title: String,
    user: {type: Schema.Types.ObjectId, ref: 'UserInfo', required: true, index: true},
    date: Date,
    description: String,
    amount: Number,
    category: {type: Schema.Types.ObjectId, ref: 'Category'},
    repeat: String,
})

module.exports = mongoose.model('Reminder', reminderSchema);
