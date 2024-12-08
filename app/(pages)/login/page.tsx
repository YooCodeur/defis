"use client"
import React from 'react';
import Login from '../../components/Login';
import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <Link href="/">Accueil</Link>
            </nav>
            <h1 className={styles.title}>Connexion</h1>
            <Login />
        </div>
    );
} 