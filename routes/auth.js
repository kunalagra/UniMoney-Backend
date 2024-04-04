const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const authenticateToken = require('../middleware/authenticateToken');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const router = express.Router();

const JWT_SECRET = 'secret';

const defaultCategories = [
    {
        name: 'ATM',
        path: "uploads\\cash_withdrawal.png"
    },
    {
        name: 'Bills',
        path: "uploads\\bill.png"
    },
    {
        name: 'Education',
        path: "uploads\\education.png"
    },
    {
        name: 'Entertainment',
        path: "uploads\\entertainment.png"
    },
    {
        name: 'Food & drinks',
        path: "uploads\\food.png"
    },
    {
        name: 'Fuel',
        path: "uploads\\fuel.png"
    },
    {
        name: 'Gadgets',
        path: "uploads\\gadget.png"
    },
    {
        name: 'Groceries',
        path: "uploads\\cart_shopping.png"
    },
    {
        name: 'Shopping',
        path: "uploads\\shopping.png"
    },
    {
        name: 'Health',
        path: "uploads\\medicines.png"
    },
    {
        name: 'Household',
        path: "uploads\\shampoo.png"
    },
    {
        name: 'House rent',
        path: "uploads\\house.png"
    },
    {
        name: 'Insurance',
        path: "uploads\\insurance.png"
    },
    {
        name: 'Investment',
        path: "uploads\\investment.png"
    },
    {
        name: 'Payments',
        path: "uploads\\payments.png"
    },
    {
        name: 'Transfers',
        path: "uploads\\bank.png"
    },
    {
        name: 'Travel',
        path: "uploads\\travel.png"
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
            // Create new user

            const newUser = await User.create(data);
            data.userInfo._id = newUser._id;
            const newUserInfo = UserInfo.create(data.userInfo);
            for (let i=0; i<defaultCategories.length; i++){
                const category = await Category.findOne({ name: defaultCategories[i].name });
                if (!category) {
                    const newCategory = new Category(defaultCategories[i]);
                    const category = await newCategory.save();
                    newUserInfo.category.push({details: category._id});
                }
                else{
                    newUserInfo.category.push({details: category._id});
                }
            }
            for (let i=0; i<data.transaction.length; i++){
                const newTransaction = new Transaction(data.transaction[i]);
                const transaction = await newTransaction.save();
                newUserInfo.transaction.push(transaction._id);
            }
            await newUserInfo.save();

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
        // Find user by email and password in MongoDB
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate JWT token
        const token = jwt.sign({user}, JWT_SECRET);

        res.json({ message: 'Login successful.', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Get user profile endpoint
router.get('/profile', authenticateToken, async (req, res) => {
    console.log(req.user);
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

// User logout endpoint (JWT token is stateless, so nothing specific to do on the server)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logout successful.' });
});

module.exports = router;
