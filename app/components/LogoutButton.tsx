"use client"
import React from 'react';

const LogoutButton = () => {
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('userId');
            window.location.href = '/';
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="fixed bottom-8 right-8 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg flex items-center space-x-2 transition-colors duration-200"
        >
            <span className="text-xl">🚪</span>
            <span>Déconnexion</span>
        </button>
    );
};

export default LogoutButton; 