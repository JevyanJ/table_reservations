import React, { useState } from 'react';
import {
    Box,
    TextField,
    Typography
} from '@mui/material';
import ReservationList from '../components/ReservationList';
import CalendarTable from '../components/CalendarTable';
import ReservationForm from '../components/ReservationForm';
import { Button, Modal } from '@mui/material';
import dayjs from 'dayjs';

export default function ReservationsPage () {
    // Inicializar con el día actual en formato YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(todayStr);
    const [ids, setIDs] = useState([]); // Agregar estado para los IDs de reservas seleccionadas
    const [openModal, setOpenModal] = useState(false);

    return (
        <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, ml: 2, mt: 2 }}>
                Reservas de Mesa
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, ml: 2, alignItems: 'center' }}>
                <TextField
                    label="Fecha"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenModal(true)} sx={{ ml: 2 }}
                    disabled={!date || date < dayjs().format('YYYY-MM-DD')}
                >
                    Nueva Reserva
                </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', ml: 2 }}>
                <Box sx={{ flex: 2, minWidth: 0 }}>
                    <CalendarTable date={date} setIDs={setIDs} />
                    <ReservationList ids={ids} />
                </Box>
            </Box>
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-reserva-title"
                aria-describedby="modal-reserva-desc"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 0, borderRadius: 2, minWidth: 500, width: 600, maxWidth: '90vw', minHeight: 100 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center', p: 1
                    }}>
                        <Button
                            onClick={() => setOpenModal(false)}
                            sx={{
                                minWidth: 0,
                                padding: 0.5,
                                lineHeight: 1,
                                fontSize: 22,
                                margin: 0,
                                color: 'grey.700'
                            }}
                            aria-label="Cerrar modal"
                        >
                            ×
                        </Button>
                    </Box>
                    <ReservationForm date={date} onClose={() => setOpenModal(false)} />
                </Box>
            </Modal>
        </Box>
    );
}
