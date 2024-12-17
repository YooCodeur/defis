"use client"
import React from 'react';
import Login from '../../components/Login';
import Link from 'next/link';
import styles from './page.module.css';

export const dynamic = 'force-dynamic'
export const revalidate = 0

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