import React, { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
    Select,
    MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTables } from '../context/TablesContext';
import { useUsers } from '../context/UsersContext';

export default function AdminPage () {

    const [tab, setTab] = useState(0);
    const { users, fetchUsers, updateUserRole } = useUsers();
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [roleEdit, setRoleEdit] = useState(null);
    const { tables, addTable, updateTable, deleteTable } = useTables();
    const [openDialog, setOpenDialog] = useState(false);
    const [editTable, setEditTable] = useState(null);
    const [form, setForm] = useState({ name: '', seats: '', description: '' });

    // Cargar usuarios cuando se selecciona la pestaña Usuarios
    useEffect(() => {
        if (tab === 1) {
            setLoadingUsers(true);
            fetchUsers().finally(() => setLoadingUsers(false));
        }
    }, [tab, fetchUsers]);

    const handleRoleChange = (userId, newRole) => {
        setRoleEdit({ userId, newRole });
    };

    const saveRole = async (userId) => {
        if (!roleEdit || roleEdit.userId !== userId) return;
        await updateUserRole(userId, roleEdit.newRole);
        setRoleEdit(null);
    };

    const handleOpenDialog = (table = null) => {
        setEditTable(table);
        setForm(table ? { name: table.name, seats: table.seats, description: table.description || '' } : { name: '', seats: '', description: '' });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.seats) return;
        if (editTable) {
            await updateTable(editTable._id, form);
        } else {
            await addTable(form);
        }
        setOpenDialog(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta mesa?')) return;
        await deleteTable(id);
    };

    return (
        <Box sx={{ mt: 2, maxWidth: 600 }}>
            <Typography variant="h4" gutterBottom>Panel de Administración</Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Mesas" />
                <Tab label="Usuarios" />
                <Tab label="Configuración" />
            </Tabs>
            {tab === 0 && (
                <Box>
                    <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpenDialog()}>Nueva mesa</Button>
                    <List>
                        {tables.length === 0 ? (
                            <ListItem><ListItemText primary="No hay mesas registradas." /></ListItem>
                        ) : (
                            tables.map(table => (
                                <ListItem key={table._id} secondaryAction={
                                    <>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(table)}><EditIcon /></IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(table._id)}><DeleteIcon /></IconButton>
                                    </>
                                }>
                                    <ListItemText
                                        primary={`${table.name} (${table.seats} plazas)`}
                                        secondary={table.description}
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                        <DialogTitle>{editTable ? 'Editar mesa' : 'Nueva mesa'}</DialogTitle>
                        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Nombre"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                required
                            />
                            <TextField
                                label="Plazas"
                                type="number"
                                value={form.seats}
                                onChange={e => setForm(f => ({ ...f, seats: e.target.value }))}
                                required
                            />
                            <TextField
                                label="Descripción"
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                            <Button onClick={handleSave} variant="contained" disabled={!form.name || !form.seats}>Guardar</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}
            {tab === 1 && (
                <Box>
                    <Typography variant="h6">Gestión de Usuarios</Typography>
                    {loadingUsers ? (
                        <Typography>Cargando usuarios...</Typography>
                    ) : (
                        <List>
                            {users.length === 0 ? (
                                <ListItem><ListItemText primary="No hay usuarios registrados." /></ListItem>
                            ) : (
                                users.map(user => (
                                    <ListItem key={user._id}>
                                        <ListItemText
                                            sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 1 }}
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant='h6' sx={{ fontWeight: 700, minHeight: '6vh', maxHeight: '6vh', display: 'flex', alignItems: 'center' }}>
                                                        {user.nickname || user.name}
                                                    </Typography>
                                                    <Box sx={{ ml: 4, display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                        {roleEdit && roleEdit.userId === user._id ? (
                                                            <>
                                                                <Select
                                                                    size="small"
                                                                    value={roleEdit.newRole}
                                                                    onChange={e => handleRoleChange(user._id, e.target.value)}
                                                                >
                                                                    <MenuItem value="user">user</MenuItem>
                                                                    <MenuItem value="admin">admin</MenuItem>
                                                                    <MenuItem value="guest">guest</MenuItem>
                                                                </Select>
                                                                <Tooltip title="Guardar">
                                                                    <IconButton size="small" sx={{ ml: 1 }} onClick={() => saveRole(user._id)}>
                                                                        <CheckIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Cancelar">
                                                                    <IconButton size="small" sx={{ ml: 1 }} onClick={() => setRoleEdit(null)}>
                                                                        <CloseIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <b>{user.role}</b>
                                                                <Box sx={{ flexGrow: 1 }} />
                                                                <Tooltip title="Editar rol">
                                                                    <IconButton size="small" sx={{ ml: 0 }} onClick={() => setRoleEdit({ userId: user._id, newRole: user.role })}>
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                                                    {user.name} ({user.email})
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    )}
                </Box>
            )}
            {tab === 2 && (
                <Box>
                    <Typography variant="h6">Configuración</Typography>
                    {/* Aquí irá la configuración */}
                </Box>
            )}
        </Box>
    );
}
