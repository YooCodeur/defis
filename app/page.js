"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import ChallengeDetails from './components/ChallengeDetails';
import CreateChallenge from './components/CreateChallenge';
import styles from './page.module.css';

export default function Home() {
    const { user, loading: authLoading, logout } = useAuth();
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [users, setUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [canCreateChallenge, setCanCreateChallenge] = useState(false);
    const [createMessage, setCreateMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const [cycleInfo, setCycleInfo] = useState(null);

    const fetchCurrentChallenge = async () => {
        try {
            const response = await fetch('/api/challenges/current');
            const data = await response.json();

            if (response.ok) {
                setCurrentChallenge(data.challenge);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setError("Erreur lors du chargement du défi");
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users/leaderboard');
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error("Erreur lors du chargement du classement:", err);
        }
    };

    const checkCanCreate = async () => {
        if (!user) return;
        
        try {
            const response = await fetch('/api/challenges/canCreate', {
                headers: {
                    'user-id': user.id
                }
            });
            const data = await response.json();

            if (response.ok) {
                setCanCreateChallenge(data.canCreate);
                if (data.message) {
                    setCreateMessage(data.message);
                }
                setCycleInfo({
                    eligibleUsers: data.eligibleUsers,
                    totalUsers: data.totalUsers,
                    currentCycle: data.currentCycle
                });
            }
        } catch (err) {
            console.error("Erreur lors de la vérification des permissions:", err);
        }
    };

    const handleChallengeUpdate = () => {
        fetchCurrentChallenge();
        checkCanCreate();
        fetchUsers();
    };

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            router.push('/login');
        }
    };

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        const init = async () => {
            setLoading(true);
            await Promise.all([
                fetchCurrentChallenge(),
                checkCanCreate(),
                fetchUsers()
            ]);
            setLoading(false);
        };

        init();
    }, [user, authLoading]);

    if (authLoading || loading) {
        return <div className={styles.loading}>Chargement...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1>Défis de Code</h1>
                <div className={styles.userInfo}>
                    <span className={styles.username}>{user.username}</span>
                    <span className={styles.points}>{user.points} points</span>
                    <button 
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        Déconnexion
                    </button>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.content}>
                <div className={styles.challengeSection}>
                    {currentChallenge ? (
                        <ChallengeDetails 
                            challenge={currentChallenge}
                            userId={user.id}
                            onUpdate={handleChallengeUpdate}
                        />
                    ) : (
                        <div className={styles.noChallenge}>
                            <p>Aucun défi actif pour le moment.</p>
                            {createMessage && (
                                <p className={styles.createMessage}>{createMessage}</p>
                            )}
                            {cycleInfo && (
                                <div className={styles.cycleInfo}>
                                    <p>Cycle actuel : {cycleInfo.currentCycle + 1}</p>
                                    <p>Utilisateurs restants dans ce cycle : {cycleInfo.eligibleUsers} / {cycleInfo.totalUsers}</p>
                                </div>
                            )}
                            {canCreateChallenge && (
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className={styles.createButton}
                                >
                                    Créer un nouveau défi
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.leaderboard}>
                    <h2>Classement</h2>
                    <div className={styles.usersList}>
                        {users.map((user, index) => (
                            <div key={user._id} className={styles.userCard}>
                                <span className={styles.rank}>#{index + 1}</span>
                                <div className={styles.userInfo}>
                                    <span className={styles.username}>{user.username}</span>
                                    <span className={styles.name}>
                                        {user.firstName} {user.lastName}
                                    </span>
                                </div>
                                <span className={styles.points}>{user.points} points</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <CreateChallenge 
                    onClose={(success) => {
                        setShowCreateModal(false);
                        if (success) handleChallengeUpdate();
                    }}
                    userId={user.id}
                />
            )}
        </main>
    );
} 