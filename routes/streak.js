const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const UserInfo = require('../models/UserInfo');
const User = require('../models/User');
const Streak = require('../models/Streak');

const authenticateToken = require('../middleware/authenticateToken');



async function flattenStreakData(input) {
    // Helper functions and logic to flatten the streak data
    function getMonthYearKey(date) {
        const d = new Date(date);
        const month = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear().toString().slice(-2);
        return `${month}'${year}`;
    }

    function getDaysInMonth(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }

    const result = {};
    const uniqueMonths = new Set();

    input.loginStreaks.forEach(streak => {
        const startMonthYear = getMonthYearKey(streak.startDate);
        const endMonthYear = getMonthYearKey(streak.endDate);
        uniqueMonths.add(startMonthYear);
        uniqueMonths.add(endMonthYear);
    });

    input.rewardDates.forEach(reward => {
        const rewardMonthYear = getMonthYearKey(reward.date);
        uniqueMonths.add(rewardMonthYear);
    });

    uniqueMonths.forEach(monthYear => {
        const [month, year] = monthYear.split("'");
        const date = new Date(`20${year}-${month}-01`);
        const daysInMonth = getDaysInMonth(date);
        const daysArray = Array(daysInMonth).fill(0);
        result[monthYear] = { days: daysArray };
    });

    input.loginStreaks.forEach(streak => {
        const startDate = new Date(streak.startDate);
        const endDate = new Date(streak.endDate);

        while (startDate <= endDate) {
            const monthYear = getMonthYearKey(startDate);
            const dayIndex = startDate.getDate() - 1;
            if (result[monthYear]) {
                result[monthYear].days[dayIndex] = 1;
            }
            startDate.setDate(startDate.getDate() + 1);
        }
    });

    const lastLoginDate = new Date(input.lastLogin);
    const latestStreakEndDate = new Date(lastLoginDate);
    const latestStreakStartDate = new Date(lastLoginDate);
    latestStreakStartDate.setDate(latestStreakEndDate.getDate() - input.consecutiveLoginDays + 1);

    while (latestStreakStartDate <= latestStreakEndDate) {
        const monthYear = getMonthYearKey(latestStreakStartDate);
        const dayIndex = latestStreakStartDate.getDate() - 1;
        if (result[monthYear]) {
            result[monthYear].days[dayIndex] = 1;
        }
        latestStreakStartDate.setDate(latestStreakStartDate.getDate() + 1);
    }

    input.rewardDates.forEach(reward => {
        const rewardDate = new Date(reward.date);
        const monthYear = getMonthYearKey(rewardDate);
        const dayIndex = rewardDate.getDate() - 1;
        if (result[monthYear]) {
            result[monthYear].days[dayIndex] = reward.type;
        }
    });

    return result;
}

// Update user visit and login

router.get('/visit', authenticateToken, async (req, res) => {
    try {
        let streak = await Streak.findOne({ _id: req.user._id });

        let today = new Date();
        let lastLogin = new Date(streak.lastLogin);
        const dayinMS =  1000 * 60 * 60 * 24;
        lastLogin.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const daysSinceLastLogin = (today - lastLogin) / dayinMS;

        let message;

        if (daysSinceLastLogin < 1) {
            message = 'Already visited today, points remain the same';
        } else {
            streak.lastLogin = today;
            streak.totalPoints++;
        
            if (daysSinceLastLogin === 1) {
                streak.consecutiveLoginDays++;
                if (streak.consecutiveLoginDays % 7 === 0) {
                    streak.trophies++;
                    streak.rewardDates.push[{
                        date: today,
                        type: 2
                    }];
                }
                if (streak.consecutiveLoginDays % 10 === 0) {
                    streak.rolls++;
                    streak.rewardDates.push[{
                        date: today,
                        type: 3
                    }];
                }
            } else {
                streak.loginStreaks.push({
                    startDate: new Date(lastLogin.getTime() - ((streak.consecutiveLoginDays-1) * 24 * 60 * 60 * 1000)),
                    endDate: lastLogin,
                    consecutiveDays: streak.consecutiveLoginDays-1
                });
                streak.consecutiveLoginDays = 1;
            }
        
            await streak.save();
            message = 'Visit logged successfully';
        }

        res.status(200).json({ message });
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
        let flattened =  await flattenStreakData(streak)
        result = streak.toObject();
        delete result['loginStreaks']; 
        result['data'] = flattened;
        res.status(200).json({ result });

        // streak.loginStreaks = Object.values(streak.loginStreaks);
        // res.status(200).json({ streak });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        // get top 5 users based on trophies
        const top5 = await Streak.find().sort({ trophies: -1, consecutiveLoginDays: -1, totalPoints: -1, name: 1 }).limit(5);
        // get current user rank based on trophies
        const user = await Streak.findOne({ _id: req.user._id });
        const currentRank = await Streak.find({ trophies: { $gt: user.trophies } }).countDocuments() + 1;
        res.status(200).json({ top5, currentRank })
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
