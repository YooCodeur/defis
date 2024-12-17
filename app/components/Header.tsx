"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        setIsLoggedIn(!!userId);
    }, []);

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
        <header className={styles.header}>
            <div className={styles.navLinks}>
                <Link href="/" className={styles.link}>
                    🏠 Accueil
                </Link>
                <Link href="/historique" className={styles.link}>
                    📜 Historique
                </Link>
                <Link href="/classement" className={styles.headerButton}>
                    <span className={styles.buttonEmoji}>🏆</span>
                    <span className={styles.buttonText}>Classement</span>
                </Link>
                <Link href="/chat" className={styles.headerButton}>
                    <span className={styles.buttonEmoji}>💬</span>
                    <span className={styles.buttonText}>Chat</span>
                </Link>
            </div>
            {isLoggedIn ? (
                <button onClick={handleLogout} className={styles.authButton}>
                    🚪 Déconnexion
                </button>
            ) : (
                <Link href="/login" className={styles.authButton}>
                    🔑 Connexion
                </Link>
            )}
        </header>
    );
};

export default Header; 