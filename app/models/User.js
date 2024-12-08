import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    completedChallenges: [{
        challenge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challenge'
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastCycleChallengeDate: {
        type: Date,
        default: null
    },
    currentCycle: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastChallengeAssignedAt: {
        type: Date,
        default: null
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 