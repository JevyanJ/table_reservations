import express from 'express';
import dayjs from 'dayjs';
import Reservation from '../models/Reservation.js';
import { bearerAuth, isUser } from '../utils/auth.js';
import User from '../models/User.js';
import Table from '../models/Table.js';


const router = express.Router();

// Get reservations
// GET /reservations?only_me=true&date=YYYY-MM-DD
router.get('', bearerAuth, async (req, res) => {
    const { only_me, date } = req.query;
    const filter = {};
    // Filtrar por usuario
    if (only_me) {
        filter.$or = [
            { users: req.user._id },
            { createdBy: req.user._id }
        ];
    }
    // Filtrar por fecha
    if (date) {
        const startOfDay = dayjs(date).startOf('day').toDate();
        const endOfDay = dayjs(date).endOf('day').toDate();
        filter.start = { $gte: startOfDay, $lte: endOfDay };
    }
    const reservations = await Reservation.find(filter).populate('table users');
    res.json(reservations);
});

// Get reservations
// GET /reservations/:id
router.get('/:id', bearerAuth, async (req, res) => {
    const filter = { _id: req.params.id };

    const reservations = await Reservation.find(filter).populate('table users');
    if (!reservations || reservations.length === 0) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.json(reservations[0]);
});

// Create reservation
router.post('', isUser, async (req, res) => {
    const {
        title,
        description,
        tableName,
        start,
        end,
        userIds,
        userEmails,
        fullTable,
        userCount
    } = req.body;
    let tableId = req.body.tableId; // Para permitir modificar tableId si se proporciona tableName
    const localStartDate = dayjs(start).toDate();
    const localEndDate = dayjs(end).toDate();
    console.log("Body: ", req.body);

    if (!tableId && !tableName) {
        return res.status(400).json({ error: 'tableId o tableName es requerido' });
    }
    if (!tableId && tableName) {
        const table = await Table.findOne({ name: tableName });
        if (!table) {
            return res.status(400).json({ error: `No se encontró la mesa con ese nombre: ${tableName}` });
        }
        tableId = table._id;
    }
    if (!start || !end || localEndDate <= localStartDate) {
        return res.status(400).json({ error: 'Fechas inválidas' });
    }


    // Buscar reservas que se solapan
    const overlapQuery = {
        table: tableId,
        $or: [
            { start: { $lt: localEndDate, $gte: localStartDate } },
            { end: { $gt: localStartDate, $lte: localEndDate } },
            { start: { $lte: localStartDate }, end: { $gte: localEndDate } }
        ],
        fullTable: true // Si hay una reserva fullTable, no permitir ninguna otra reserva en ese rango  
    };

    const overlaps = await Reservation.find(overlapQuery);
    if (overlaps.length > 0) {
        return res.status(409).json({ error: 'Esta mesa ya está completa en ese horario.' });
    }
    let finalUserIds = userIds || [];
    if (userEmails && userEmails.length > 0) {
        const users = await User.find({ email: { $in: userEmails } });
        if (users.length !== userEmails.length) {
            return res.status(400).json({ error: 'Algunos emails no corresponden a usuarios registrados.' });
        }
        const userIdsFromEmails = users.map(u => u._id.toString());
        finalUserIds = [...new Set([...finalUserIds, ...userIdsFromEmails])];
    }

    let realUsersCount = userCount || 0;

    if (finalUserIds.length > 0) {
        realUsersCount = Math.max(finalUserIds.length, userCount || 0);
    }

    const reservationData = {
        title,
        description,
        table: tableId,
        users: finalUserIds,
        start: localStartDate,
        end: localEndDate,
        userCount: realUsersCount,
        createdBy: req.user._id
    };
    if (typeof fullTable !== 'undefined') {
        reservationData.fullTable = !!fullTable;
    }
    const reservation = await Reservation.create(reservationData);
    res.status(201).json(reservation);
});

// Delete reservation (only creator or admin)
router.delete('/:id', bearerAuth, async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Not found' });
    if (reservation.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    await reservation.deleteOne();
    res.json({ success: true });
});

// Get available time slots for a table
router.get('/slots', bearerAuth, async (req, res) => {
    let tableIds = req.query.tableIds; // Puede ser un string separado por comas o un array
    const { date } = req.query; // YYYY-MM-DD

    if (!tableIds) {
        tableIds = await Table.find().select('_id').then(tables => tables.map(t => t._id.toString()));
    } else {
        if (typeof tableIds === 'string') {
            tableIds = tableIds.split(',');
        }
    }

    let output = {};
    for (const tableId of tableIds) {

        // Generar las franjas de media hora
        const slots = {};
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 2; m++) {
                const hour = String(h).padStart(2, '0');
                const min = m === 0 ? '00' : '30';
                const slot = `${hour}:${min}`;
                slots[slot] = [];
            }
        }
        for (const slot of Object.keys(slots)) {
            const reservations = await Reservation.find({
                table: tableId,
                start: { $lte: dayjs(date + 'T' + slot).toDate() },
                end: { $gte: dayjs(date + 'T' + slot).toDate() }
            });
            const reservationsData = reservations.map(r => ({
                id: r._id,
                fullTable: r.fullTable
            }));
            const available = !reservations.some(r => r.fullTable);
            const peopleCount = reservations.reduce((sum, r) => sum + (r.userCount || 0), 0);
            slots[slot] = {
                reservations: reservationsData,
                available,
                peopleCount
            };
        }
        output[tableId] = slots;
    }

    res.json({
        day: date,
        reservations: output
    }
    );
});

export default router;
