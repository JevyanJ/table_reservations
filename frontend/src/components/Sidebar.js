
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMe } from '../context/MeContext';
import Button from '@mui/material/Button';
import './Sidebar.css';

const Sidebar = () => {
    const { me, logout, isUser, isAdmin } = useMe();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                {/* Reemplaza con tu logo real si tienes uno */}
                <img src="/logo192.png" alt="Logo" />
            </div>
            <div className="sidebar-user">
                <span>{me ? me.nickname ? me.nickname : me.name : ''}</span>
            </div>
            <nav className="sidebar-nav">
                <Link
                    to="/"
                    className={!isUser() ? 'sidebar-link-disabled' : ''}
                    tabIndex={!isUser() ? -1 : 0}
                    aria-disabled={!isUser()}
                    onClick={e => { if (!isUser()) e.preventDefault(); }}
                >
                    Inicio
                </Link>
                <Link
                    to="/reservas"
                    className={!isUser() ? 'sidebar-link-disabled' : ''}
                    tabIndex={!isUser() ? -1 : 0}
                    aria-disabled={!isUser()}
                    onClick={e => { if (!isUser()) e.preventDefault(); }}
                >
                    Reservas de mesa
                </Link>

                <Link
                    to="/activities"
                    className={!isUser() ? 'sidebar-link-disabled' : ''}
                    tabIndex={!isUser() ? -1 : 0}
                    aria-disabled={!isUser()}
                    onClick={e => { if (!isUser()) e.preventDefault(); }}
                >
                    Actividades
                </Link>
                <Link
                    to="/perfil"
                    className={!isUser() ? 'sidebar-link-disabled' : ''}
                    tabIndex={!isUser() ? -1 : 0}
                    aria-disabled={!isUser()}
                    onClick={e => { if (!isUser()) e.preventDefault(); }}
                >
                    Perfil
                </Link>
                {isAdmin() && (
                    <Link
                        to="/admin"
                        className={!isAdmin() ? 'sidebar-link-disabled' : ''}
                        tabIndex={!isAdmin() ? -1 : 0}
                        aria-disabled={!isAdmin()}
                        onClick={e => { if (!isAdmin()) e.preventDefault(); }}
                    >
                        Admin
                    </Link>
                )}
            </nav>
            {me && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Button variant="outlined" color="secondary" onClick={handleLogout}>
                        Cerrar sesión
                    </Button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
