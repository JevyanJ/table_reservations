import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useToken } from './TokenContext';

const MeContext = createContext();

export function MeProvider ({ children }) {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myReservations, setMyReservations] = useState([]);
    const [creating, setCreating] = useState(false);
    const { token, clearToken } = useToken();

    const refreshUser = async () => {
        setLoading(true);
        if (!token) {
            setMe(null);
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get(process.env.REACT_APP_API_URL + '/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMe(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
            }
            setMe(null);
        } finally {
            setLoading(false);
        }
    };

    const isUser = () => {
        return me && (me.role === 'user' || me.role === 'admin');
    }

    const isAdmin = () => {
        return me && me.role === 'admin';
    }

    const refreshReservations = async () => {
        if (!token) {
            setMyReservations([]);
            return;
        }
        try {
            const res = await axios.get(process.env.REACT_APP_API_URL + '/reservations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyReservations(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
            }
            setMyReservations([]);
        }
    }

    const logout = async () => {
        await fetch(process.env.REACT_APP_API_URL + '/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setMe(null);
        clearToken();
    };

    const getReservationsForDate = (date) => {
        if (!myReservations || myReservations.length === 0) return [];
        return myReservations.filter(r => new Date(r.start).toISOString().slice(0, 10) === date);
    }

    useEffect(() => {
        refreshUser();
        // eslint-disable-next-line
    }, [token]);

    // Cargar reservas propias
    useEffect(() => {
        refreshReservations();
        // eslint-disable-next-line
    }, [creating, token]);

    // Crear reserva
    const handleCreateReservation = async (data) => {
        try {
            await axios.post(process.env.REACT_APP_API_URL + '/reservations', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreating(c => !c); // Refresca
        } catch (err) {
            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Error al crear la reserva'
            );
        }
    };

    // Cancelar reserva
    const handleDeleteReservation = async (id) => {
        if (!window.confirm('¿Seguro que quieres cancelar esta reserva?')) return;
        await axios.delete(process.env.REACT_APP_API_URL + '/reservations/' + id, {
            headers: { Authorization: `Bearer ${token}` }
        });
        refreshReservations(); // Refresca
    };

    return (
        <MeContext.Provider value={{ me, loading, logout, refreshReservations, myReservations, getReservationsForDate, handleCreateReservation, handleDeleteReservation, refreshUser, isUser, isAdmin }}>
            {children}
        </MeContext.Provider>
    );
}

export function useMe () {
    return useContext(MeContext);
}
