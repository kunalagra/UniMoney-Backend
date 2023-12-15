const express = require("express");
const cors = require("cors");
// const bodyParser = require("body-parser"); - Not required
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({limit: '25mb'}));


app.use(cors());

app.use(express.urlencoded());

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Unauthorized access. Please log in.' });

  jwt.verify(token.replace('Bearer ', ''), JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};



// Connect to MongoDB 
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);


// User registration endpoint
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  // Validate request parameters
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Validation failed.', details: ['Username, email, and password are required.'] });
  }

  try {
    // Save user information to MongoDB
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.', userId: newUser._id.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// User login endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email and password in MongoDB
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);

    res.json({ message: 'Login successful.', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// Get user profile endpoint
app.get('/user/profile', authenticateToken, async (req, res) => {
  const { userId, email } = req.user;

  try {
    // Retrieve user profile from MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ userId: user._id.toString(), username: user.username, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// User logout endpoint (JWT token is stateless, so nothing specific to do on the server)
app.post('/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful.' });
});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    }
);

