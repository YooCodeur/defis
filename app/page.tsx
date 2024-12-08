"use client"
import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import ChallengeSection from './components/ChallengeSection';
import UsersList from './components/UsersList';

interface Challenge {
    title: string;
    description: string;
    assignedToUsername?: string;
}

export default function Home() {
    const [userId, setUserId] = useState<string | null>(null);
    const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchCurrentChallenge();
        }
        setIsLoading(false);
    }, []);

    const fetchCurrentChallenge = async () => {
        try {
            const response = await fetch('/api/challenges/current');
            const data = await response.json();
            if (data.success && data.challenge) {
                setCurrentChallenge(data.challenge);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Chargement...</div>;
    }

    if (!userId) {
        return (
            <div className={styles.container}>
                <p className={styles.error}>Veuillez vous connecter pour accéder aux défis</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <ChallengeSection userId={userId} />
                {currentChallenge && (
                    <div className={styles.currentChallenge}>
                        <h2>Défi en cours</h2>
                        <div className={styles.challengeDetails}>
                            <h3>{currentChallenge.title}</h3>
                            <p>{currentChallenge.description}</p>
                            {currentChallenge.assignedToUsername && (
                                <p className={styles.assignedTo}>
                                    Défi assigné à: <span>{currentChallenge.assignedToUsername}</span>
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.sidebar}>
                <UsersList />
            </div>
        </div>
    );
}