"use client"
import React, { useState } from 'react';
import styles from './CreateChallenge.module.css';

const CreateChallenge = ({ onClose, userId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/challenges/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création du défi');
            }

            onClose(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Proposer un nouveau défi</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Titre du défi</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            minLength={3}
                            maxLength={100}
                            placeholder="Ex: Créer une animation en CSS"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            minLength={10}
                            maxLength={1000}
                            placeholder="Décrivez le défi en détail..."
                            rows={5}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button 
                            type="button" 
                            onClick={() => onClose(false)}
                            className={styles.cancelButton}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Création...' : 'Créer le défi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChallenge; 