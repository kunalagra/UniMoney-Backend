// define the user module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'UserInfo', required: true},
    amount: Number,
    acc: Number,
    date: Number,
    category: {type: Schema.Types.ObjectId, ref: 'Category'},
    type: { type: String, enum: ['debit', 'credit'], default: 'debit' },
    txid: String,
    method: { type: String, enum: ['cash','upi', 'card','netbank','loan',], default: 'upi' },
    name: String,
    comment: String
});

transactionSchema.index({ date: 1 });
module.exports = mongoose.model('Transaction', transactionSchema);
