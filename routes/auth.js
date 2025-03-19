const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Streak = require('../models/Streak');
const Reminder = require('../models/Reminder');
const router = express.Router();

const defaultCategories = [
    {
        name: 'ATM',
        img: "uploads/cash_withdrawal.png"
    },
    {
        name: 'Bills',
        img: "uploads/bill.png"
    },
    {
        name: 'Education',
        img: "uploads/education.png"
    },
    {
        name: 'Entertainment',
        img: "uploads/entertainment.png"
    },
    {
        name: 'Food & drinks',
        img: "uploads/food.png"
    },
    {
        name: 'Fuel',
        img: "uploads/fuel.png"
    },
    {
        name: 'Gadgets',
        img: "uploads/gadget.png"
    },
    {
        name: 'Groceries',
        img: "uploads/cart_shopping.png"
    },
    {
        name: 'Shopping',
        img: "uploads/shopping.png"
    },
    {
        name: 'Health',
        img: "uploads/medicines.png"
    },
    {
        name: 'Household',
        img: "uploads/shampoo.png"
    },
    {
        name: 'House rent',
        img: "uploads/house.png"
    },
    {
        name: 'Insurance',
        img: "uploads/insurance.png"
    },
    {
        name: 'Investment',
        img: "uploads/investment.png"
    },
    {
        name: 'Payments',
        img: "uploads/payments.png"
    },
    {
        name: 'Transfers',
        img: "uploads/bank.png"
    },
    {
        name: 'Travel',
        img: "uploads/travel.png"
    },
];


router.post('/register', async (req, res) => {
    const data = req.body;
    // Validate request parameters
    if (!data.username || !data.email || !data.password) {
        return res.status(400).json({ error: 'Validation failed.', details: ['Username, email, and password are required.'] });
    }

    try {
        // check is use is alradey exist
        const user = await User.findOne({ email: data.email });
        if (user) {
            return res.status(400).json({ error: 'User already exists.' });

        } else {
            const hash = bcrypt.hashSync(data.password, 10);
            data.password = hash;
            const newUser = await User.create(data);
            await Streak.create({ _id: newUser._id, name: newUser.username });
            data.userInfo._id = newUser._id;
            const newUserInfo = new UserInfo(data.userInfo);
            const categoryLimits = data.userInfo.categoriesLimits;
            for (let i=0; i<defaultCategories.length; i++){
                const category = await Category.findOne({ name: defaultCategories[i].name });
                if (!category) {
                    const newCategory = new Category(defaultCategories[i]);
                    const category = await newCategory.save();
                    newUserInfo.category.push({details: category._id, limit: categoryLimits[i]});
                }
                else{
                    newUserInfo.category.push({details: category._id, limit: categoryLimits[i]});
                }
            }
            await newUserInfo.save();
            // to-do: drop transaction from register call and move it to POST /transacation
            if (data.transaction){
                for (let i=0; i<data.transaction.length; i++){
                    const temp = data.transaction[i];
                    const cat = await Category.findOne({ name: temp.category });
                    temp.category = cat._id;
                    temp.user = newUser._id;
                    await Transaction.create(temp);
                }
            }
            
            res.status(201).json({ message: 'User registered successfully.', userId: newUser._id.toString() });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// User login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({user}, process.env.JWT_SECRET);
            return res.json({ message: 'Login successful.', token });
        }
        else{
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Get user profile endpoint
router.get('/profile', authenticateToken, async (req, res) => {
    // console.log(req.user);
    try {
        // Find user by email in MongoDB
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const userInfo = await UserInfo.findById(req.user._id);
        // populate each category details
        for (let i=0; i<userInfo.category.length; i++){
            const category = await Category.findById(userInfo.category[i].details);
            userInfo.category[i].details = category;
        }
        res.json({ user, userInfo });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }

});

// Update user profile endpoint
router.put('/profile', authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        // Find user by email in MongoDB
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        // Update user data
        user.username = data.username;
        user.email = data.email;
        user.image = data.image;
        await user.save();
        res.json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// User logout endpoint (JWT token is stateless, so nothing specific to do on the server)
router.post('/logout', authenticateToken, async (req, res) => {
    return res.json({ message: 'Logout successful.' });
});

// Account delete Endpoint
//to-do delete new category created by user
router.delete('/deleteaccount', authenticateToken, async (req, res) => {
    try {
        await Transaction.deleteMany({
            user: req.user._id
        });
        await Reminder.deleteMany({
            user: req.user._id
        });
        await Streak.deleteOne({
            user: req.user._id
        });
        await UserInfo.deleteOne({
            user: req.user._id
        });
        await User.deleteOne({
            user: req.user._id
        });
        return res.json({ message: 'Complete Account Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }

});

module.exports = router;
