"use client"
import React from 'react';
import UsersList from '@/app/components/UsersList';
import styles from './page.module.css';

export default function ClassementPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Classement des Joueurs</h1>
            <div className={styles.content}>
                <UsersList />
            </div>
        </div>
    );
} 