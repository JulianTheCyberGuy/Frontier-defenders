const STORAGE_KEY = "frontier-defenders-progress";
const DEFAULT_PROGRESS = {
    highestUnlockedLevel: 0
};

function sanitizeProgress(progress = {}) {
    const highestUnlockedLevel = Number.isFinite(progress.highestUnlockedLevel)
        ? Math.max(0, Math.floor(progress.highestUnlockedLevel))
        : DEFAULT_PROGRESS.highestUnlockedLevel;

    return {
        highestUnlockedLevel
    };
}

export default class SaveSystem {
    static isAvailable() {
        try {
            return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
        } catch {
            return false;
        }
    }

    static loadProgress() {
        if (!this.isAvailable()) {
            return { ...DEFAULT_PROGRESS };
        }

        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return { ...DEFAULT_PROGRESS };
            }

            const parsed = JSON.parse(raw);
            return sanitizeProgress(parsed);
        } catch {
            return { ...DEFAULT_PROGRESS };
        }
    }

    static saveProgress(progress) {
        const sanitized = sanitizeProgress(progress);

        if (!this.isAvailable()) {
            return sanitized;
        }

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch {
            return sanitized;
        }

        return sanitized;
    }

    static getHighestUnlockedLevel() {
        return this.loadProgress().highestUnlockedLevel;
    }

    static isLevelUnlocked(levelIndex) {
        return levelIndex <= this.getHighestUnlockedLevel();
    }

    static unlockLevel(levelIndex) {
        const progress = this.loadProgress();
        if (levelIndex > progress.highestUnlockedLevel) {
            progress.highestUnlockedLevel = levelIndex;
            this.saveProgress(progress);
            return true;
        }

        return false;
    }

    static unlockNextLevel(completedLevelIndex, totalLevelCount) {
        const nextLevelIndex = Math.min(completedLevelIndex + 1, totalLevelCount - 1);
        return this.unlockLevel(nextLevelIndex);
    }
}
