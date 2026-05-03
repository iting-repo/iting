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
    // Phát event để các component trong cùng tab (vd. sidebar badge) refresh count.
    // Sự kiện `storage` của browser chỉ fire ở các tab khác, không fire chính tab này.
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favorite-candidates-changed'));
    }
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
     * Remove multiple candidates from favorites in 1 batch.
     * @param {Array<number|string>} candidateIds
     * @returns {number} số candidate thực sự bị xoá
     */
    removeMany: (candidateIds) => {
        if (!Array.isArray(candidateIds) || candidateIds.length === 0) return 0;
        const idSet = new Set(candidateIds.map(String));
        const before = getAll();
        const after = before.filter(c => !idSet.has(String(c.id)));
        const removed = before.length - after.length;
        if (removed > 0) save(after);
        return removed;
    },

    /**
     * Get count of favorites
     */
    getCount: () => {
        return getAll().length;
    },
};

export default favoriteCandidateService;
