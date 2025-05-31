require('dotenv').config()
const express = require('express');
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const testRoutes = require('./routes/testRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');


const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use('/auth', authRoutes )
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/favorites", favoriteRoutes);

app.listen(3002, () => {
    console.log("Server is running on http://localhost:3002");
});


// fsOmTSX7QBWM5yvwbe-R2f:APA91bEK23T8f-yHMpEC8BhHRrYi3_bQQH5zFloQ3nKnayY2Eh7Q0JrBmxfGihW3cPd4PK0eXD6eufjyh7633r3HEGRbUZNV1gwbHzQ5Wd_mGEklADTSHu8

