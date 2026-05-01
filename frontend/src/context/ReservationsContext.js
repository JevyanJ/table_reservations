import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useToken } from './TokenContext';

const ReservationsContext = createContext();

export function ReservationsProvider ({ children }) {
    const [reservations, setReservations] = useState([]);
    const { token, clearToken } = useToken();

    const refreshReservations = async () => {
        if (!token) {
            setReservations([]);
            return;
        }
        try {
            const res = await axios.get(process.env.REACT_APP_API_URL + '/reservations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservations(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
            }
            setReservations([]);
        }
    }

    const getReservationsForDate = (date, time) => {
        if (!reservations || reservations.length === 0) return [];
        if (time) {
            return reservations.filter(r => {
                const rDate = new Date(r.start);
                return rDate.toISOString().slice(0, 10) === date &&
                    rDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === time;
            });
        }
        return reservations.filter(r => new Date(r.start).toISOString().slice(0, 10) === date);
    }

    const getReservationsForIDs = (ids) => {
        if (!reservations || reservations.length === 0) return [];
        return reservations.filter(r => ids.includes(r._id));
    }

    // Crear reserva
    const handleCreateReservation = async (data) => {
        try {
            await axios.post(process.env.REACT_APP_API_URL + '/reservations', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            refreshReservations();
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

    // Cargar reservas propias
    useEffect(() => {
        refreshReservations();
        // eslint-disable-next-line
    }, [token]);

    return (
        <ReservationsContext.Provider value={{ refreshReservations, reservations, getReservationsForDate, getReservationsForIDs, handleCreateReservation, handleDeleteReservation }}>
            {children}
        </ReservationsContext.Provider>
    );
}

export function useReservations () {
    return useContext(ReservationsContext);
}
