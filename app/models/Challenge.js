// app/models/Challenge.js
import mongoose from 'mongoose';

// Supprimer d'abord le modèle existant s'il existe
if (mongoose.models.Challenge) {
    delete mongoose.models.Challenge;
}

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['pending_acceptance', 'active', 'rejected', 'pending_validation', 'completed'],
        default: 'pending_acceptance'
    },
    votes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        vote: {
            type: String,
            enum: ['approve', 'reject'],
            required: true
        },
        votedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    submission: {
        mediaType: {
            type: String,
            enum: ['video', 'photo']
        },
        media: {
            url: String,
            secure_url: String,
            publicId: String
        },
        submittedAt: Date,
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    totalUsers: {
        type: Number,
        default: 0
    },
    requiredVotes: {
        type: Number,
        default: 0
    }
});

// Méthode pour calculer si le défi est validé
challengeSchema.methods.isValidated = function() {
    if (this.status !== 'pending_validation') return false;
    
    const approveVotes = this.votes.filter(v => v.vote === 'approve').length;
    return approveVotes >= this.requiredVotes;
};

// Méthode pour calculer si le défi est rejeté
challengeSchema.methods.isRejected = function() {
    if (this.status !== 'pending_validation') return false;
    
    const rejectVotes = this.votes.filter(v => v.vote === 'reject').length;
    const remainingPossibleApproves = this.totalUsers - this.votes.length;
    
    return (rejectVotes + remainingPossibleApproves) < this.requiredVotes;
};

// Recréer le modèle
const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;