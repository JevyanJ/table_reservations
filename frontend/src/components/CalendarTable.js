
import { React, useState, useEffect } from 'react';
import { useToken } from '../context/TokenContext';
import { useTables } from '../context/TablesContext';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button
} from '@mui/material';
import axios from 'axios';

function ReservationCell ({ value }) {
    let color = '#ccffcc'; // verde
    let text = '';
    if (!value.available) {
        color = '#ff5252'; // rojo
        text = `Completa (${value.peopleCount} px)`; // Mostrar número de personas si no está disponible
    }
    if (value.available && value.reservations.length > 0) {
        color = '#fff59d'; // amarillo
        text = `Reservas (${value.peopleCount} px)`;
    }
    return (
        <TableCell
            align="center"
            sx={{ bgcolor: color }}
        >
            {text}
        </TableCell>
    );
}

// date: string YYYY-MM-DD
export default function CalendarTable ({ date }) {
    // Obtener mesas del contexto
    const { tables, loading: loadingTables, findTableById } = useTables();
    const [slots, setSlots] = useState([]);
    const { token } = useToken();
    const [loading, setLoading] = useState(true);

    // Generar las franjas de media hora
    const timeSlots = Array.from({ length: 48 }, (_, i) => {
        const hour = String(Math.floor(i / 2)).padStart(2, '0');
        const min = i % 2 === 0 ? '00' : '30';
        return `${hour}:${min}`;
    });

    // Columnas ocultas hasta las 10:00 (índice 0 a 19)
    const HIDDEN_COLS = 20; // 00:00 a 09:30
    const [showEarly, setShowEarly] = useState(false);

    useEffect(() => {
        if (loadingTables || !tables || tables.length === 0) {
            return;
        }
        setLoading(true);
        const fetchSlots = async () => {
            try {
                const res = await axios.get(process.env.REACT_APP_API_URL + '/reservations/slots', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { date, tableIds: tables.map(t => t._id).join(',') }
                });
                if (res.data && res.data.reservations) {
                    setSlots(res.data.reservations);
                } else {
                    console.error('Respuesta inesperada de /reservations/slots:', res.data);
                    setSlots([]);
                }
            } catch (e) {
                console.error('Error en fetchSlots', e);
                setSlots([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSlots();
    }, [date, token, loadingTables, tables]);

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                Disponibilidad de mesas
            </Typography>

            {loading || loadingTables ? (
                <Box sx={{ my: 3, textAlign: 'center' }}>Cargando disponibilidad...</Box>
            ) : (
                <Box>
                    <TableContainer component={Paper} sx={{ my: 3, borderRadius: 2, boxShadow: 5 }}>
                        <Table size="small" sx={{ m: 0, mt: 1, mr: 0, ml: 0, width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: 120, fontWeight: 700, position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }}>
                                        Mesa
                                    </TableCell>
                                    {/* Columnas hasta 09:30 */}
                                    {!showEarly && null}
                                    {(!showEarly ? timeSlots.slice(HIDDEN_COLS) : timeSlots).map((slot, idx) => {
                                        if (!showEarly && idx === 0) {
                                            return [
                                                <TableCell key="show-early-btn" align="center" sx={{ p: 0, border: 0, bgcolor: 'transparent', width: 0 }} colSpan={1}>
                                                    <Button
                                                        size="small"
                                                        style={{ padding: 0, minWidth: 0 }}
                                                        onClick={() => setShowEarly(true)}
                                                    >
                                                        +
                                                    </Button>
                                                </TableCell>,
                                                <TableCell key={slot} align="center" sx={{ fontWeight: 700 }}>{slot}</TableCell>
                                            ];
                                        }
                                        if (showEarly && slot === '10:00') {
                                            return [
                                                <TableCell key="hide-early-btn" align="center" sx={{ p: 0, border: 0, bgcolor: 'transparent', width: 0 }} colSpan={1}>
                                                    <Button
                                                        color="secondary"
                                                        size="small"
                                                        style={{ padding: 0, minWidth: 0 }}
                                                        onClick={() => setShowEarly(false)}
                                                    >
                                                        -
                                                    </Button>
                                                </TableCell>,
                                                <TableCell key={slot} align="center" sx={{ fontWeight: 700 }}>{slot}</TableCell>
                                            ];
                                        }
                                        return <TableCell key={slot} align="center" sx={{ fontWeight: 700 }}>{slot}</TableCell>;
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(slots).map(([key, value]) => {
                                    const tableInfo = findTableById(key);
                                    if (!tableInfo) return null;
                                    return (
                                        <TableRow key={key}>
                                            <TableCell sx={{ minWidth: 120, position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' }}>{tableInfo.name}</TableCell>
                                            {/* Celdas de reserva, alineadas con las columnas visibles y el botón */}
                                            {(!showEarly ? timeSlots.slice(HIDDEN_COLS) : timeSlots).map((slot, idx) => {
                                                if (!showEarly && idx === 0) {
                                                    return [
                                                        <TableCell key="show-early-btn-cell" align="center" sx={{ p: 0, border: 0, bgcolor: 'transparent', width: 0 }} colSpan={1}></TableCell>,
                                                        <ReservationCell key={slot} value={value[slot]} />
                                                    ];
                                                }
                                                if (showEarly && slot === '10:00') {
                                                    return [
                                                        <TableCell key="hide-early-btn-cell" align="center" sx={{ p: 0, border: 0, bgcolor: 'transparent', width: 0 }} colSpan={1}></TableCell>,
                                                        <ReservationCell key={slot} value={value[slot]} />
                                                    ];
                                                }
                                                return <ReservationCell key={slot} value={value[slot]} />;
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
}
