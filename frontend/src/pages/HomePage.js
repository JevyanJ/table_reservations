import React from 'react';
import Button from '@mui/material/Button';
import { useMe } from '../context/MeContext';
import { useNavigate } from 'react-router-dom';

export default function HomePage () {
    const { me, loading } = useMe();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && !me) {
            navigate('/login');
        }
    }, [me, loading, navigate]);

    const handleGoogleLogin = () => {
        window.location.href = process.env.REACT_APP_API_URL + '/auth/google';
    };

    if (loading) return null;

    return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h1>Bienvenido a Reservas de Mesas</h1>
            <p>Reserva tu mesa fácilmente, gestiona tus reservas y administra mesas si eres administrador.</p>
            {!me && (
                <Button variant="contained" color="primary" onClick={handleGoogleLogin}>
                    Iniciar sesión con Google
                </Button>
            )}
        </div>
    );
}
