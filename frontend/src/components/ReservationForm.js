import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs from 'dayjs';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TextField,
    Box
} from '@mui/material';
import styles from './ReservationForm.module.scss';
import { useTables } from '../context/TablesContext';
import { useMe } from '../context/MeContext';
import { useUsers } from '../context/UsersContext';

export default function ReservationForm ({
    date,
    data,
    onSave,
    onUpdate
}) {

    const { tables } = useTables();
    const { me } = useMe();
    const { users } = useUsers();
    const [availableUsers, setAvailableUsers] = useState(users.filter(u => u._id !== me._id)); // Excluir al usuario actual de la lista
    const [selectedTable, setSelectedTable] = useState('');
    const [form, setForm] = useState({
        start: '',
        end: '',
        users: me ? [me] : [],
        numPlayers: me ? 1 : 0,
        fullTable: false
    });

    useEffect(() => {
        if (data) {
            console.log('Cargando datos en el formulario:', data);
            setForm(data);
            setSelectedTable(data.tableId);
        }
    }, [data]);

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

    const clickAcept = () => {
        if (!selectedTable || !form.start || !form.end || form.end <= form.start) {
            alert('Por favor, completa todos los campos obligatorios y asegúrate de que la hora de fin sea posterior a la de inicio.');
            return;
        }
        if (data) {
            onUpdate({
                ...data,
                title: form.title,
                description: form.description,
                tableId: selectedTable,
                start: dayjs(date + 'T' + form.start).toDate(),
                end: dayjs(date + 'T' + form.end).toDate(),
                userIds: form.users.map(u => u._id),
                numPlayers: form.numPlayers,
                fullTable: form.fullTable
            });
        } else {

            onSave({
                title: form.title,
                description: form.description,
                tableId: selectedTable,
                start: dayjs(date + 'T' + form.start).toDate(),
                end: dayjs(date + 'T' + form.end).toDate(),
                userIds: form.users.map(u => u._id),
                fullTable: form.fullTable
            });
        }
    };


    return (
        <Box
            className={styles['reservation-form']}
        >
            <Box sx={{ mb: 2, fontWeight: 'bold', fontSize: 20 }}>
                {data ? `Editar reserva (${dayjs(date).format('DD/MM/YYYY')})` : `Nueva reserva (${dayjs(date).format('DD/MM/YYYY')})`}
            </Box>
            {/* Título */}
            <FormControl fullWidth>
                <InputLabel id="title-label" shrink={true} className={styles['input-label']}>Título</InputLabel>
                <TextField
                    fullWidth={true}
                    value={form?.title || ''}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
            </FormControl>
            {/* Descripción */}
            <FormControl fullWidth>
                <InputLabel id="description-label" shrink={true} className={styles['input-label']}>Descripción</InputLabel>
                <TextField
                    fullWidth={true}
                    value={form?.description || ''}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
            </FormControl>
            {/* Mesa */}
            <FormControl fullWidth>
                <InputLabel id="table-label" shrink={true} className={styles['input-label']}>Mesa *</InputLabel>
                <Select
                    labelId="table-label"
                    value={selectedTable}
                    label="Mesa"
                    variant="outlined"
                    margin="dense"
                    fullWidth={true}
                    onChange={e => setSelectedTable(e.target.value)}
                >
                    {tables.map(table => (
                        <MenuItem key={table._id} value={table._id}>{table.name} ({table.seats} plazas)</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {/* Hora inicio */}
            <FormControl fullWidth>
                <InputLabel id="start-time-label" shrink={true} className={styles['input-label']}>Hora inicio *</InputLabel>
                <Select
                    labelId="start-time-label"
                    value={form.start}
                    label="Hora inicio"
                    variant="outlined"
                    margin="dense"
                    fullWidth={true}
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
            {/* Hora fin */}
            <FormControl fullWidth>
                <InputLabel id="end-time-label" shrink={true} className={styles['input-label']}>Hora fin *</InputLabel>
                <Select
                    labelId="end-time-label"
                    value={form.end}
                    label="Hora fin"
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
                        onChange={e => setForm(f => ({ ...f, fullTable: e.target.checked }))}
                        style={{ marginRight: 8 }}
                    />
                    <label htmlFor="full-table-checkbox">Reservar mesa completa</label>
                </Box>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                    onClick={resetForm}
                >
                    Resetear
                </Button>
                <Button
                    onClick={clickAcept}
                    variant="contained"
                    disabled={!form.start || !form.end || (form.start && form.end && form.end <= form.start)}
                >
                    {data ? "Guardar" : "Reservar"}
                </Button>
            </Box>
        </Box>
    );
}
