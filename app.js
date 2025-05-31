require('dotenv').config()
const express = require('express');
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use('/auth', authRoutes )
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/test", testRoutes);

app.listen(3002, () => {
    console.log("Server is running on http://localhost:3002");
});

