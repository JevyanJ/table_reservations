import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useToken } from './TokenContext';

const MeContext = createContext();

export function MeProvider ({ children }) {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
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

    const logout = async () => {
        await fetch(process.env.REACT_APP_API_URL + '/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setMe(null);
        clearToken();
    };


    useEffect(() => {
        refreshUser();
        // eslint-disable-next-line
    }, [token]);

    return (
        <MeContext.Provider value={{ me, loading, logout, refreshUser, isUser, isAdmin }}>
            {children}
        </MeContext.Provider>
    );
}

export function useMe () {
    return useContext(MeContext);
}
