const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const UserInfo = require('../models/UserInfo');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage: storage });


// Get all categories
router.get('/', authenticateToken, async (req, res) => {
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const categories = await Category.find({ _id: { $in: userInfo.categories.map((category) => category.details) } });
        
        res.json(categories);
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
router.post('/', upload.single('img'), authenticateToken, async (req, res) => {
    const file = req.file;
    // console.log(file);
    const name = req.body.name;
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const newCategory = await Category.create({ name, img: file.path });
        userInfo.categories.push({ details: newCategory._id });
        await userInfo.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
    try {
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Update a category and its limit by ID
router.put('/:id', authenticateToken, async (req, res) => {
    data = req.body;
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const category = await Category.findById(req.params.id);
        data.details = category._id;
        const updatedCategory = await UserInfo.findOneAndUpdate({ _id: userInfo._id, 'categories.details': category._id }, { $set: { 'categories.$': data } }, { new: true });
        res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

module.exports = router;