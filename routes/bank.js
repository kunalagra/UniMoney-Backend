const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');
const authenticateToken = require('../middleware/authenticateToken');
const UserInfo = require('../models/UserInfo');


router.get('/', authenticateToken, async (req, res) => {
    const uid = req.user._id
    console.log(uid)
    const userInfo = await UserInfo.findById({ _id: uid });
    try {
        const allBanks = await Bank.find();
        res.json(allBanks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

module.exports = router;
