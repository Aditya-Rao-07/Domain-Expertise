// File: ./src/utils/http-client.js

const axios = require('axios');
const { HTTP } = require('../config/constants');

/**
 * HTTP client utility for making web requests
 */
class HttpClient {
    constructor(options = {}) {
        this.userAgent = options.userAgent || HTTP.USER_AGENT;
        this.timeout = options.timeout || HTTP.TIMEOUT;
        this.maxRedirects = options.maxRedirects || HTTP.MAX_REDIRECTS;
    }

    /**
     * Fetch a page with proper headers and error handling
     * @param {string} url - URL to fetch
     * @param {Object} options - Additional options
     * @returns {Object|null} Axios response or null
     */
    async fetchPage(url, options = {}) {
        try {
            const config = {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    ...options.headers
                },
                timeout: options.timeout || this.timeout,
                maxRedirects: this.maxRedirects,
                validateStatus: function (status) {
                    return status >= 200 && status < 600; // Accept any status for analysis
                },
                ...options
            };

            const response = await axios.get(url, config);
            return response;
        } catch (error) {
            console.warn(`Failed to fetch ${url}:`, error.message);
            return null;
        }
    }

    /**
     * Fetch multiple URLs concurrently
     * @param {Array} urls - Array of URLs to fetch
     * @param {Object} options - Options for each request
     * @returns {Array} Array of responses (null for failed requests)
     */
    async fetchMultiple(urls, options = {}) {
        const promises = urls.map(url => this.fetchPage(url, options));
        const results = await Promise.allSettled(promises);
        
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.warn(`Failed to fetch ${urls[index]}:`, result.reason?.message);
                return null;
            }
        });
    }

    /**
     * Check if a URL is accessible
     * @param {string} url - URL to check
     * @returns {boolean} Whether the URL is accessible
     */
    async isAccessible(url) {
        try {
            const response = await this.fetchPage(url, { timeout: 5000 });
            return response && response.status >= 200 && response.status < 400;
        } catch (error) {
            return false;
        }
    }
}

module.exports = HttpClient;
