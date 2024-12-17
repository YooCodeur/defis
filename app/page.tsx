"use client"
import React, { useEffect, useState } from 'react';
import ChallengeSection from './components/ChallengeSection';
import styles from './page.module.css';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    status: string;
    assignedTo: {
        _id: string;
        username: string;
    };
    submission?: {
        video: {
            url: string;
            publicId: string;
        };
        submittedAt: Date;
        submittedBy: string;
    };
    votes: Array<{
        user: string;
        vote: 'approve' | 'reject';
        votedAt: Date;
    }>;
    requiredVotes: number;
}

export default function Home() {
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [canCreateChallenge, setCanCreateChallenge] = useState(false);

    const fetchCurrentChallenge = async () => {
        try {
            const response = await fetch('/api/challenges/current');
            const data = await response.json();
            if (data.success && data.challenge) {
                console.log("Challenge reçu:", data.challenge);
                setCurrentChallenge(data.challenge);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération du défi:', err);
            setError('Erreur lors de la récupération du défi');
        }
    };

    const checkCanCreateChallenge = async (userId: string) => {
        try {
            const response = await fetch(`/api/challenges/canCreate?userId=${userId}`);
            const data = await response.json();
            setCanCreateChallenge(data.canCreate);
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
            setError('Erreur lors de la vérification des permissions');
        }
    };

    useEffect(() => {
        const init = async () => {
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            if (storedUserId) {
                setUserId(storedUserId);
                setUsername(storedUsername);
                await checkCanCreateChallenge(storedUserId);
                await fetchCurrentChallenge();
            }
            setIsLoading(false);
        };
        init();
    }, []);

    const handleCreateFormClose = async (success: boolean) => {
        setShowCreateForm(false);
        if (success) {
            await fetchCurrentChallenge();
            await checkCanCreateChallenge(userId!);
        }
    };

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (!userId) {
        return <div>Veuillez vous connecter pour accéder à cette page</div>;
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className={styles.header}>
                <h1 className={styles.title}>Défis à l&apos;ORT : soyons fous et créatifs !</h1>
            </div>
            <div className={styles.userSection}>
                <span className={styles.welcomeText}>Bonjour, {username}</span>
            </div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {canCreateChallenge && (
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded my-8"
                >
                    Créer un nouveau défi
                </button>
            )}

            <div className="grid grid-cols-1 gap-8">
                <ChallengeSection
                    challenge={currentChallenge}
                    showCreateForm={showCreateForm}
                    setShowCreateForm={handleCreateFormClose}
                    userId={userId}
                />
            </div>
        </main>
    );
}