const jwt = require("jsonwebtoken");



exports.authorize = (role = null) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        try {
            if (!token) {
                throw new Error("Access Denied.");
            }
            const data = jwt.verify(token, process.env.TOKEN_KEY);

            if (!data) {
                throw new Error("Invalid token.");
            }

            if (data.role !== role) {
                throw new Error("Access Denied.");
            }

            next();
        } catch (e) {
            res.status(401).json({ error: e.message });
        }
    }
}