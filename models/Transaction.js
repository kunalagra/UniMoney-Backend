// define the user module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new mongoose.Schema({
    amount: Number,
    acc: Number,
    date: {type: Date, default: Date.now },
    categories: [{type: Schema.Types.ObjectId, ref: 'Category'}],
    type: { type: String, enum: ['debit', 'credit'], default: 'debit' },
    txid: Number,
    method: { type: String, enum: ['cash','upi', 'credit card', 'debit card','netbank','loan',], default: 'cash' },
    name: String,
});

transactionSchema.index({ date: 1 });
module.exports = mongoose.model('Transaction', transactionSchema);
