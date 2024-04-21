const express = require('express');
const router = express.Router();
const Bank = require('../models/Reminder');
const authenticateToken = require('../middleware/authenticateToken');
const UserInfo = require('../models/UserInfo');


router.get('/', authenticateToken, async (req, res) => {
    try {
        const userInfo = await UserInfo.findById({ _id: req.user._id })
        res.json(userInfo.reminder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});


router.post('/create', authenticateToken, async (req, res) => {
    try {
        const userInfo = await UserInfo.findById({ _id: req.user._id });
        userInfo.reminder.push({ id: req.body.title, number: req.body.date });
        await userInfo.save();
        res.status(201).json({ message: 'Reminder Created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }

});


module.exports = router;