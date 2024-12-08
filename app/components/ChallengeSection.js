// app/components/ChallengeSection.js
"use client"
import React, { useState, useEffect } from 'react';
import styles from './ChallengeSection.module.css';
import Modal from './Modal';

const ChallengeSection = ({ userId }) => {
    const [canCreateChallenge, setCanCreateChallenge] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [isAssignedUser, setIsAssignedUser] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [hasVoted, setHasVoted] = useState(false);
    const [recentChallenges, setRecentChallenges] = useState([]);

    useEffect(() => {
        const checkCanCreate = async () => {
            try {
                if (!userId) {
                    console.log("Pas d'userId disponible");
                    return;
                }

                console.log("Vérification avec userId:", userId);

                const response = await fetch('/api/challenges/canCreate', {
                    headers: {
                        'user-id': userId,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la vérification');
                }

                const data = await response.json();
                console.log("Réponse canCreate:", data);
                setCanCreateChallenge(data.canCreate);
                if (data.currentChallenge) {
                    setCurrentChallenge(data.currentChallenge);
                }
            } catch (err) {
                console.error("Erreur checkCanCreate:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkCanCreate();
    }, [userId]);

    useEffect(() => {
        if (currentChallenge && currentChallenge.assignedToUsername === localStorage.getItem('username')) {
            setIsAssignedUser(true);
            console.log('Défi actuel:', {
                isAssignedUser: true,
                status: currentChallenge.status,
                shouldShowUpload: currentChallenge.status === 'active',
                assignedTo: currentChallenge.assignedToUsername,
                currentUser: localStorage.getItem('username')
            });
        }
    }, [currentChallenge]);

    useEffect(() => {
        if (currentChallenge && 
            currentChallenge.assignedToUsername === localStorage.getItem('username') && 
            currentChallenge.status === 'pending_acceptance') {
            setShowModal(true);
        }
    }, [currentChallenge]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/challenges/history');
                const data = await response.json();
                if (data.success) {
                    setRecentChallenges(data.challenges);
                }
            } catch (err) {
                console.error('Erreur chargement historique:', err);
            }
        };

        fetchHistory();
    }, []);

    console.log('État actuel:', {
        currentChallenge,
        userUsername: localStorage.getItem('username'),
        isModalShown: showModal
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            console.log('Envoi des données:', { title, description, userId }); // Debug

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

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création du défi');
            }

            if (!data.success) {
                throw new Error(data.message || 'La création du défi a échoué');
            }

            // Réinitialiser le formulaire
            setTitle('');
            setDescription('');
            setShowForm(false);
            
            // Recharger la page ou mettre à jour l'état
            window.location.reload();
        } catch (err) {
            console.error('Erreur détaillée:', err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChallengeResponse = async (accept) => {
        try {
            const response = await fetch('/api/challenges/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challengeId: currentChallenge._id,
                    userId,
                    accept
                }),
            });

            const data = await response.json();
            if (data.success) {
                window.location.reload();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Erreur lors de la réponse au défi');
        }
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Veuillez sélectionner une vidéo');
            return;
        }

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('challengeId', currentChallenge._id);
        formData.append('userId', userId);

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/challenges/submit-video', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                window.location.reload();
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError('Erreur lors de l\'envoi de la vidéo');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVote = async (vote) => {
        try {
            const response = await fetch('/api/challenges/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challengeId: currentChallenge._id,
                    userId,
                    vote // 'approve' ou 'reject'
                }),
            });

            const data = await response.json();
            if (data.success) {
                setHasVoted(true);
                window.location.reload();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Erreur lors du vote');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    console.log('Rendu ChallengeSection:', {
        currentChallenge,
        isAssignedUser,
        userUsername: localStorage.getItem('username'),
        status: currentChallenge?.status
    });

    return (
        <div className={styles.container}>
            {canCreateChallenge && !showForm ? (
                <button 
                    className={styles.createButton}
                    onClick={() => setShowForm(true)}
                >
                    Proposer un nouveau défi
                </button>
            ) : canCreateChallenge && showForm ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2>Créer un nouveau défi</h2>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Titre du défi</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Ex: Faire 100 pompes en 5 minutes"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description détaillée</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className={styles.textarea}
                            placeholder="Décrivez les règles et conditions du défi..."
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button 
                            type="button" 
                            onClick={() => setShowForm(false)}
                            className={styles.cancelButton}
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={styles.submitButton}
                        >
                            {isSubmitting ? 'Création en cours...' : 'Créer le défi'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.info}>
                    {currentChallenge ? (
                        <div className={styles.currentChallengeInfo}>
                            {isAssignedUser ? (
                                <>
                                    <div className={styles.challengeHeader}>
                                        <h2>Votre défi à réaliser</h2>
                                        <span className={styles.statusBadge}>
                                            {currentChallenge.status === 'pending_acceptance' ? '🔔 En attente de votre acceptation' :
                                             currentChallenge.status === 'active' ? '🎯 En cours' :
                                             currentChallenge.status === 'pending_validation' ? '⏳ En attente de validation' :
                                             '❓ Statut inconnu'}
                                        </span>
                                    </div>
                                    <div className={styles.challengeContent}>
                                        <h3>{currentChallenge.title}</h3>
                                        <p className={styles.description}>{currentChallenge.description}</p>
                                        
                                        {currentChallenge.status === 'pending_acceptance' && (
                                            <div className={styles.challengeActions}>
                                                <button 
                                                    onClick={() => handleChallengeResponse(true)}
                                                    className={styles.acceptButton}
                                                >
                                                    ✅ Accepter le défi
                                                </button>
                                                <button 
                                                    onClick={() => handleChallengeResponse(false)}
                                                    className={styles.rejectButton}
                                                >
                                                    ❌ Refuser (-5 points)
                                                </button>
                                            </div>
                                        )}
                                        
                                        {currentChallenge.status === 'active' && (
                                            <div className={styles.videoUploadSection}>
                                                <h4>📹 Soumettre votre preuve en vidéo</h4>
                                                <form onSubmit={handleVideoSubmit} className={styles.videoForm}>
                                                    <div className={styles.fileInput}>
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            onChange={(e) => setVideoFile(e.target.files[0])}
                                                            required
                                                        />
                                                        <p className={styles.fileHint}>Format accepté : MP4, maximum 100MB</p>
                                                    </div>
                                                    <button 
                                                        type="submit" 
                                                        className={styles.submitButton}
                                                        disabled={isSubmitting || !videoFile}
                                                    >
                                                        {isSubmitting ? '⏳ Envoi en cours...' : '📤 Envoyer la vidéo'}
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3>Défi en cours</h3>
                                    <p className={styles.challengeTitle}>{currentChallenge.title}</p>
                                    <p className={styles.challengeDescription}>{currentChallenge.description}</p>
                                    <div className={styles.challengeStatus}>
                                        <p className={styles.assignedTo}>
                                            <strong>Assigné à:</strong> {currentChallenge.assignedToUsername}
                                        </p>
                                        <p className={styles.status}>
                                            <strong>Statut:</strong> {
                                                currentChallenge.status === 'pending_acceptance' ? 'En attente d\'acceptation' :
                                                currentChallenge.status === 'active' ? 'En cours' :
                                                currentChallenge.status === 'pending_validation' ? 'En attente de validation' :
                                                currentChallenge.status === 'rejected' ? 'Refusé' :
                                                currentChallenge.status
                                            }
                                        </p>
                                    </div>

                                    {console.log('État du défi pour la validation:', {
                                        status: currentChallenge.status,
                                        isAssignedUser,
                                        hasSubmission: !!currentChallenge.submission,
                                        submissionUrl: currentChallenge.submission?.video?.url,
                                        votes: currentChallenge.votes
                                    })}

                                    {!isAssignedUser && currentChallenge.status === 'pending_validation' && currentChallenge.submission && (
                                        <div className={styles.validationSection}>
                                            <h4>Vidéo soumise par {currentChallenge.assignedToUsername}</h4>
                                            <div className={styles.videoContainer}>
                                                {currentChallenge.submission?.video?.url ? (
                                                    <video 
                                                        controls 
                                                        src={currentChallenge.submission.video.url}
                                                        className={styles.challengeVideo}
                                                    >
                                                        Votre navigateur ne supporte pas la lecture de vidéos.
                                                    </video>
                                                ) : (
                                                    <p>La vidéo n'est pas disponible</p>
                                                )}
                                            </div>

                                            {!hasVoted ? (
                                                <div className={styles.votingActions}>
                                                    <p>Le défi a-t-il été réalisé correctement ?</p>
                                                    <div className={styles.voteButtons}>
                                                        <button 
                                                            onClick={() => handleVote('approve')}
                                                            className={styles.approveButton}
                                                        >
                                                            ✅ Valider
                                                        </button>
                                                        <button 
                                                            onClick={() => handleVote('reject')}
                                                            className={styles.rejectButton}
                                                        >
                                                            ❌ Rejeter
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className={styles.votedMessage}>Vous avez déjà voté</p>
                                            )}

                                            <div className={styles.votingStats}>
                                                <p>Votes requis : {currentChallenge.requiredVotes}</p>
                                                <p>Votes reçus : {currentChallenge.votes?.length || 0}</p>
                                                <div className={styles.progressBar}>
                                                    <div 
                                                        className={styles.progressFill}
                                                        style={{
                                                            width: `${(currentChallenge.votes?.length || 0) * 100 / currentChallenge.requiredVotes}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <p>Aucun défi en cours.</p>
                    )}
                </div>
            )}
            
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <div className={styles.challengeModal}>
                    <h2>Nouveau défi reçu !</h2>
                    <div className={styles.challengeDetails}>
                        <h3>{currentChallenge?.title}</h3>
                        <p>{currentChallenge?.description}</p>
                    </div>
                    <div className={styles.modalActions}>
                        <button 
                            onClick={() => {
                                handleChallengeResponse(true);
                                setShowModal(false);
                            }}
                            className={styles.acceptButton}
                        >
                            Accepter le défi
                        </button>
                        <button 
                            onClick={() => {
                                handleChallengeResponse(false);
                                setShowModal(false);
                            }}
                            className={styles.rejectButton}
                        >
                            Refuser (-5 points)
                        </button>
                    </div>
                </div>
            </Modal>
            {recentChallenges.length > 0 && (
                <div className={styles.historySection}>
                    <h3>Derniers défis réussis</h3>
                    <div className={styles.challengesList}>
                        {recentChallenges.map((challenge, index) => (
                            <div key={index} className={styles.historyItem}>
                                <h4>{challenge.title}</h4>
                                <p className={styles.historyDescription}>{challenge.description}</p>
                                <div className={styles.historyMeta}>
                                    <span>Réalisé par: {challenge.completedBy}</span>
                                    <span>Créé par: {challenge.createdBy}</span>
                                    <span>Le: {new Date(challenge.completedAt).toLocaleDateString()}</span>
                                </div>
                                {challenge.videoUrl && (
                                    <div className={styles.historyVideo}>
                                        <video 
                                            controls 
                                            src={challenge.videoUrl}
                                            className={styles.completedVideo}
                                        >
                                            Votre navigateur ne supporte pas la lecture de vidéos.
                                        </video>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengeSection;