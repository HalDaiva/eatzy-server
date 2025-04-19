const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
app.use("/users", userRoutes);

app.listen(3002, () => {
    console.log("Server is running on http://localhost:3002");
});
