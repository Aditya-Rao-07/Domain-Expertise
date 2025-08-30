// File: ./src/utils/http-range.js

const axios = require('axios');
const { HTTP } = require('../config/constants');

/**
 * HTTP range request utilities for efficient asset inspection
 */
class HttpRangeClient {
    constructor(options = {}) {
        this.userAgent = options.userAgent || HTTP.USER_AGENT;
        this.timeout = options.timeout || 5000; // Reduced from 10s to 5s
    }

    /**
     * Fetch a specific byte range from a URL
     * @param {string} url - URL to fetch
     * @param {number} start - Start byte position
     * @param {number} end - End byte position
     * @returns {Buffer|null} Buffer containing the requested range or null
     */
    async fetchRange(url, start, end) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Range': `bytes=${start}-${end}`,
                    'Accept': '*/*'
                },
                timeout: this.timeout,
                responseType: 'arraybuffer',
                validateStatus: (status) => status === 206 || status === 200 // Partial Content or OK
            });

            return Buffer.from(response.data);
        } catch (error) {
            console.warn(`Failed to fetch range ${start}-${end} from ${url}:`, error.message);
            return null;
        }
    }

    /**
     * Fetch the tail (last N bytes) of a file
     * @param {string} url - URL to fetch
     * @param {number} size - Number of bytes from the end
     * @returns {Buffer|null} Buffer containing the tail or null
     */
    async fetchTail(url, size = 4096) {
        try {
            // First, get file size with HEAD request
            const headResponse = await axios.head(url, {
                headers: { 'User-Agent': this.userAgent },
                timeout: this.timeout
            });

            const contentLength = parseInt(headResponse.headers['content-length']);
            if (!contentLength || contentLength <= size) {
                // File is small enough, fetch the whole thing
                return this.fetchRange(url, 0, contentLength - 1);
            }

            const start = contentLength - size;
            return this.fetchRange(url, start, contentLength - 1);
        } catch (error) {
            // Fallback: try to get last 4KB without knowing file size
            try {
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': this.userAgent,
                        'Range': `bytes=-${size}`
                    },
                    timeout: this.timeout,
                    responseType: 'arraybuffer',
                    validateStatus: (status) => status === 206 || status === 200
                });
                return Buffer.from(response.data);
            } catch (fallbackError) {
                console.warn(`Failed to fetch tail from ${url}:`, fallbackError.message);
                return null;
            }
        }
    }

    /**
     * Get file headers (first N bytes)
     * @param {string} url - URL to fetch
     * @param {number} size - Number of bytes from the start
     * @returns {Buffer|null} Buffer containing the headers or null
     */
    async fetchHead(url, size = 4096) {
        return this.fetchRange(url, 0, size - 1);
    }

    /**
     * Fast head fetch with shorter timeout for optimization
     * @param {string} url - URL to fetch
     * @param {number} size - Number of bytes from the start
     * @returns {Buffer|null} Buffer containing the headers or null
     */
    async fetchHeadFast(url, size = 2048) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Range': `bytes=0-${size - 1}`,
                    'Accept': '*/*'
                },
                timeout: 3000, // Shorter timeout for faster processing
                responseType: 'arraybuffer',
                validateStatus: (status) => status === 206 || status === 200
            });

            return Buffer.from(response.data);
        } catch (error) {
            return null;
        }
    }
}

module.exports = HttpRangeClient;
