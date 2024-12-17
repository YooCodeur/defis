"use client"
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

interface Message {
    _id: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Rafraîchir toutes les 5 secondes
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/chat/messages');
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des messages:', err);
            setError('Erreur lors de la récupération des messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('Vous devez être connecté pour envoyer un message');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    content: newMessage
                }),
            });

            const data = await response.json();
            if (data.success) {
                setNewMessage('');
                await fetchMessages();
            } else {
                setError(data.message || 'Erreur lors de l\'envoi du message');
            }
        } catch (err) {
            console.error('Erreur lors de l\'envoi du message:', err);
            setError('Erreur lors de l\'envoi du message');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loading}>Chargement...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Chat de la communauté</h1>
            
            <div className={styles.chatContainer}>
                <div className={styles.messagesList}>
                    {messages.map((message) => (
                        <div key={message._id} className={styles.messageItem}>
                            <div className={styles.messageHeader}>
                                <span className={styles.username}>{message.username}</span>
                                <span className={styles.timestamp}>
                                    {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p className={styles.messageContent}>{message.content}</p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className={styles.messageForm}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className={styles.messageInput}
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '⏳' : '📤'}
                    </button>
                </form>
            </div>

            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
} 