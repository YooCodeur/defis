"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Register.module.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            console.log('Tentative d\'inscription:', { 
                username, 
                firstName, 
                lastName, 
                password: '***' 
            });

            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    firstName,
                    lastName,
                    password
                })
            });

            const data = await response.json();
            console.log('Réponse reçue:', data);

            if (response.ok) {
                console.log('Inscription réussie');
                router.push('/login');
            } else {
                throw new Error(data.error || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur détaillée:', error);
            setError(
                error.message || 
                'Erreur lors de l\'inscription. Veuillez réessayer.'
            );
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                {error && <div className={styles.error}>{error}</div>}
                <label htmlFor="username">Nom d&apos;utilisateur</label>
                <input
                    className={styles.input}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d&apos;utilisateur"
                    required
                    pattern="[a-zA-Z0-9_]+"
                    title="Le nom d&apos;utilisateur ne peut contenir que des lettres, des chiffres et des underscores"
                    minLength={3}
                />
                <input
                    className={styles.input}
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    required
                />
                <input
                    className={styles.input}
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                    minLength={6}
                />
                <button className={styles.button} type="submit">
                    S&apos;inscrire
                </button>
            </form>
        </div>
    );
};

export default Register; 