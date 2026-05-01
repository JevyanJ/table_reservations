
import { React, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import styles from './CalendarTable.module.scss';
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
    Typography
} from '@mui/material';
import axios from 'axios';


dayjs.extend(utc);
dayjs.extend(timezone);

function ReservationCell ({ value, onClick, selected }) {
    let cellClass = styles['reservation-cell'] + ' ';
    let text = '';
    if (value) {
        if (!value.available) {
            cellClass += styles.full;
            text = `Completa (${value.peopleCount} px)`;
        } else if (value.available && value.reservations.length > 0) {
            cellClass += styles.reserved;
            text = `Reservas (${value.peopleCount} px)`;
        } else {
            cellClass += styles.available;
        }
    }
    return (
        <TableCell
            align="center"
            className={cellClass + (selected ? ' ' + styles.selected : '')}
            onClick={onClick}
        >
            {text}
        </TableCell>
    );
}

// date: string YYYY-MM-DD
export default function CalendarTable ({ date, setIDs }) {
    // Obtener mesas del contexto
    const { tables, loading: loadingTables, findTableById } = useTables();
    const [slots, setSlots] = useState([]);
    const { token } = useToken();
    const [loading, setLoading] = useState(true);
    const [selectedCell, setSelectedCell] = useState(null);

    // Generar las franjas de media hora
    const timeSlots = Array.from({ length: 48 }, (_, i) => {
        const hour = String(Math.floor(i / 2)).padStart(2, '0');
        const min = i % 2 === 0 ? '00' : '30';

        // current: Date JS en zona local
        const local = dayjs.tz(date + `T${hour}:${min}`, 'Europe/Madrid');
        return {
            current: local.utc().toISOString().slice(11, 16), // HH:mm en UTC para comparar con backend
            local: local.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    });

    useEffect(() => {
        if (loadingTables || !tables || tables.length === 0) {
            return;
        }
        setLoading(true);
        const fetchSlots = async () => {
            try {
                const res = await axios.get(process.env.REACT_APP_API_URL + '/slots', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { date, tableIds: tables.map(t => t._id).join(',') }
                });
                if (res.data && res.data.slots) {
                    setSlots(res.data.slots);
                } else {
                    console.error('Respuesta inesperada de /slots:', res.data);
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
        <Box className={styles['calendar-table-container']}>
            <Typography variant="h5" component="h2" gutterBottom className={styles['calendar-table-title']}>
                Disponibilidad de mesas
            </Typography>

            {loading || loadingTables ? (
                <Box className={styles['calendar-table-loading']}>Cargando disponibilidad...</Box>
            ) : (
                <Box>
                    <TableContainer component={Paper} className={styles['calendar-table-table-container']}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell className={styles['calendar-table-sticky-header']}>
                                        Mesa
                                    </TableCell>
                                    {timeSlots.map(slot => (
                                        <TableCell
                                            key={slot.local}
                                            align="center"
                                            className={styles['calendar-table-cell']}
                                        >
                                            {slot.local}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(slots).map(([key, value]) => {
                                    const tableId = key;
                                    const tableInfo = findTableById(tableId);
                                    if (!tableInfo) return null;
                                    return (
                                        <TableRow key={tableId}>
                                            <TableCell className={styles['calendar-table-sticky-cell']}>{tableInfo.name}</TableCell>
                                            {timeSlots.map(slot => {
                                                return (
                                                    <ReservationCell
                                                        key={`${tableId}-${slot.current}`}
                                                        value={value[slot.current]}
                                                        selected={selectedCell === `${tableId}-${slot.current}`}
                                                        onClick={() => {
                                                            if (selectedCell === `${tableId}-${slot.current}`) {
                                                                setIDs([]);
                                                                setSelectedCell(null);
                                                            } else {
                                                                if (value[slot.current] && value[slot.current].reservations) {
                                                                    setIDs(() => value[slot.current].reservations.map(r => r.id));
                                                                    console.log('IDS: ', value[slot.current].reservations.map(r => r.id));
                                                                }
                                                                setSelectedCell(`${tableId}-${slot.current}`);
                                                            }
                                                        }}
                                                    />
                                                )
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
