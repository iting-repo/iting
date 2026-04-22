/**
 * Service to manage employer's favorite candidates using localStorage.
 * This provides a client-side persistence layer until a backend API is available.
 */

const STORAGE_KEY = 'iting_favorite_candidates';

const getAll = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const save = (candidates) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
};

const favoriteCandidateService = {
    /**
     * Get all favorite candidates
     */
    getFavorites: () => {
        return getAll();
    },

    /**
     * Check if a candidate (by application ID) is favorited
     */
    isFavorite: (candidateId) => {
        const favorites = getAll();
        return favorites.some(c => c.id === candidateId);
    },

    /**
     * Toggle favorite status for a candidate.
     * If already favorited, remove. Otherwise, add.
     * @param {object} candidate - candidate data to save
     * @returns {boolean} - new favorite status (true = added, false = removed)
     */
    toggleFavorite: (candidate) => {
        const favorites = getAll();
        const index = favorites.findIndex(c => c.id === candidate.id);

        if (index > -1) {
            // Remove
            favorites.splice(index, 1);
            save(favorites);
            return false;
        } else {
            // Add with timestamp
            favorites.unshift({
                id: candidate.id,
                applicantName: candidate.applicantName,
                email: candidate.email,
                phoneNumber: candidate.phoneNumber,
                jobTitle: candidate.jobTitle,
                avatarUrl: candidate.avatarUrl,
                cvUrl: candidate.cvUrl,
                introduction: candidate.introduction,
                userId: candidate.userId || candidate.applicantId,
                favoritedAt: new Date().toISOString(),
            });
            save(favorites);
            return true;
        }
    },

    /**
     * Remove a candidate from favorites by ID
     */
    removeFavorite: (candidateId) => {
        const favorites = getAll();
        const filtered = favorites.filter(c => c.id !== candidateId);
        save(filtered);
    },

    /**
     * Get count of favorites
     */
    getCount: () => {
        return getAll().length;
    },
};

export default favoriteCandidateService;
