try {
    process.loadEnvFile();
}
catch (e) {
    console.error(e)
}
const express = require("express");
const cors = require("cors");
const connectDB = require('./db');
const app = express();
const port = process.env.PORT || 3000;
const auth = require('./routes/auth');
const category = require('./routes/category');
const path = require('path');
const transaction = require('./routes/transaction');
const bank = require('./routes/bank');
const streak = require('./routes/streak');
const reminder = require('./routes/reminder');


app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use('/auth', auth);
app.use('/category', category);
app.use('/transaction', transaction);
app.use('/bank', bank);
app.use('/streak', streak);
app.use('/reminder', reminder);


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
}
);

