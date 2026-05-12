import { React, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useReservations } from '../context/ReservationsContext';
import { useMe } from '../context/MeContext';
import { useSlots } from '../context/SlotsContext';

export default function ReservationList ({ ids, onEdit }) {
    const { handleDeleteReservation, getReservationsForIDs, handleEditReservation } = useReservations();
    const { me } = useMe();
    const { refreshSlots } = useSlots();
    const [reservations, setReservations] = useState([]);


    useEffect(() => {
        if (!ids || ids.length === 0) {
            setReservations([]);
            return;
        }
        const fetchReservations = async () => {
            const res = await getReservationsForIDs(ids);
            setReservations(res ? res : []);
        };
        fetchReservations();
    }, [ids, getReservationsForIDs]);

    return (
        <Box mt={4} mr={5}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                Reservas
            </Typography>
            <List>
                {!reservations || reservations.length === 0 ? (
                    <ListItem>
                        <ListItemText primary="No hay reservas en esa franja. Selecciona una distinta." />
                    </ListItem>
                ) : (
                    reservations.map(r => (

                        <ListItem key={r._id}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                            secondaryAction={r.createdBy === me?._id ? (
                                <>
                                    <IconButton edge="end" aria-label="delete" onClick={async () => {
                                        await handleDeleteReservation(r._id);
                                        refreshSlots();
                                    }}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="edit" onClick={() => onEdit(r)}>
                                        <EditIcon />
                                    </IconButton>
                                </>
                            ) : null}>
                            <ListItemText
                                sx={{ flex: 1 }}
                                primary={
                                    `${r.title ? r.title : '<sin título>'}`.trim()
                                }
                                secondary={
                                    <>
                                        <Typography variant="caption" color="textSecondary" component="span" sx={{ display: 'block' }}>
                                            {`${r.description ? r.description : '<sin descripción>'}`.trim()}
                                        </Typography>
                                    </>
                                }
                            />
                            <ListItemText
                                sx={{ flex: 1 }}
                                primary={
                                    `${dayjs(r.start).format('HH:mm')} a ${dayjs(r.end).format('HH:mm')}`
                                } secondary={
                                    <>
                                        <Typography variant="caption" color="textSecondary" component="span" sx={{ display: 'block' }}>
                                            {`${r.table?.name}${r.fullTable ? ' [Mesa completa]' : ''}`}
                                        </Typography>
                                    </>
                                }
                            />
                            <Box sx={{ mt: 0.5 }}>
                                Usuarios:&nbsp;
                                {r.users.map(u => <Chip key={u._id} label={u.nickname ? u.nickname : u.name} size="small" sx={{ mr: 0.5 }} />)}
                                &nbsp;({r.users.length} {r.users.length === 1 ? 'persona' : 'personas'})
                            </Box>
                        </ListItem>
                    ))
                )}
            </List>
        </Box>
    )
}
