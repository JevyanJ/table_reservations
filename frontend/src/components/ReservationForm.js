import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TextField,
    Box
} from '@mui/material';
import { useTables } from '../context/TablesContext';
import { useMe } from '../context/MeContext';
import { useUsers } from '../context/UsersContext';

export default function ReservationForm ({
    date
}) {

    const { tables } = useTables();
    const { me, refreshReservations } = useMe();
    const { users } = useUsers();
    const [availableUsers, setAvailableUsers] = useState(users.filter(u => u._id !== me._id)); // Excluir al usuario actual de la lista
    const [selectedTable, setSelectedTable] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [form, setForm] = useState({
        start: '',
        end: '',
        users: me ? [me] : [],
        numPlayers: me ? 1 : 0,
        fullTable: false
    });


    const resetForm = () => {
        setSelectedTable('');
        setForm({
            start: '',
            end: '',
            users: me ? [me] : [],
            numPlayers: me ? 1 : 0,
            fullTable: false
        });
    };

    useEffect(() => {
        if (!date) {
            setDisabled(true);
            resetForm();
        } else {
            setDisabled(false);
        }
    }, [date]);

    useEffect(() => {
        if (form.users.length === 0) {
            setAvailableUsers(users);
        }
        // Update numPlayers to match users length if needed
        setForm(f =>
            f.numPlayers !== f.users.length
                ? { ...f, numPlayers: f.users.length }
                : f
        );
    }, [form.users, users]);


    const createReservation = async () => {
        // Validar campos
        if (!selectedTable || !form.start || !form.end || form.end <= form.start) return;

        try {
            await fetch(process.env.REACT_APP_API_URL + '/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    tableId: selectedTable,
                    start: new Date(date + 'T' + form.start),
                    end: new Date(date + 'T' + form.end),
                    userIds: form.users.map(u => u._id),
                    fullTable: form.fullTable
                })
            });
            resetForm();
            refreshReservations(); // Refresca reservas del usuario
        } catch (err) {
            alert('Error al crear la reserva. Inténtalo de nuevo.');
        }
    };

    return (
        <Box
            sx={{ maxWidth: 400, margin: 'auto', mt: 5, p: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', gap: 2 }}
        >
            <Box sx={{ mb: 2, fontWeight: 'bold', fontSize: 20 }}>Nueva reserva</Box>
            <FormControl fullWidth>
                <InputLabel id="table-label">Mesa</InputLabel>
                <Select
                    labelId="table-label"
                    value={selectedTable}
                    label="Mesa"
                    disabled={disabled}
                    onChange={e => setSelectedTable(e.target.value)}
                >
                    {tables.map(table => (
                        <MenuItem key={table._id} value={table._id}>{table.name} ({table.seats} plazas)</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel id="start-time-label">Hora inicio</InputLabel>
                <Select
                    labelId="start-time-label"
                    value={form.start}
                    label="Hora inicio"
                    disabled={disabled}
                    onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                >
                    {Array.from({ length: 48 }, (_, i) => {
                        const hour = String(Math.floor(i / 2)).padStart(2, '0');
                        const min = i % 2 === 0 ? '00' : '30';
                        const value = `${hour}:${min}`;
                        return <MenuItem key={value} value={value}>{value}</MenuItem>;
                    })}
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel id="end-time-label">Hora fin</InputLabel>
                <Select
                    labelId="end-time-label"
                    value={form.end}
                    label="Hora fin"
                    disabled={disabled}
                    onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                >
                    {Array.from({ length: 48 }, (_, i) => {
                        const hour = String(Math.floor(i / 2)).padStart(2, '0');
                        const min = i % 2 === 0 ? '00' : '30';
                        const value = `${hour}:${min}`;
                        if (form.start && value <= form.start) return null;
                        return <MenuItem key={value} value={value}>{value}</MenuItem>;
                    })}
                </Select>
            </FormControl>
            <Autocomplete
                multiple
                options={availableUsers}
                getOptionLabel={option => `${option.name || ''} (${option.nickname || ''}) <${option.email}>`}
                filterSelectedOptions
                value={form.users}
                onChange={(e, value) => setForm(f => ({ ...f, users: value }))}
                renderValue={(selected, getTagProps) =>
                    selected.map((option, index) => {
                        const tagProps = getTagProps({ index });
                        const { key, ...restTagProps } = tagProps;
                        return (
                            <Box key={option._id} sx={{ mr: 0.5, mb: 0.5, display: 'inline-block' }}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    onClick={() => {
                                        const newUsers = form.users.filter(u => u._id !== option._id);
                                        setForm(f => ({ ...f, users: newUsers }));
                                    }}
                                    {...restTagProps}
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', px: 1 }}
                                >
                                    {option.nickname || option.name || option.email}
                                </Button>
                            </Box>
                        );
                    })}
                renderInput={params => (
                    <TextField
                        {...params}
                        label="Jugadores"
                        placeholder={form.users.length === 0 ? "Selecciona jugadores" : ""}
                        disabled={disabled}
                    />
                )}
                sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        type="number"
                        label="Número de jugadores"
                        value={form.numPlayers}
                        slotProps={{ htmlInput: { min: form.users.length } }}
                        onChange={e => setForm(f => ({ ...f, numPlayers: Math.max(Number(e.target.value), f.users.length) }))}
                        sx={{ width: 80 }}
                    />
                </Box>
                <Box sx={{ color: form.numPlayers < form.users.length ? 'error.main' : 'text.secondary', fontSize: 13, mt: 0.5 }}>
                    Mínimo: {form.users.length} jugadores seleccionados
                </Box>
            </FormControl>
            <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <input
                        type="checkbox"
                        id="full-table-checkbox"
                        checked={form.fullTable}
                        defaultChecked={false}
                        disabled={disabled}
                        onChange={e => setForm(f => ({ ...f, fullTable: e.target.checked }))}
                        style={{ marginRight: 8 }}
                    />
                    <label htmlFor="full-table-checkbox">Reservar mesa completa</label>
                </Box>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                    onClick={resetForm}
                    disabled={disabled}
                >
                    Resetear
                </Button>
                <Button
                    onClick={createReservation}
                    variant="contained"
                    disabled={!form.start || !form.end || (form.start && form.end && form.end <= form.start) || disabled}
                >
                    Reservar
                </Button>
            </Box>
        </Box>
    );
}
