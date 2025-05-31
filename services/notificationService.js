const express = require('express');
const cors = require('cors');
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require("../firebase/eatzy-45153-firebase-adminsdk-fbsvc-d088ae54cd.json");
const User = require("../models/userModel");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

exports.sendNotification = async (userId, title, body) => {

    const deviceToken = await User.getDeviceToken(userId);
    console.log(deviceToken);

    const message = {
        notification: {
            title: title || "Default Title",
            body: body || "Default Body",
        },
        token: deviceToken,
    };

    try {
        const response = await messaging.send(message);
        console.log("Successfully sent message:", response);
    } catch (e) {
        console.error("Error sending message:", e.message);
    }
}