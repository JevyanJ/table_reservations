import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToken } from './TokenContext';

const TablesContext = createContext();

export function TablesProvider ({ children }) {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, clearToken } = useToken();

    const fetchTables = useCallback(async () => {
        setLoading(true);
        if (!token) {
            setTables([]);
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get(process.env.REACT_APP_API_URL + '/tables', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTables(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
            }
            setTables([]);
        } finally {
            setLoading(false);
        }
    }, [token, clearToken]);

    const addTable = async (tableData) => {
        if (!token) {
            setTables([]);
            return;
        }
        try {
            await axios.post(process.env.REACT_APP_API_URL + '/tables', tableData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTables();
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
            }
            setTables([]);
        }
    }

    const updateTable = async (tableId, tableData) => {
        if (!token) {
            setTables([]);
            return;
        }
        try {
            await axios.put(process.env.REACT_APP_API_URL + '/tables/' + tableId, tableData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTables();
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
            }
            setTables([]);
        }
    }

    const deleteTable = async (tableId) => {
        if (!token) {
            setTables([]);
            return;
        }
        try {
            await axios.delete(process.env.REACT_APP_API_URL + '/tables/' + tableId, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTables();
        } catch (err) {
            if (err.response && err.response.status === 401) {
                clearToken();
            }
            setTables([]);
        }
    }

    const findTableById = (id) => {
        return tables.find(t => t._id === id);
    }

    useEffect(() => {
        fetchTables();
        // eslint-disable-next-line
    }, [fetchTables, token]);

    return (
        <TablesContext.Provider value={{ tables, loading, refreshTables: fetchTables, addTable, updateTable, deleteTable, findTableById }}>
            {children}
        </TablesContext.Provider>
    );
}

export function useTables () {
    return useContext(TablesContext);
}
