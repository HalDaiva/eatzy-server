require('dotenv').config()
const express = require('express');
const bcrypt = require("bcryptjs");
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
app.use(cors());

app.use(express.json());
app.use("/users", userRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);

app.listen(3002, () => {
    console.log("Server is running on http://localhost:3002");
});