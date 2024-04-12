const express = require("express");
const cors = require("cors");
// const bodyParser = require("body-parser"); - Not required
require('dotenv').config();
const connectDB = require('./db');
const app = express();
const port = process.env.PORT || 3000;
const auth = require('./routes/auth');
const category = require('./routes/category');
const path = require('path');
const transaction = require('./routes/transaction');
const bank = require('./routes/bank');
const streak = require('./routes/streak');

app.use(express.json({limit: '25mb'}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.use(cors());

app.use(express.urlencoded({extended: false}));

app.use('/auth', auth);
app.get("/free", (req, res) => {
    res.send("This is a free endpoint.");
});
app.use('/category', category);
app.use('/transaction', transaction);
app.use('/bank', bank);
app.use('/streak', streak);


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    }
);

