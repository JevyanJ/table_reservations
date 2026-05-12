import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import Reservation from '../models/Reservation.js';
import { bearerAuth } from '../utils/auth.js';
import Table from '../models/Table.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();

// Get available time slots for a table
router.get('', bearerAuth, async (req, res) => {
    let tableIds = req.query.tableIds; // Puede ser un string separado por comas o un array
    const { date } = req.query; // YYYY-MM-DD
    const timezone = req.query.timezone || 'UTC';

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
                start: { $lte: dayjs.tz(date + 'T' + slot, timezone).toDate() },
                end: { $gte: dayjs.tz(date + 'T' + slot, timezone).toDate() }
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
        slots: output
    }
    );
});

export default router;
