import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    TextField,
    InputLabel,
    Select,
    Alert,
    CircularProgress,
    MenuItem,
    Card,
    CardContent,
    Typography
} from '@mui/material';
import { useMe } from '../context/MeContext';
import { useActivities } from '../context/ActivitiesContext';

const TAGS = [
    { label: 'Juegos de mesa', value: 'juegos de mesa' },
    { label: 'Eventos', value: 'eventos' },
    { label: 'Pintura', value: 'pintura' },
    { label: 'Wargame', value: 'wargame' }
];

const ActivitiesPage = () => {
    const { activities, loading, refreshActivities, deleteActivity, editActivity } = useActivities();
    const { me } = useMe();
    const [selectedTag, setSelectedTag] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', type: TAGS[0].value });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [editId, setEditId] = useState(null);

    const filteredActivities = selectedTag
        ? activities.filter(activity => activity.type === selectedTag)
        : activities;

    const handleFormChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleFormSubmit = async e => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        try {
            if (editId) {
                await editActivity(editId, form);
            } else {
                const res = await fetch(process.env.REACT_APP_API_URL + '/activities', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(form)
                });
                if (!res.ok) throw new Error('Error al crear actividad');
                refreshActivities();
            }
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', description: '', type: TAGS[0].value });
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Box sx={{ padding: '2rem' }}>
            <h1>Actividades</h1>
            <Box sx={{ marginBottom: '1rem' }}>
                {!showForm && (
                    <Button
                        variant="contained"
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditId(null);
                            setForm({ name: '', description: '', type: TAGS[0].value });
                        }}
                    >
                        Añadir actividad
                    </Button>
                )}
            </Box>
            {showForm && (
                <Box sx={{ m: '1rem' }}>
                    <Box component="form" onSubmit={handleFormSubmit} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2, maxWidth: 400 }}>
                        <TextField
                            label="Nombre"
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            required
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Descripción"
                            name="description"
                            value={form.description}
                            onChange={handleFormChange}
                            required
                            multiline
                            rows={3}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="type-label">Tipo</InputLabel>
                            <Select
                                labelId="type-label"
                                name="type"
                                value={form.type}
                                label="Tipo"
                                onChange={handleFormChange}
                                required
                            >
                                {TAGS.map(tag => (
                                    <MenuItem key={tag.value} value={tag.value}>{tag.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {formError && <Alert severity="error" sx={{ mb: 2 }}>Error: {formError}</Alert>}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button type="submit" variant="contained" color="success" disabled={formLoading}>
                                {formLoading ? <CircularProgress size={24} /> : (editId ? 'Actualizar' : 'Guardar')}
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => {
                                setEditId(null);
                                setShowForm(false);
                                setForm({ name: '', description: '', type: TAGS[0].value });
                            }}>
                                Cancelar
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
            <Box sx={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                {TAGS.map(tag => (
                    <Button
                        key={tag.value}
                        variant={selectedTag === tag.value ? 'contained' : 'outlined'}
                        onClick={() => setSelectedTag(selectedTag === tag.value ? null : tag.value)}
                    >
                        {tag.label}
                    </Button>
                ))}
            </Box>
            {loading && <p>Cargando actividades...</p>}
            {filteredActivities.length === 0 && !loading && <p>No hay actividades.</p>}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {filteredActivities.map(activity => (
                    <Card key={activity._id} sx={{ width: 220, boxShadow: 2, borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" component="div" gutterBottom>
                                {activity.name}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {TAGS.find(tag => tag.value === activity.type)?.label || activity.type}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {activity.description}
                            </Typography>
                            {me && me.role === 'admin' && (
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    <Button size="small" variant="outlined" color="primary" onClick={() => {
                                        setEditId(activity._id);
                                        setShowForm(true);
                                        setForm({ name: activity.name, description: activity.description, type: activity.type });
                                    }}>
                                        Editar
                                    </Button>
                                    <Button size="small" variant="outlined" color="error" disabled={showForm} onClick={() => deleteActivity(activity._id)}>
                                        Eliminar
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default ActivitiesPage;
