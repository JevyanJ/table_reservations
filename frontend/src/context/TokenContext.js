import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isTokenExpired, removeToken } from '../utils/token';

const TokenContext = createContext();

export function TokenProvider ({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    // Sync token with localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // Remove token if expired
    useEffect(() => {
        if (token && isTokenExpired(token)) {
            removeToken();
            setToken(null);
        }
    }, [token]);

    const saveToken = useCallback((newToken) => {
        setToken(newToken);
    }, []);

    const clearToken = useCallback(() => {
        setToken(null);
        removeToken();
    }, []);

    return (
        <TokenContext.Provider value={{ token, setToken: saveToken, clearToken }}>
            {children}
        </TokenContext.Provider>
    );
}

export function useToken () {
    return useContext(TokenContext);
}
