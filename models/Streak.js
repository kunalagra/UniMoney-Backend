// models/Streak.js

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const streaksSchema = new mongoose.Schema({
    _id: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    },
    totalPoints: {
        type: Number,
        default: 1
    },
    consecutiveLoginDays: {
        type: Number,
        default: 1
    },
    loginStreaks: [{
        startDate: Date,
        endDate: Date,
        consecutiveDays: Number
    }],
    rolls: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model('Streak', streaksSchema);
