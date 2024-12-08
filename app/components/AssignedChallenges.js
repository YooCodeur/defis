"use client"
import { useState, useEffect } from 'react';
import styles from './AssignedChallenges.module.css';

export default function AssignedChallenges({ userId }) {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedChallenges = async () => {
            try {
                const response = await fetch(`/api/challenges/assigned?userId=${userId}`);
                const data = await response.json();
                
                if (data.success) {
                    setChallenges(data.challenges);
                }
            } catch (error) {
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchAssignedChallenges();
        }
    }, [userId]);

    if (loading) return <div>Chargement...</div>;

    return (
        <div className={styles.container}>
            <h2>Défis à réaliser</h2>
            {challenges.length > 0 ? (
                <div className={styles.challengesList}>
                    {challenges.map(challenge => (
                        <div key={challenge._id} className={styles.challengeCard}>
                            <h3>{challenge.title}</h3>
                            <p>{challenge.description}</p>
                            <button className={styles.submitButton}>
                                Soumettre ma vidéo
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Aucun défi à réaliser pour le moment</p>
            )}
        </div>
    );
} 