import React, { useState } from 'react';
import {
    Box,
    TextField,
    Typography
} from '@mui/material';
import { Button, Modal } from '@mui/material';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import ReservationList from '../components/ReservationList';
import CalendarTable from '../components/CalendarTable';
import ReservationForm from '../components/ReservationForm';
import { useSlots } from '../context/SlotsContext';
import { useReservations } from '../context/ReservationsContext';


export default function ReservationsPage () {
    // Inicializar con el día actual en formato YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const { date, updateDate, refreshSlots } = useSlots();
    const { handleCreateReservation, handleEditReservation } = useReservations();
    const [ids, setIDs] = useState([]); // Agregar estado para los IDs de reservas seleccionadas
    const [openModal, setOpenModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const closeReservationModal = () => {
        setOpenModal(false);
        setSelectedReservation(null);
        refreshSlots();
    }

    const saveNewReservation = async (data) => {
        try {
            handleCreateReservation(data);
            setOpenModal(false);
            setSelectedReservation(null);
            refreshSlots();
        } catch (err) {
            console.error('Error al crear o editar la reserva:', err);
            alert('Error al crear o editar la reserva. Inténtalo de nuevo.');
        }
    }

    const updateReservation = async (data) => {
        try {
            const id = await handleEditReservation(data);
            if (!id) {
                alert('Ocurrió un error al actualizar la reserva. Inténtalo de nuevo.');
                return;
            }
            setOpenModal(false);
            setSelectedReservation(null);
            refreshSlots();
        } catch (err) {
            console.error('Error al crear o editar la reserva:', err);
            alert('Error al crear o editar la reserva. Inténtalo de nuevo.');
        }
    }

    const editReservation = (data) => {
        const reservationData = {
            ...data,
            tableId: data.table._id,
            start: dayjs(data.start).format('HH:mm'),
            end: dayjs(data.end).format('HH:mm')
        }
        setSelectedReservation(reservationData);
        setOpenModal(true);
    }

    const changeDate = (newDate) => {
        updateDate(newDate);
        setIDs([]); // Limpiar IDs al cambiar de fecha
    }

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
                    onChange={e => changeDate(e.target.value)}
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
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', ml: 2, mr: 5 }}>
                <Box sx={{ flex: 2, minWidth: 0 }}>
                    <CalendarTable date={date} setIDs={setIDs} />
                    <ReservationList ids={ids} onEdit={editReservation} />
                </Box>
            </Box>
            <Modal
                open={openModal}
                onClose={closeReservationModal}
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
                            onClick={closeReservationModal}
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
                    <ReservationForm
                        date={date}
                        data={selectedReservation || {}}
                        onSave={saveNewReservation}
                        onUpdate={updateReservation}
                    />
                </Box>
            </Modal>
        </Box>
    );
}
