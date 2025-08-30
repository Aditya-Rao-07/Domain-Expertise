// File: ./src/utils/version-comparator.js

/**
 * Version comparison utilities
 */
class VersionComparator {
    /**
     * Compare two version strings
     * @param {string} version1 - First version
     * @param {string} version2 - Second version
     * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
     */
    static compare(version1, version2) {
        if (!version1 || !version2) {
            return 0;
        }

        // Normalize versions (remove 'v' prefix, handle pre-release tags)
        const v1 = this.normalizeVersion(version1);
        const v2 = this.normalizeVersion(version2);

        const v1parts = v1.split('.').map(part => parseInt(part) || 0);
        const v2parts = v2.split('.').map(part => parseInt(part) || 0);
        const maxLength = Math.max(v1parts.length, v2parts.length);
        
        for (let i = 0; i < maxLength; i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }
        
        return 0;
    }

    /**
     * Check if version1 is older than version2
     * @param {string} version1 - Version to check
     * @param {string} version2 - Version to compare against
     * @returns {boolean} True if version1 is older
     */
    static isOlder(version1, version2) {
        return this.compare(version1, version2) < 0;
    }

    /**
     * Check if version1 is newer than version2
     * @param {string} version1 - Version to check
     * @param {string} version2 - Version to compare against
     * @returns {boolean} True if version1 is newer
     */
    static isNewer(version1, version2) {
        return this.compare(version1, version2) > 0;
    }

    /**
     * Check if versions are equal
     * @param {string} version1 - First version
     * @param {string} version2 - Second version
     * @returns {boolean} True if versions are equal
     */
    static isEqual(version1, version2) {
        return this.compare(version1, version2) === 0;
    }

    /**
     * Normalize version string for comparison
     * @param {string} version - Version string to normalize
     * @returns {string} Normalized version
     */
    static normalizeVersion(version) {
        return version
            .toString()
            .toLowerCase()
            .replace(/^v/, '') // Remove 'v' prefix
            .replace(/[^0-9.]/g, '.') // Replace non-numeric chars with dots
            .replace(/\.+/g, '.') // Replace multiple dots with single dot
            .replace(/^\./, '') // Remove leading dot
            .replace(/\.$/, ''); // Remove trailing dot
    }

    /**
     * Get the major version number
     * @param {string} version - Version string
     * @returns {number} Major version number
     */
    static getMajorVersion(version) {
        const normalized = this.normalizeVersion(version);
        const parts = normalized.split('.');
        return parseInt(parts[0]) || 0;
    }

    /**
     * Get the minor version number
     * @param {string} version - Version string
     * @returns {number} Minor version number
     */
    static getMinorVersion(version) {
        const normalized = this.normalizeVersion(version);
        const parts = normalized.split('.');
        return parseInt(parts[1]) || 0;
    }

    /**
     * Get the patch version number
     * @param {string} version - Version string
     * @returns {number} Patch version number
     */
    static getPatchVersion(version) {
        const normalized = this.normalizeVersion(version);
        const parts = normalized.split('.');
        return parseInt(parts[2]) || 0;
    }

    /**
     * Check if a version is within a range
     * @param {string} version - Version to check
     * @param {string} minVersion - Minimum version (inclusive)
     * @param {string} maxVersion - Maximum version (inclusive)
     * @returns {boolean} True if version is within range
     */
    static isInRange(version, minVersion, maxVersion) {
        const versionCompare = this.compare(version, minVersion);
        const maxCompare = this.compare(version, maxVersion);
        
        return versionCompare >= 0 && maxCompare <= 0;
    }

    /**
     * Sort an array of versions
     * @param {Array} versions - Array of version strings
     * @param {boolean} ascending - Sort in ascending order (default: true)
     * @returns {Array} Sorted array of versions
     */
    static sort(versions, ascending = true) {
        return versions.sort((a, b) => {
            const result = this.compare(a, b);
            return ascending ? result : -result;
        });
    }
}

module.exports = VersionComparator;
