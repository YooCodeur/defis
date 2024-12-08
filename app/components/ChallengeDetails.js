"use client"
import React, { useState } from 'react';
import styles from './ChallengeDetails.module.css';

const ChallengeDetails = ({ challenge, userId, onUpdate }) => {
    const [solution, setSolution] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/challenges/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId
                },
                body: JSON.stringify({
                    challengeId: challenge._id,
                    content: solution.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la soumission');
            }

            onUpdate();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (vote) => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/challenges/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId
                },
                body: JSON.stringify({
                    challengeId: challenge._id,
                    vote
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors du vote');
            }

            onUpdate();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const hasVoted = challenge.votes?.some(v => v.user.toString() === userId);
    const votesCount = challenge.votes?.length || 0;
    const approveVotes = challenge.votes?.filter(v => v.vote === 'approve').length || 0;
    const rejectVotes = challenge.votes?.filter(v => v.vote === 'reject').length || 0;

    return (
        <div className={styles.container}>
            <h2>{challenge.title}</h2>
            <p className={styles.description}>{challenge.description}</p>

            {challenge.status === 'active' && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h3>Soumettre une solution</h3>
                    {error && <div className={styles.error}>{error}</div>}
                    <textarea
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        placeholder="Décrivez votre solution..."
                        required
                        rows={5}
                        className={styles.textarea}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? 'Envoi...' : 'Soumettre'}
                    </button>
                </form>
            )}

            {challenge.status === 'pending_validation' && (
                <div className={styles.validation}>
                    <h3>Solution proposée</h3>
                    <div className={styles.solution}>
                        {challenge.submission.content}
                    </div>

                    <div className={styles.votes}>
                        <p>Votes: {votesCount} / {challenge.requiredVotes} requis</p>
                        <div className={styles.voteCount}>
                            <span className={styles.approve}>Pour: {approveVotes}</span>
                            <span className={styles.reject}>Contre: {rejectVotes}</span>
                        </div>

                        {!hasVoted && (
                            <div className={styles.voteButtons}>
                                <button
                                    onClick={() => handleVote('approve')}
                                    disabled={loading}
                                    className={styles.approveButton}
                                >
                                    Approuver
                                </button>
                                <button
                                    onClick={() => handleVote('reject')}
                                    disabled={loading}
                                    className={styles.rejectButton}
                                >
                                    Rejeter
                                </button>
                            </div>
                        )}
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                </div>
            )}

            {challenge.status === 'completed' && (
                <div className={styles.completed}>
                    <h3>Défi complété !</h3>
                    <p>Solution validée par la communauté</p>
                    <div className={styles.solution}>
                        {challenge.submission.content}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengeDetails; 