
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function bearerAuth (req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

export async function isAuthenticated (req, res, next) {
    await bearerAuth(req, res, async () => {
        next();
    });
}

export async function isAdmin (req, res, next) {
    await bearerAuth(req, res, async () => {
        if (req.user && req.user.role === 'admin') return next();
        res.status(403).json({ error: 'Admin only' });
    });
}

export async function isUser (req, res, next) {
    await bearerAuth(req, res, async () => {
        if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) return next();
        res.status(403).json({ error: 'User only' });
    });
}
