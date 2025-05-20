require('dotenv').config()
const express = require('express');
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const canteenRoutes = require('./routes/canteenRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');


const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use('/auth', authRoutes );
app.use('/canteens',canteenRoutes);
app.use('/menus',menuRoutes);
app.use('/orders',orderRoutes);

app.listen(3002, () => {
    console.log("Server is running on http://localhost:3002");
});
