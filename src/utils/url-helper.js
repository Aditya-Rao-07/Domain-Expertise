// File: ./src/utils/url-helper.js

const { URL } = require('url');

/**
 * URL utility functions
 */
class UrlHelper {
    /**
     * Normalize URL by ensuring it has a protocol
     * @param {string} url - Input URL
     * @returns {string} Normalized URL
     */
    static normalizeUrl(url) {
        if (!url) {
            throw new Error('URL is required');
        }

        // Remove whitespace
        url = url.trim();

        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            throw new Error(`Invalid URL format: ${url}`);
        }

        return url;
    }

    /**
     * Extract base URL from a full URL
     * @param {string} url - Full URL
     * @returns {string} Base URL
     */
    static getBaseUrl(url) {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.host}`;
        } catch (error) {
            throw new Error(`Invalid URL: ${url}`);
        }
    }

    /**
     * Join URL paths safely
     * @param {string} baseUrl - Base URL
     * @param {string} path - Path to join
     * @returns {string} Complete URL
     */
    static joinPath(baseUrl, path) {
        const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return base + cleanPath;
    }

    /**
     * Extract domain from URL
     * @param {string} url - URL to parse
     * @returns {string} Domain name
     */
    static getDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (error) {
            throw new Error(`Invalid URL: ${url}`);
        }
    }

    /**
     * Check if URL is valid
     * @param {string} url - URL to validate
     * @returns {boolean} Whether URL is valid
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Extract plugin name from WordPress plugin path
     * @param {string} path - Plugin path
     * @returns {string|null} Plugin name or null
     */
    static extractPluginName(path) {
        const match = path.match(/\/wp-content\/plugins\/([^\/]+)/);
        return match ? match[1] : null;
    }

    /**
     * Extract theme name from WordPress theme path
     * @param {string} path - Theme path
     * @returns {string|null} Theme name or null
     */
    static extractThemeName(path) {
        const match = path.match(/\/wp-content\/themes\/([^\/]+)/);
        return match ? match[1] : null;
    }

    /**
     * Parse version from URL parameters
     * @param {string} url - URL with version parameter
     * @returns {string|null} Version string or null
     */
    static extractVersion(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('ver') || 
                   urlObj.searchParams.get('version') ||
                   null;
        } catch (error) {
            // Try regex as fallback
            const match = url.match(/[?&](?:ver|version)=([^&]+)/);
            return match ? match[1] : null;
        }
    }
}

module.exports = UrlHelper;
