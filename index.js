const express = require("express");
const cors = require("cors");
// const bodyParser = require("body-parser"); - Not required
require('dotenv').config();
const connectDB = require('./db');
const app = express();
const port = process.env.PORT || 3000;
const auth = require('./routes/auth');

app.use(express.json({limit: '25mb'}));

connectDB();

app.use(cors());

app.use(express.urlencoded());

app.use('/auth', auth);
app.get("/free", (req, res) => {
    res.send("This is a free endpoint.");
});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    }
);

