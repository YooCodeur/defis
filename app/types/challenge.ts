export interface Challenge {
    _id: string;
    title: string;
    description: string;
    createdBy: {
        _id: string;
        username: string;
    };
    assignedTo: {
        _id: string;
        username: string;
    };
    status: 'active' | 'pending_validation' | 'pending_acceptance' | 'completed' | 'rejected';
    votes: Array<{
        userId: string;
        username: string;
        vote: 'approve' | 'reject';
    }>;
    submission?: {
        media: {
            url: string;
        };
        submittedBy: string;
    };
    completedAt?: string;
    createdAt: string;
} 