const express = require('express');
const router = express.Router();
const Bank = require('../models/Reminder');
const authenticateToken = require('../middleware/authenticateToken');
const UserInfo = require('../models/UserInfo');
const Reminder = require('../models/Reminder');
const Category = require('../models/Category');


router.get('/', authenticateToken, async (req, res) => {
    try {
        const userInfo = await UserInfo.findById({ _id: req.user._id })
        // get the reminder which are in future and populate the category
        const reminders = await Reminder.find({ _id: { $in: userInfo.reminder } }).populate('category');
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
        const reminder = await Reminder.create(req.body);
        const userInfo = await UserInfo.findById({ _id: req.user._id });
        userInfo.reminder.push(reminder._id);
        await userInfo.save();
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
        const userInfo = await UserInfo.findById({ _id: req.user._id });
        userInfo.reminder = userInfo.reminder.filter((reminder) => reminder != req.body._id);
        await userInfo.save();
        res.status(200).json({ message: 'Reminder Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});



module.exports = router;