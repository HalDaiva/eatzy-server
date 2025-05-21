const jwt = require("jsonwebtoken");



exports.authorize = (role = 'canteen') => {
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

            req.user = data;
            
            if (data.role !== role) {
                throw new Error("Access Denied.");
            }

             // 🔥 Tambahkan baris ini agar req.user tidak undefined!
            next();
        } catch (e) {
            res.status(401).json({ error: e.message });
        }
    }
}