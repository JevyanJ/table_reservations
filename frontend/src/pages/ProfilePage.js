import React, { useState } from 'react';
import { useMe } from '../context/MeContext';
import { Box, Typography, TextField, Chip, Button } from '@mui/material';

export default function ProfilePage () {
    const { me, refreshUser } = useMe();

    const [nickname, setNickname] = useState(me.nickname || me.name);
    const [saving, setSaving] = useState(false);

    const handleSaveNickname = async () => {
        setSaving(true);
        try {
            await fetch(process.env.REACT_APP_API_URL + `/users/${me._id}/nickname`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ nickname })
            }).catch(err => {
                throw err;
            });
            alert('Nickname guardado: ' + nickname);
            refreshUser(); // Refresca datos del usuario
        } catch (err) {
            alert('Error al guardar el nickname');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ mt: 4, pl: 5, pr: 5, flex: 1, justifyContent: 'center', alignItems: 'center', minWidth: '50vw', maxWidth: '80vw', borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>Mi Perfil</Typography>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, pl: 1 }}>{me.name || ''}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, pl: 1 }}>{me.email || ''}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                <TextField
                    label="Nickname"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    margin="normal"
                />
                <Box sx={{ mt: 1 }}>
                    <Button
                        onClick={handleSaveNickname}
                        disabled={saving || nickname === (me.nickname || me.name)}
                        variant="contained"
                    >
                        {saving ? 'Guardando...' : 'Guardar nickname'}
                    </Button>
                </Box>
            </Box>
            <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Rol</Typography>
                <Chip label={me.role || ''} color="primary" sx={{ mt: 1 }} />
            </Box>
            {/* Aquí puedes añadir más campos o lógica para editar el perfil */}
        </Box>
    );
}
