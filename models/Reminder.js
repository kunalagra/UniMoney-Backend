// define the reminder module
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    title: String,
    date: Date,
})

module.exports = mongoose.model('Reminder', reminderSchema);
