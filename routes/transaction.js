const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const UserInfo = require('../models/UserInfo');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

// Create a new transaction
router.post('/', authenticateToken, async (req, res) => {
    const dataList = req.body.List;
    const transactionList = [];
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        for (let i = 0; i < dataList.length; i++) {
            const data = dataList[i];
            const category = await Category.findOne({ name: data.category });
            if (!category) {
                return res.status(400).json({ error: 'Category not found.' });
            }
            data.category = category._id;
            const transaction = await Transaction.create(data);
            userInfo.transaction.push(transaction._id);
            transactionList.push(transaction);
        }
        await userInfo.save();
        res.status(201).json({ message: 'Transaction created successfully.', transactionList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Get all transactions
router.get('/', authenticateToken, async (req, res) => {
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const transactions = await Transaction.find({ _id: { $in: userInfo.transaction } });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// get transactions by month but transaction as type date
router.get('/month/:month', authenticateToken, async (req, res) => {
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const transactions = await Transaction.find({ _id: { $in: userInfo.transaction } });
        const month = parseInt(req.params.month);
        const filteredTransactions = transactions.filter((transaction) => {
            // const date = new Date(transaction.date);
            console.log(date.getMonth()+1);
            return date.getMonth()+1 === month;
        });
        res.json(filteredTransactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});


module.exports = router;
