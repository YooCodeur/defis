"use client"
import { useState, useEffect } from 'react';
import styles from './UsersList.module.css';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users/leaderboard');
                if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
                const data = await response.json();
                setUsers(data.users);
            } catch (err) {
                console.error('Erreur lors du chargement du classement:', err);
                setError(`Erreur lors du chargement du classement: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className={styles.loading}>Chargement...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Classement</h2>
            <div className={styles.usersList}>
                {users.map((user, index) => (
                    <div key={user._id} className={styles.userCard}>
                        <div className={styles.rank}>{index + 1}</div>
                        <div className={styles.userInfo}>
                            <span className={styles.username}>{user.username}</span>
                            <span className={styles.points}>{user.points} points</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsersList; 