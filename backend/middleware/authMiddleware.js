const jwt = require('jsonwebtoken'); // Token ko verify karne ke liye library
const FamilyMember = require('../models/familyMember.js'); // User model taaki database se user dhoondh sakein

// 'protect' naam ka middleware function
const protect = async (req, res, next) => {
    let token;

    // Check karo ki request ke header mein authorization hai aur woh 'Bearer' se shuru hota hai
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Header se token nikalo (e.g. "eyJhbGci..."
            token = req.headers.authorization.split(' ')[1];

            // Token ko verify karo. Yeh check karega ki token valid hai ya nahi.
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Token se user ID nikal kar, database se user ki details nikalo (bina password ke)
            req.user = await FamilyMember.findById(decoded.id).select('-password');

            // Sab theek hai, to request ko aage badhne do (agle function tak)
            next();
        } catch (error) {
            // Agar token galat ya expired hai to error bhej do
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // Agar header mein token hi nahi mila to error bhej do
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// 'protect' function ko export karo taaki hum ise routes mein use kar sakein
module.exports = { protect };