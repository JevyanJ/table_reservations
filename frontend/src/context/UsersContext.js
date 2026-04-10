import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useToken } from './TokenContext';

const UsersContext = createContext();

export function UsersProvider ({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, clearToken } = useToken();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            setLoading(false);
            setUsers([]);
            return;
        }
        try {
            const res = await axios.get(process.env.REACT_APP_API_URL + '/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            });
            setUsers(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
                setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                setUsers([]);
            } else {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [token, clearToken]);

    const updateUserRole = async (userId, newRole) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            setUsers([]);
            return;
        }
        try {
            await axios.put(
                process.env.REACT_APP_API_URL + `/users/${userId}/role`,
                { role: newRole },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true
                }
            );
            setUsers(users => users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
                setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                setUsers([]);
            } else {
                setError(err);
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <UsersContext.Provider value={{ users, loading, error, fetchUsers, updateUserRole }}>
            {children}
        </UsersContext.Provider>
    );
}

export function useUsers () {
    return useContext(UsersContext);
}
