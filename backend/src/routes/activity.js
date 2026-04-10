import express from 'express';
import Activity from '../models/Activity.js';
import { isAuthenticated, isAdmin } from '../utils/auth.js';

const router = express.Router();

// Listar actividades (juegos, eventos, rol, pintura, etc.)
router.get('', isAuthenticated, async (req, res) => {
    try {
        const { type } = req.query;
        const filter = type ? { type } : {};
        const activities = await Activity.find(filter);
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar actividades' });
    }
});

// Añadir actividad
router.post('', isAuthenticated, async (req, res) => {
    try {
        const { name, description, type } = req.body;
        const activity = new Activity({ name, description, type, createdBy: req.user._id });
        await activity.save();
        res.status(201).json(activity);
    } catch (err) {
        res.status(400).json({ error: 'Error al añadir actividad' });
    }
});

// Editar actividad
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { name, description, type } = req.body;
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            { name, description, type },
            { new: true }
        );
        if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });
        res.json(activity);
    } catch (err) {
        res.status(400).json({ error: 'Error al editar actividad' });
    }
});

// Borrar actividad
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);
        if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });
        res.json({ message: 'Actividad borrada' });
    } catch (err) {
        res.status(400).json({ error: 'Error al borrar actividad' });
    }
});

export default router;
