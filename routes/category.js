const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const UserInfo = require('../models/UserInfo');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

// Get all categories
router.get('/', authenticateToken, async (req, res) => {
    try {
        const categories = await UserInfo.findById({ _id: req.user._id }).populate('category.details');
        
        res.json(categories.category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Get category by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        res.json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Create a new category
router.post('/', authenticateToken, async (req, res) => {
    const img = req.body.img;
    const name = req.body.name;
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const newCategory = await Category.create({ name, img });
        userInfo.category.push({ details: newCategory._id });
        await userInfo.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Update a limit of a category useing category name
router.put('/limit', authenticateToken, async (req, res) => {
    const name = req.body.name;
    const limit = req.body.limit;
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const category = await Category.findOne({ name });
        if (!category) {
            return res.status(400).json({ error: 'Category not found.' });
        }
        const index = userInfo.category.findIndex((cat) => cat.details._id.toString() === category._id.toString());
        userInfo.category[index].limit = limit;
        await userInfo.save();
        res.json(userInfo.category[index]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

module.exports = router;