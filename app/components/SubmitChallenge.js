import React, { useState } from 'react';
import axios from 'axios';

const SubmitChallenge = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/challenges', { title, description });
        // ... gérer la réponse
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
            <button type="submit">Soumettre le défi</button>
        </form>
    );
};

export default SubmitChallenge; 