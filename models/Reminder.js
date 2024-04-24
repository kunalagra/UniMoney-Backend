// define the reminder module
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    title: String,
    date: Date,
    description: String,
    amount: Number,
    category: {type: Schema.Types.ObjectId, ref: 'Category'},
    repeat: string,
})

module.exports = mongoose.model('Reminder', reminderSchema);
