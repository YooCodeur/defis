"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                // Stocker l'userId dans le localStorage
                localStorage.setItem('userId', data.user.id.toString());
                // Stocker d'autres informations utiles si nécessaire
                localStorage.setItem('username', data.user.username);
                
                // Rediriger vers la page d'accueil
                router.push('/');
                router.refresh();
            } else {
                setError(data.message || 'Erreur lors de la connexion');
            }
        } catch (err) {
            setError('Erreur lors de la connexion');
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1>Connexion</h1>
                {error && <p className={styles.error}>{error}</p>}
                
                <div className={styles.formGroup}>
                    <label htmlFor="username">Nom d&apos;utilisateur</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className={styles.submitButton}>
                    Se connecter
                </button>
            </form>
        </div>
    );
} 