import express from 'express';
import Table from '../models/Table.js';
import { isUser, isAdmin } from '../utils/auth.js';

const router = express.Router();

// Get all tables
router.get('', isUser, async (req, res) => {
    const tables = await Table.find();
    res.json(tables);
});

// Admin: create table
router.post('', isUser, isAdmin, async (req, res) => {
    const { name, seats, description } = req.body;
    const table = await Table.create({ name, seats, description });
    res.status(201).json(table);
});

// Admin: update table
router.put('/:id', isUser, isAdmin, async (req, res) => {
    const { name, seats, description } = req.body;
    const table = await Table.findByIdAndUpdate(req.params.id, { name, seats, description }, { new: true });
    res.json(table);
});

// Admin: delete table
router.delete('/:id', isUser, isAdmin, async (req, res) => {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

export default router;
