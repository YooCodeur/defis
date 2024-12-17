import mongoose, { Document, Model } from 'mongoose';

// Interface pour le document User
interface IUser extends Document {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    points: number;
    completedChallenges: Array<{
        challenge: mongoose.Types.ObjectId;
        completedAt: Date;
    }>;
    lastCycleChallengeDate: Date | null;
    currentCycle: number;
    createdAt: Date;
    lastChallengeAssignedAt: Date | null;
}

// Définition du schéma
const userSchema = new mongoose.Schema<IUser>({
    username: { 
        type: String, 
        required: [true, 'Le nom d\'utilisateur est requis'],
        unique: true,
        trim: true,
        minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
        match: [/^[a-zA-Z0-9_]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, des chiffres et des underscores']
    },
    firstName: { 
        type: String, 
        required: [true, 'Le prénom est requis'],
        trim: true
    },
    lastName: { 
        type: String, 
        required: [true, 'Le nom est requis'],
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'Le mot de passe est requis']
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

// Middleware pour le logging
userSchema.pre('save', function(next) {
    console.log('Sauvegarde d\'un utilisateur:', this.username);
    next();
});

userSchema.pre('findOne', function() {
    console.log('Recherche d\'un utilisateur avec les critères:', this.getFilter());
});

// Fonction pour obtenir le modèle User
const getModel = (): Model<IUser> => {
    if (mongoose.models.User) {
        return mongoose.models.User as Model<IUser>;
    }
    return mongoose.model<IUser>('User', userSchema);
};

export default getModel(); 