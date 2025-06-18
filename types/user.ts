import { Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    points: number;
    completedChallenges: Array<{
        challenge: string;
        completedAt: Date;
    }>;
    lastCycleChallengeDate: Date | null;
    currentCycle: number;
    createdAt: Date;
} 