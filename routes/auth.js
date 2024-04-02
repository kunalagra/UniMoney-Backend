const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const app = express();
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

const JWT_SECRET = 'secret';


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
            const newUser = new User(data);
            await newUser.save();

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
        const token = jwt.sign({ email: user.email }, JWT_SECRET);

        res.json({ message: 'Login successful.', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Get user profile endpoint
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // Find user by email in MongoDB
        const user = await User.findOne({ _id: req.user._id });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ user });
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
