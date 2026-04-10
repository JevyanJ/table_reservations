import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMe } from '../context/MeContext';

export default function ProtectedRoute ({ children, adminOnly = false, userOnly = false }) {
    const { me, loading } = useMe();
    if (loading) return null;
    if (!me) return <Navigate to="/login" />;
    if (adminOnly && me.role !== 'admin') return <Navigate to="/" />;
    if (userOnly && me.role === 'guest') return <Navigate to="/" />;
    return children;
}
