import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useToken } from './TokenContext';
import { useTables } from './TablesContext';


const SlotsContext = createContext();

export function SlotsProvider ({ children }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const { tables } = useTables();
    const [slots, setSlots] = useState([]);
    const { token, clearToken } = useToken();

    const refreshSlots = async () => {
        try {
            const res = await axios.get(process.env.REACT_APP_API_URL + '/slots', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    date,
                    tableIds: tables.map(t => t._id).join(','),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            });
            if (res.data && res.data.slots) {
                setSlots(res.data.slots);
            } else {
                console.error('Respuesta inesperada de /slots:', res.data);
                setSlots([]);
            }
        } catch (e) {
            console.error('Error en fetchSlots', e);
            setSlots([]);
        }
    }

    const updateDate = (newDate) => {
        setDate(newDate);
    }

    useEffect(() => {
        refreshSlots();
        // eslint-disable-next-line
    }, [token, tables, date]);

    return (
        <SlotsContext.Provider value={{ slots, refreshSlots, updateDate, date }}>
            {children}
        </SlotsContext.Provider>
    );
}

export function useSlots () {
    return useContext(SlotsContext);
}
