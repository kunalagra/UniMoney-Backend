const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');
const authenticateToken = require('../middleware/authenticateToken');
const UserInfo = require('../models/UserInfo');


router.get('/', authenticateToken, async (req, res) => {
    const userInfo = await UserInfo.findById({ _id: req.user._id });
    try {
        const allBanks = await Bank.find();
        res.json(allBanks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});


router.post('/', authenticateToken, async (req, res) => {
    try {
        await Bank.insertMany(req.body)
        res.status(201).json({ message: 'Data Inserted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});
module.exports = router;
