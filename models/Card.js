// define the card module
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    number: Number,
    issuer: { type: String, enum: ['Rupay','Visa', 'Mastercard','Pluxee','American Express', 'Diners Club'], default: 'Rupay' },
    cvv: Number,
    expiryMonth: Number,
    expiryYear: Number,
    name: String
})

module.exports = mongoose.model('Card', cardSchema);
