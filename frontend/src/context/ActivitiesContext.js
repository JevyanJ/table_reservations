import { useToken } from './TokenContext';
import React, { createContext, useContext, useState, useEffect } from 'react';

export const ActivitiesContext = createContext();

export const ActivitiesProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, clearToken } = useToken();

    const fetchActivities = async () => {
        setLoading(true);
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            setActivities([]);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(process.env.REACT_APP_API_URL + '/activities', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                if (res.status === 401) {
                    clearToken();
                    setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                    setActivities([]);
                    setLoading(false);
                    return;
                }
                throw new Error('Error al obtener actividades');
            }
            const data = await res.json();
            setActivities(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const editActivity = async (id, updatedData) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            setActivities([]);
            return;
        }
        try {
            const res = await fetch(process.env.REACT_APP_API_URL + '/activities/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            if (!res.ok) {
                if (res.status === 401) {
                    clearToken();
                    setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                    setActivities([]);
                    return;
                }
                throw new Error('Error al editar actividad');
            }
            fetchActivities();
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteActivity = async (id) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            setActivities([]);
            return;
        }
        if (window.confirm('¿Seguro que quieres eliminar esta actividad?')) {
            const res = await fetch(process.env.REACT_APP_API_URL + '/activities/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok && res.status === 401) {
                clearToken();
                setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                setActivities([]);
                return;
            }
            fetchActivities();
        }
    };

    useEffect(() => {
        fetchActivities();
        // eslint-disable-next-line
    }, [token]);

    return (
        <ActivitiesContext.Provider value={{ activities, loading, error, refreshActivities: fetchActivities, deleteActivity, editActivity }}>
            {children}
        </ActivitiesContext.Provider>
    );
};


export function useActivities () {
    return useContext(ActivitiesContext);
}
