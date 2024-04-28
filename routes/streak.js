const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const UserInfo = require('../models/UserInfo');
const User = require('../models/User');
const Streak = require('../models/Streak');

const authenticateToken = require('../middleware/authenticateToken');

// Update user visit and login
router.get('/visit', authenticateToken, async (req, res) => {
    try {
        let streak = await Streak.findOne({ _id: req.user._id });
        if (!streak) {
            streak = await Streak.create({ _id: req.user._id, name: req.user.username });
            res.status(200).json({ message: 'Visit logged successfully' });
        }
        let today = new Date();
        let lastLogin = new Date(streak.lastLogin);
        const dayinMS =  1000 * 60 * 60 * 24;
        lastLogin.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const daysSinceLastLogin = (today - lastLogin) / dayinMS;

        if (daysSinceLastLogin < 1) {
            res.status(200).json({ message: 'Already visited today, points remain the same' });
        } else {
            streak.lastLogin = today;
            streak.totalPoints++;
        
            if (daysSinceLastLogin === 1) {
                streak.consecutiveLoginDays++;
                if (streak.consecutiveLoginDays % 10 === 0) {
                    streak.rolls++; // Add rolls
                    streak.trophies++;
                }
            } else {
                streak.loginStreaks.push({
                    startDate: new Date(lastLogin.getTime() - ((streak.consecutiveLoginDays-1) * 24 * 60 * 60 * 1000)),
                    endDate: lastLogin,
                    consecutiveDays: streak.consecutiveLoginDays
                });
                streak.consecutiveLoginDays = 1;
            }
        
            await streak.save();
            res.status(200).json({ message: 'Visit logged successfully' });
        }
    } catch (err) {
        console.error('Error logging visit', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/useRoll', authenticateToken, async (req, res) => {
    try {
        let user = await Streak.findOne({ _id: req.user._id });
        user.rolls--;
        user.totalPoints+=req.body.points
        await user.save()
        res.status(200).json({ message: 'Points Added' });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        let streak = await Streak.findOne({ _id: req.user._id });
        res.status(200).json({ streak });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        // get top 5 users based on trophies
        const top5 = await Streak.find().sort({ trophies: -1 }).limit(5);
        // get current user rank based on trophies
        const currentRank = await Streak.find({ trophies: { $gt: req.user.trophies } }).countDocuments() + 1;
        res.status(200).json({ top5, currentRank })
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
