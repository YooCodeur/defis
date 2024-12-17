"use client"
import React from 'react';
import Register from '@/app/components/Register';

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RegisterPage() {
    return (
        <div>
            <Register />
        </div>
    );
} 