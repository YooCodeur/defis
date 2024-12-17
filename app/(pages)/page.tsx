"use client"
export const dynamic = 'force-dynamic'
export const revalidate = 0

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './page.module.css';

interface Challenge {
    _id: string;
    title: string;
    videoUrl: string;
}

export default function HomePage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [previousChallenge, setPreviousChallenge] = useState<Challenge | null>(null);

    useEffect(() => {
        const fetchChallenges = async () => {
            const response = await axios.get<Challenge[]>('/api/challenges');
            setChallenges(response.data);
            setPreviousChallenge(response.data[0] || null);
        };

        fetchChallenges();
    }, []);

    return (
        <div className={styles.container}>
      
            
            <h1 className={styles.title}>Défis à réaliser</h1>
            <ul className={styles.challengeList}>
                {challenges.map((challenge) => (
                    <li key={challenge._id} className={styles.challengeItem}>
                        {challenge.title}
                    </li>
                ))}
            </ul>

            {previousChallenge && (
                <div className={styles.videoSection}>
                    <h2>Ancien défi</h2>
                    <video controls className={styles.video}>
                        <source src={previousChallenge.videoUrl} type="video/mp4" />
                        Votre navigateur ne supporte pas la vidéo.
                    </video>
                </div>
            )}
        </div>
    );
} 