"use client"
export const dynamic = 'force-dynamic'
export const revalidate = 0

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import Image from 'next/image';

interface Comment {
    userId: string;
    username: string;
    content: string;
    createdAt: string;
}

interface Challenge {
    _id: string;
    title: string;
    description: string;
    createdBy: {
        username: string;
    };
    assignedTo: {
        username: string;
    };
    status: string;
    completedAt: string;
    submission?: {
        mediaType: 'video' | 'photo';
        media: {
            url: string;
        };
    };
    comments?: Comment[];
}

export default function HistoriquePage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedComments, setExpandedComments] = useState<string[]>([]);
    const [showCommentForm, setShowCommentForm] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const response = await fetch('/api/challenges/history');
            const data = await response.json();
            if (data.success) {
                setChallenges(data.challenges);
            } else {
                setError(data.message || 'Erreur lors de la récupération des défis');
            }
        } catch (err) {
            setError('Erreur lors de la récupération des défis');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (challengeId: string) => {
        try {
            const response = await fetch(`/api/challenges/comment?challengeId=${challengeId}`);
            const data = await response.json();
            if (data.success) {
                const updatedChallenges = challenges.map(challenge => {
                    if (challenge._id === challengeId) {
                        return { ...challenge, comments: data.comments };
                    }
                    return challenge;
                });
                setChallenges(updatedChallenges);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des commentaires:', err);
        }
    };

    const toggleComments = async (challengeId: string) => {
        if (expandedComments.includes(challengeId)) {
            setExpandedComments(expandedComments.filter(id => id !== challengeId));
        } else {
            setExpandedComments([...expandedComments, challengeId]);
            if (!challenges.find(c => c._id === challengeId)?.comments) {
                await fetchComments(challengeId);
            }
        }
    };

    const handleAddComment = async (challengeId: string, e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('Vous devez être connecté pour commenter');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/challenges/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challengeId,
                    userId,
                    content: commentText
                }),
            });

            const data = await response.json();
            if (data.success) {
                await fetchComments(challengeId);
                setCommentText('');
                setShowCommentForm(null);
            } else {
                setError(data.message || 'Erreur lors de l\'ajout du commentaire');
            }
        } catch (err) {
            console.error('Erreur lors de l\'ajout du commentaire:', err);
            setError('Erreur lors de l\'ajout du commentaire');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loading}>Chargement...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Historique des Défis</h1>
            <div className={styles.challengesList}>
                {challenges.map((challenge) => (
                    <div key={challenge._id} className={styles.challengeCard}>
                        <div className={styles.challengeHeader}>
                            <h2>{challenge.title}</h2>
                            <span className={styles.status}>
                                {challenge.status === 'completed' ? '✅ Terminé' : 
                                 challenge.status === 'rejected' ? '❌ Rejeté' : 
                                 '⏳ En cours'}
                            </span>
                        </div>
                        <p className={styles.description}>{challenge.description}</p>
                        <div className={styles.users}>
                            <p>Créé par: <span>{challenge.createdBy.username}</span></p>
                            <p>Assigné ��: <span>{challenge.assignedTo.username}</span></p>
                        </div>
                        {challenge.submission && (
                            <div className={styles.media}>
                                {challenge.submission.mediaType === 'video' ? (
                                    <video 
                                        src={challenge.submission.media.url}
                                        controls
                                        className={styles.mediaContent}
                                    />
                                ) : (
                                    <Image 
                                        src={challenge.submission.media.url}
                                        alt="Preuve du défi"
                                        width={500}
                                        height={300}
                                        className={styles.mediaContent}
                                    />
                                )}
                            </div>
                        )}
                        {challenge.completedAt && (
                            <p className={styles.date}>
                                Terminé le: {new Date(challenge.completedAt).toLocaleDateString('fr-FR')}
                            </p>
                        )}
                        
                        <button 
                            onClick={() => toggleComments(challenge._id)}
                            className={styles.commentsButton}
                        >
                            {expandedComments.includes(challenge._id) ? 'Masquer les commentaires' : 'Voir les commentaires'}
                        </button>

                        <button 
                            onClick={() => setShowCommentForm(showCommentForm === challenge._id ? null : challenge._id)}
                            className={styles.addCommentButton}
                        >
                            💬 {showCommentForm === challenge._id ? 'Annuler' : 'Ajouter un commentaire'}
                        </button>

                        {showCommentForm === challenge._id && (
                            <form onSubmit={(e) => handleAddComment(challenge._id, e)} className={styles.commentForm}>
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Écrivez votre commentaire..."
                                    className={styles.commentInput}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="submit"
                                    className={styles.commentButton}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '⏳' : '📤'}
                                </button>
                            </form>
                        )}

                        {expandedComments.includes(challenge._id) && (
                            <div className={styles.commentsSection}>
                                {challenge.comments && challenge.comments.length > 0 ? (
                                    challenge.comments.map((comment, index) => (
                                        <div key={index} className={styles.comment}>
                                            <div className={styles.commentHeader}>
                                                <span className={styles.commentUser}>{comment.username}</span>
                                                <span className={styles.commentDate}>
                                                    {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className={styles.commentContent}>{comment.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noComments}>Aucun commentaire pour ce défi</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 