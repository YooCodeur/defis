// app/components/ChallengeSection.js
"use client"
import React, { useState, useEffect } from 'react';
import styles from './ChallengeSection.module.css';
import Modal from './Modal';

const ChallengeSection = ({ challenge, showCreateForm, setShowCreateForm, userId }) => {
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaType, setMediaType] = useState('video'); // 'video' ou 'photo'
    const [currentChallenge, setCurrentChallenge] = useState(challenge);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        setCurrentChallenge(challenge);
    }, [challenge]);

    useEffect(() => {
        if (currentChallenge) {
            console.log('Challenge data:', currentChallenge);
            console.log('Assigned user:', currentChallenge.assignedTo);
        }
    }, [currentChallenge]);

    const fetchCurrentChallenge = async () => {
        try {
            const response = await fetch('/api/challenges/current');
            const data = await response.json();
            if (data.success && data.challenge) {
                setCurrentChallenge(data.challenge);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération du défi:', err);
        }
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/challenges/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    userId
                }),
            });

            const data = await response.json();

            if (data.success) {
                setShowCreateForm(false);
                await fetchCurrentChallenge();
            } else {
                setError(data.message || 'Erreur lors de la création du défi');
            }
        } catch (err) {
            setError('Erreur lors de la création du défi');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMediaSubmit = async (e) => {
        e.preventDefault();
        if (!mediaFile) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        const formData = new FormData();
        formData.append('media', mediaFile);
        formData.append('mediaType', mediaType);
        formData.append('challengeId', currentChallenge._id);
        formData.append('userId', userId);

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/challenges/submit-media', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                await fetchCurrentChallenge();
                setMediaFile(null);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(`Erreur lors de l'envoi du ${mediaType === 'video' ? 'de la vidéo' : 'de la photo'}`);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMediaTypeChange = (type) => {
        setMediaType(type);
        setMediaFile(null); // Réinitialiser le fichier lors du changement de type
    };

    const handleAcceptChallenge = async () => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/challenges/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challengeId: currentChallenge._id,
                    userId: userId
                }),
            });

            const data = await response.json();
            if (data.success) {
                setShowCreateForm(true); // Pour déclencher le rechargement des données
            } else {
                setError(data.message || 'Erreur lors de l\'acceptation du défi');
            }
        } catch (err) {
            setError('Erreur lors de l\'acceptation du défi');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectChallenge = async () => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/challenges/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challengeId: currentChallenge._id,
                    userId: userId
                }),
            });

            const data = await response.json();
            if (data.success) {
                setShowCreateForm(true); // Pour déclencher le rechargement des données
            } else {
                setError(data.message || 'Erreur lors du rejet du défi');
            }
        } catch (err) {
            setError('Erreur lors du rejet du défi');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVote = async (vote) => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/challenges/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challengeId: currentChallenge._id,
                    userId,
                    vote
                }),
            });

            const data = await response.json();
            if (data.success) {
                await fetchCurrentChallenge();
            } else if (data.nextCreator) {
                setCurrentChallenge({
                    ...currentChallenge,
                    status: 'completed',
                    assignedTo: data.nextCreator
                });
            } else {
                setError(data.message || 'Erreur lors du vote');
            }
        } catch (err) {
            setError('Erreur lors du vote');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText) {
            setError('Veuillez écrire un commentaire');
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
                    challengeId: currentChallenge._id,
                    userId,
                    content: commentText
                }),
            });

            const data = await response.json();
            if (data.success) {
                await fetchCurrentChallenge();
                setCommentText('');
            } else {
                setError('Erreur lors de l\'ajout du commentaire');
            }
        } catch (err) {
            setError('Erreur lors de l\'ajout du commentaire');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasUserVoted = currentChallenge?.votes?.some(vote => vote.userId === userId);
    const approveVotes = currentChallenge?.votes?.filter(vote => vote.vote === 'approve').length || 0;
    const rejectVotes = currentChallenge?.votes?.filter(vote => vote.vote === 'reject').length || 0;
    const isAssignedUser = currentChallenge?.assignedTo?._id === userId;
    const isCreator = currentChallenge?.createdBy?._id === userId;

    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            {showCreateForm ? (
                <div className={styles.createForm}>
                    <h3>Créer un nouveau défi</h3>
                    <form onSubmit={handleCreateChallenge} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title">Titre</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={styles.input}
                                required
                                minLength={3}
                                maxLength={100}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.textarea}
                                required
                                minLength={10}
                                maxLength={1000}
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button 
                                type="button" 
                                onClick={() => setShowCreateForm(false)}
                                className={styles.cancelButton}
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Création...' : 'Créer le défi'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : currentChallenge ? (
                <div className={styles.currentChallenge}>
                    <div className={styles.challengeInfo}>
                        <h3>{currentChallenge.title}</h3>
                        <p className={styles.description}>{currentChallenge.description}</p>
                        
                        {currentChallenge.createdBy && (
                            <p className={styles.assignedUser}>
                                Défi créé par <span className={styles.username}>{currentChallenge.createdBy.username}</span>
                            </p>
                        )}
                        
                        {currentChallenge.assignedTo && (
                            <p className={styles.assignedUser}>
                                Défi assigné à <span className={styles.username}>{currentChallenge.assignedTo.username}</span>
                            </p>
                        )}

                        <p className={styles.status}>
                            Statut : {
                                currentChallenge.status === 'active' ? 'En cours' : 
                                currentChallenge.status === 'pending_validation' ? 'En attente de validation' :
                                currentChallenge.status === 'completed' ? 'Terminé' :
                                currentChallenge.status === 'rejected' ? 'Rejeté' :
                                'En attente d\'acceptation'
                            }
                        </p>
                    </div>

                    {currentChallenge.status === 'pending_acceptance' && currentChallenge.assignedTo?._id === userId && (
                        <div className={styles.actionButtons}>
                            <button
                                onClick={handleAcceptChallenge}
                                className={styles.acceptButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'En cours...' : 'Accepter le défi'}
                            </button>
                            <button
                                onClick={handleRejectChallenge}
                                className={styles.rejectButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'En cours...' : 'Refuser le défi'}
                            </button>
                        </div>
                    )}

                    {isAssignedUser && currentChallenge.status === 'active' && (
                        <div className={styles.mediaUploadSection}>
                            <h4>📸 Soumettre votre preuve</h4>
                            <div className={styles.mediaTypeSelector}>
                                <button
                                    type="button"
                                    onClick={() => handleMediaTypeChange('video')}
                                    className={`${styles.mediaTypeButton} ${mediaType === 'video' ? styles.active : ''}`}
                                >
                                    🎥 Vidéo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMediaTypeChange('photo')}
                                    className={`${styles.mediaTypeButton} ${mediaType === 'photo' ? styles.active : ''}`}
                                >
                                    📸 Photo
                                </button>
                            </div>
                            <form onSubmit={handleMediaSubmit} className={styles.mediaForm}>
                                <div className={styles.fileInput}>
                                    <input
                                        type="file"
                                        accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                                        onChange={(e) => setMediaFile(e.target.files[0])}
                                        required
                                    />
                                    <p className={styles.fileHint}>
                                        {mediaType === 'video' 
                                            ? 'Format accepté : MP4, maximum 100MB'
                                            : 'Formats acceptés : JPG, PNG, maximum 5MB'}
                                    </p>
                                </div>
                                <button 
                                    type="submit" 
                                    className={styles.submitButton}
                                    disabled={isSubmitting || !mediaFile}
                                >
                                    {isSubmitting ? '⏳ Envoi en cours...' : `📤 Envoyer ${mediaType === 'video' ? 'la vidéo' : 'la photo'}`}
                                </button>
                            </form>
                        </div>
                    )}

                    {currentChallenge.status === 'pending_validation' && currentChallenge.submission && (
                        <div className={styles.validationSection}>
                            <h4>Validation du défi</h4>
                            
                            {currentChallenge.submission.mediaType === 'video' ? (
                                <video 
                                    className={styles.submittedVideo}
                                    src={currentChallenge.submission.media.url}
                                    controls
                                />
                            ) : (
                                <img 
                                    className={styles.submittedImage}
                                    src={currentChallenge.submission.media.url}
                                    alt="Preuve soumise"
                                />
                            )}

                            <div className={styles.votingProgress}>
                                <div className={styles.votingStats}>
                                    <span>Pour : {approveVotes}</span>
                                    <span>Contre : {rejectVotes}</span>
                                    <span>Requis : {currentChallenge.requiredVotes}</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div 
                                        className={styles.progressFill}
                                        style={{ width: `${(approveVotes / currentChallenge.requiredVotes) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {!isAssignedUser && !hasUserVoted && (
                                <div className={styles.votingButtons}>
                                    <button
                                        onClick={() => handleVote('approve')}
                                        className={styles.approveButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'En cours...' : '✅ Valider'}
                                    </button>
                                    <button
                                        onClick={() => handleVote('reject')}
                                        className={styles.rejectButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'En cours...' : '❌ Rejeter'}
                                    </button>
                                </div>
                            )}

                            {hasUserVoted && (
                                <p className={styles.votedMessage}>
                                    Vous avez déjà voté pour ce défi
                                </p>
                            )}

                            <div className={styles.commentsSection}>
                                <h4>💬 Commentaires</h4>
                                <div className={styles.commentsList}>
                                    {currentChallenge.comments?.map((comment, index) => (
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
                                    ))}
                                </div>
                                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Ajouter un commentaire..."
                                        className={styles.commentInput}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className={styles.commentButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? '⏳' : '📤'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.noChallenge}>
                    {currentChallenge?.status === 'completed' ? (
                        <p>En attente du prochain défi qui doit être créé par <span className={styles.username}>{currentChallenge.assignedTo.username}</span></p>
                    ) : (
                        <p>Aucun défi en cours</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChallengeSection;