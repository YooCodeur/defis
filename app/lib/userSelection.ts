import User from '@/app/models/User';

export async function selectNextUser(excludeUserId: string) {
    // Trouver tous les utilisateurs triés par date du dernier défi
    const users = await User.find({
        _id: { $ne: excludeUserId }
    })
    .sort({ lastChallengeAssignedAt: 1 }) // null en premier, puis les plus anciennes dates
    .lean();

    if (users.length === 0) {
        return null;
    }

    // Prendre les utilisateurs qui n'ont jamais eu de défi
    const neverAssignedUsers = users.filter(u => !u.lastChallengeAssignedAt);
    
    if (neverAssignedUsers.length > 0) {
        // Sélection aléatoire parmi ceux qui n'ont jamais eu de défi
        const randomIndex = Math.floor(Math.random() * neverAssignedUsers.length);
        const selectedUser = neverAssignedUsers[randomIndex];
        
        // Mettre à jour la date
        await User.findByIdAndUpdate(selectedUser._id, {
            lastChallengeAssignedAt: new Date()
        });

        return selectedUser;
    }

    // Prendre les utilisateurs avec la date la plus ancienne
    const oldestDate = users[0].lastChallengeAssignedAt;
    const usersWithOldestDate = users.filter(u => 
        u.lastChallengeAssignedAt?.getTime() === oldestDate?.getTime()
    );

    // Sélection aléatoire parmi ceux qui ont la date la plus ancienne
    const randomIndex = Math.floor(Math.random() * usersWithOldestDate.length);
    const selectedUser = usersWithOldestDate[randomIndex];

    // Mettre à jour la date
    await User.findByIdAndUpdate(selectedUser._id, {
        lastChallengeAssignedAt: new Date()
    });

    return selectedUser;
} 