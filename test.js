const bcrypt = require('bcryptjs');

const storedHash = "$2b$10$8ScVLtYXO489eGf9nIFzb.IpqUD9Gk.eephQhl/AERhj5elfdrU76"; // Replace with the hash from the database
const plaintextPassword = "rahasia";

bcrypt.compare(plaintextPassword, storedHash).then(isMatch => {
    console.log("Password match:", isMatch);
});