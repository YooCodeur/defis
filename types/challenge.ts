interface User {
    _id: string;
    username: string;
}

interface Media {
    url: string;
}

interface Submission {
    media: Media;
    submittedBy: string;
    mediaType: 'video' | 'photo';
}

interface Vote {
    userId: string;
    username: string;
    vote: 'approve' | 'reject';
}

interface Comment {
    username: string;
    content: string;
    createdAt: string;
}

export interface Challenge {
    _id: string;
    title: string;
    description: string;
    status: 'active' | 'pending_validation' | 'pending_acceptance' | 'completed' | 'rejected';
    assignedTo: User;
    createdBy: User;
    submission?: Submission;
    votes: Vote[];
    requiredVotes: number;
    comments?: Comment[];
} 