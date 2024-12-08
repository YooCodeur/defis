import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Le titre est requis'] 
    },
    description: { 
        type: String, 
        required: [true, 'La description est requise'] 
    },
    videoUrl: { 
        type: String,
        default: null
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    creator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['accepted', 'completed', 'failed'],
            default: 'accepted'
        },
        videoSubmission: {
            type: String,
            default: null
        },
        points: {
            type: Number,
            default: 0
        }
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', challengeSchema);

export default Challenge; 