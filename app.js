require('dotenv').config()
const express = require('express');
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const testRoutes = require('./routes/testRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const salesRoutes = require('./routes/salesRoutes');
const canteenRoutes = require('./routes/canteenRoutes');
const menuRoutes = require('./routes/menuRoutes');


const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use('/auth', authRoutes )
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/test", testRoutes);
app.use("/sales", salesRoutes);
app.use('/canteens',canteenRoutes);
app.use('/menus',menuRoutes);

app.listen(3002,'0.0.0.0', () => {
    console.log("Server is running on http://localhost:3002");
});
