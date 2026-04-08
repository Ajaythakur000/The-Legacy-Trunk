import jwt from 'jsonwebtoken';
import FamilyMember from '../models/familyMember.js';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 SECURITY FIX: Token Type Validation (Bug 9)
    // Ab koi 'Invite Token' chura kar API access nahi kar payega!
    if (decoded.type !== 'auth') {
      return res.status(401).json({ message: 'Not authorized, invalid token type' });
    }

    const user = await FamilyMember.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    // Hidden Bug Fix: Keep internal errors out of the response
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: 'Not authorized, token failed or expired' });
  }
};

export { protect };