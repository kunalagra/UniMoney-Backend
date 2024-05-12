const express = require('express');
const router = express.Router();
const Bank = require('../models/Reminder');
const authenticateToken = require('../middleware/authenticateToken');
const Reminder = require('../models/Reminder');
const Category = require('../models/Category');


router.get('/', authenticateToken, async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user._id }).populate('category');
        res.json(reminders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});


router.post('/create', authenticateToken, async (req, res) => {
    try {
        const category = await Category.findOne({ name: req.body.category });
        req.body.category = category._id;
        req.body.user = req.user._id;
        await Reminder.create(req.body);
        res.status(201).json({ message: 'Reminder Created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }

});

router.put('/update', authenticateToken, async (req, res) => {
    try {
        const category = await Category.findOne({ name: req.body.category });
        req.body.category = category._id;
        await Reminder.findByIdAndUpdate(req.body._id, req.body);
        res.status(200).json({ message: 'Reminder Updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        await Reminder.findByIdAndDelete(req.body._id);
        res.status(200).json({ message: 'Reminder Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});



module.exports = router;