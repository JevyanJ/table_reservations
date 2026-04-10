import React, { useEffect } from 'react';
import { useToken } from '../context/TokenContext';
import Button from '@mui/material/Button';
import { useMe } from '../context/MeContext';
import { useNavigate } from 'react-router-dom';


export default function LoginPage () {
    const { me, loading } = useMe();
    const navigate = useNavigate();
    const [tokenError, setTokenError] = React.useState(null);
    const { setToken } = useToken();

    useEffect(() => {
        // Guardar token si viene en la URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            try {
                // Validar formato básico del token
                if (!/^([A-Za-z0-9-_]+\.){2}[A-Za-z0-9-_]+$/.test(token)) {
                    setTokenError('Token inválido.');
                } else {
                    setToken(token);
                    // Limpiar el token de la URL
                    window.history.replaceState({}, '', window.location.pathname);
                }
            } catch {
                setTokenError('Error al guardar el token.');
            }
        }
        if (!loading && me) {
            navigate('/reservas');
        }
    }, [me, loading, navigate, setToken]);

    const handleGoogleLogin = () => {
        // Define callback URL (where Google should redirect after login)
        const callbackUrl = process.env.REACT_APP_LOGIN_REDIRECT_URL;
        window.location.href = `${process.env.REACT_APP_API_URL}/auth/google?state=${encodeURIComponent(callbackUrl)}`;
    };

    return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h2>Iniciar sesión</h2>
            <Button variant="contained" color="primary" onClick={handleGoogleLogin}>
                Iniciar sesión con Google
            </Button>
            {tokenError && (
                <div style={{ color: 'red', marginTop: 16 }}>{tokenError}</div>
            )}
        </div>
    );
}
