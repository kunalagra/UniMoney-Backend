// define the user module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userinfoSchema = new mongoose.Schema({
    _id: { type: Schema.Types.ObjectId, ref: 'User' },
    gender: String,
    age: String,
    profession: { type: String, enum: ['Student', 'Business', 'Employee', 'Homemaker'], default: 'Employee' },
    transaction: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    goals: [String],
    goalsProgress: [String],
    category: [{
        details: { type: Schema.Types.ObjectId, ref: 'Category' },
        limit:{type: Number, default: 0}
    }],
    bank: [{
        id: { type: Schema.Types.ObjectId, ref: 'Bank' },
        number: Number,
        card: [{ type: Schema.Types.ObjectId, ref: 'Card' }]
    }]
});


module.exports = mongoose.model('UserInfo', userinfoSchema);
