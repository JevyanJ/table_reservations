import { React, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useReservations } from '../context/ReservationsContext';
import { useMe } from '../context/MeContext';

export default function ReservationList ({ ids }) {
    const { handleDeleteReservation, getReservationsForIDs } = useReservations();
    const { me } = useMe();
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
        <Box mt={4}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                Reservas
            </Typography>
            <List>
                {!reservations || reservations.length === 0 ? (
                    <ListItem><ListItemText primary="No hay reservas este día." /></ListItem>
                ) : (
                    reservations.map(r => (

                        <ListItem key={r._id}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                            secondaryAction={r.createdBy === me?._id ? (
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteReservation(r._id)}>
                                    <DeleteIcon />
                                </IconButton>
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
