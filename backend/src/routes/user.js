import express from 'express';
import User from '../models/User.js';
import { isUser, isAdmin, isAuthenticated } from '../utils/auth.js';

const router = express.Router();

// Buscar usuarios por email (para añadir a reservas)
router.post('/find', isUser, async (req, res) => {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) return res.json([]);
    const users = await User.find({ email: { $in: emails } });
    res.json(users);
});


// Listar todos los usuarios (sólo admin)
router.get('', isUser, isAdmin, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.get('/me', isAuthenticated, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.user);
});

// Cambiar el tipo de usuario (sólo admin)
router.put('/:id/role', isUser, isAdmin, async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin', 'guest'].includes(role)) {
        return res.status(400).json({ error: 'Rol no válido' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
});

// Cambiar el nickname (sólo el propio usuario o admin)
router.put('/:id/nickname', isAuthenticated, async (req, res) => {
    const { nickname } = req.body;
    if (typeof nickname !== 'string' || nickname.trim() === '') {
        return res.status(400).json({ error: 'Nickname no válido' });
    }
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { nickname }, { new: true });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
});

export default router;
