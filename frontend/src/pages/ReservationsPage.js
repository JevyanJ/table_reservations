import React, { useState } from 'react';
import {
    Box,
    TextField,
    Typography
} from '@mui/material';
import UserReservations from '../components/UserReservations';
import CalendarTable from '../components/CalendarTable';
import ReservationForm from '../components/ReservationForm';

export default function ReservationsPage () {
    // Inicializar con el día actual en formato YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(todayStr);

    return (
        <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, ml: 2, mt: 2 }}>
                Reservas de Mesas
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, ml: 2, alignItems: 'center' }}>
                <TextField
                    label="Fecha"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    slotProps={{ htmlInput: { min: new Date().toISOString().split('T')[0] } }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', ml: 2 }}>
                <Box sx={{ flex: 2, minWidth: 0 }}>
                    <CalendarTable date={date} />
                    <UserReservations date={date} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 350 }}>
                    <ReservationForm date={date} />
                </Box>
            </Box>
        </Box>
    );
}
