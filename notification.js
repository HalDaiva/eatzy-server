require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require("./firebase/eatzy-45153-firebase-adminsdk-fbsvc-d088ae54cd.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

app.post('/send', async (req, res) => {
    const { fcmToken, title, body } = req.body;

    const message = {
        notification: {
            title: title || "Default Title",
            body: body || "Default Body",
        },
        token: "fsOmTSX7QBWM5yvwbe-R2f:APA91bEK23T8f-yHMpEC8BhHRrYi3_bQQH5zFloQ3nKnayY2Eh7Q0JrBmxfGihW3cPd4PK0eXD6eufjyh7633r3HEGRbUZNV1gwbHzQ5Wd_mGEklADTSHu8",
    };

    try {
        const response = await messaging.send(message);
        console.log("Successfully sent message:", response);
        res.status(200).json({ success: true, response });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, error });
    }
});

// app.listen(3007, () => {
//     console.log("✅ Server running at http://localhost:3007`");
// });


exports.sendNotification = async (token, title, body) => {
    const message = {
        notification: {
            title: title || "Default Title",
            body: body || "Default Body",
        },
        token: token,
    };

    try {
        const response = await messaging.send(message);
        console.log("Successfully sent message:", response);
    } catch (e) {
        console.error("Error sending message:", e.message);
    }
}