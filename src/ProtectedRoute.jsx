// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // You can render a loading spinner here
        return <div className="min-h-screen flex items-center justify-center text-xl text-foreground">Loading...</div>;
    }

    if (!user) {
        // User not logged in, redirect to auth page
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;