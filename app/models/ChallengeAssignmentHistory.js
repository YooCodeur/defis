const mongoose = require('mongoose');

const challengeAssignmentHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastAssignedAt: {
        type: Date,
        default: null
    },
    assignmentCount: {
        type: Number,
        default: 0
    }
});

const ChallengeAssignmentHistory = mongoose.models.ChallengeAssignmentHistory || mongoose.model('ChallengeAssignmentHistory', challengeAssignmentHistorySchema);

export default ChallengeAssignmentHistory; 