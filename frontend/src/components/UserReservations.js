import { React, useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMe } from '../context/MeContext';

export default function UserReservations ({ date }) {
    const { handleDeleteReservation, getReservationsForDate } = useMe();
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        console.log('Obteniendo reservas para la fecha:', date);
        const fetchReservations = async () => {
            const res = await getReservationsForDate(date);
            console.log('Reservas obtenidas:', res);
            setReservations(res ? res : []);
        };
        fetchReservations();
    }, [date, getReservationsForDate]);

    return (
        <Box mt={4}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                Mis Reservas
            </Typography>
            <List>
                {!reservations || reservations.length === 0 ? (
                    <ListItem><ListItemText primary="No tienes reservas." /></ListItem>
                ) : (
                    reservations.map(r => (
                        <ListItem key={r._id} secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteReservation(r._id)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText
                                primary={
                                    `${r.table?.name} (${new Date(r.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} a ${new Date(r.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` +
                                    (r.fullTable ? ' [Mesa completa]' : '')
                                }
                                secondary={
                                    <>
                                        <Typography variant="caption" color="textSecondary" component="span" sx={{ display: 'block' }}>
                                            Mesa completa: {r.fullTable ? 'Sí' : 'No'}
                                        </Typography>
                                    </>
                                }
                            />
                            <Box sx={{ mt: 0.5 }}>
                                Usuarios:&nbsp;
                                {r.users.map(u => <Chip key={u._id} label={u.name} size="small" sx={{ mr: 0.5 }} />)}
                                &nbsp;({r.users.length} {r.users.length === 1 ? 'persona' : 'personas'})
                            </Box>
                        </ListItem>
                    ))
                )}
            </List>
        </Box>
    )
}
