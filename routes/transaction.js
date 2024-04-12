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
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        // reverse loop
        for (let i = dataList.length - 1; i >= 0; i--) {
            const data = dataList[i];
            const category = await Category.findOne({ name: data.category.name });
            if (!category) {
                return res.status(400).json({ error: 'Category not found.' });
            }
            data.category = category._id;
            const transaction = await Transaction.create(data);
            userInfo.transaction.push(transaction._id);
        }
        await userInfo.save();
        res.status(201).json(userInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// add single transaction
router.post('/single', authenticateToken, async (req, res) => {
    const data = req.body;
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const category = await Category.findOne({ name: data.category });
        if (!category) {
            return res.status(400).json({ error: 'Category not found.' });
        }
        data.category = category._id;
        const transaction = await Transaction.create(data);
        userInfo.transaction.unshift(transaction._id);
        await userInfo.save();
        res.status(201).json(userInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// update transaction category
router.put('/:id', authenticateToken, async (req, res) => {
    const id = req.params.id;
    const category = req.body.category;
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found.' });
        }
        const newCategory = await Category.findOne({ name: category });
        if (!newCategory) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        transaction.category = newCategory._id;
        await transaction.save();
        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Get all transactions
router.get('/', authenticateToken, async (req, res) => {
    const userInfo = await UserInfo.findById({ _id: req.user._id })
    const transactions = await Transaction.find({ _id: { $in: userInfo.transaction } }).populate('category').sort('date')
    try {
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

// get categories and bank details of user
router.get('/info', authenticateToken, async (req, res) => {
    const userInfo = await UserInfo.findById({ _id: req.user._id }).populate({path: 'category.details', model: 'Category'}).populate({path: 'bank.id', model: 'Bank'});
    try {
        res.json(userInfo)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});


module.exports = router;
