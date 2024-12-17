"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkLoginStatus = () => {
        const userId = localStorage.getItem('userId');
        setIsLoggedIn(!!userId);
    };

    useEffect(() => {
        // Vérification initiale
        checkLoginStatus();

        // Vérifier toutes les 100ms
        const interval = setInterval(checkLoginStatus, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto">
                <div className="overflow-x-auto whitespace-nowrap py-4 px-4">
                    <div className={styles.navLinks}>
                        {isLoggedIn ? (
                            <>
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
                            </>
                        ) : (
                            <Link href="/login" className={styles.headerButton}>
                                <span className={styles.buttonEmoji}>🔑</span>
                                <span className={styles.buttonText}>Connexion</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header; 