// File: ./src/detectors/version-detector.js

const { VERSION_ENDPOINTS, DETECTION_METHODS, CONFIDENCE_LEVELS } = require('../config/constants');
const HttpClient = require('../utils/http-client');
const UrlHelper = require('../utils/url-helper');

/**
 * WordPress version detection
 */
class VersionDetector {
    constructor(httpClient) {
        this.httpClient = httpClient || new HttpClient();
    }

    /**
     * Detect WordPress version using multiple methods
     * @param {string} baseUrl - Base URL of the site
     * @param {Object} $ - Cheerio instance
     * @param {string} html - Raw HTML content
     * @returns {Object} Version information
     */
    async detect(baseUrl, $, html) {
        const methods = [
            () => this.detectFromMetaGenerator($),
            () => this.detectFromReadmeFile(baseUrl),
            () => this.detectFromScriptVersions($),
            () => this.detectFromCssVersions($),
            () => this.detectFromOpmlFile(baseUrl),
            () => this.detectFromRssFeed(baseUrl),
            () => this.detectFromComments(html),
            () => this.detectFromRestAPI(baseUrl),
            () => this.detectFromDataAttributes($),
            () => this.detectFromJavaScriptVariables(html)
        ];

        // Try each detection method
        for (const method of methods) {
            try {
                const result = await method();
                if (result && result.version) {
                    return result;
                }
            } catch (error) {
                console.warn('Version detection method failed:', error.message);
            }
        }

        return {
            version: null,
            method: null,
            confidence: CONFIDENCE_LEVELS.LOW
        };
    }

    /**
     * Detect version from meta generator tag
     * @param {Object} $ - Cheerio instance
     * @returns {Object|null} Version info or null
     */
    detectFromMetaGenerator($) {
        const generator = $('meta[name="generator"]').attr('content');
        if (generator && generator.toLowerCase().includes('wordpress')) {
            const versionMatch = generator.match(/wordpress\s+(\d+\.[\d.]+)/i);
            if (versionMatch) {
                return {
                    version: versionMatch[1],
                    method: DETECTION_METHODS.META_GENERATOR,
                    confidence: CONFIDENCE_LEVELS.HIGH,
                    source: generator
                };
            }
        }
        return null;
    }

    /**
     * Detect version from readme.html file
     * @param {string} baseUrl - Base URL
     * @returns {Object|null} Version info or null
     */
    async detectFromReadmeFile(baseUrl) {
        const readmeUrl = UrlHelper.joinPath(baseUrl, VERSION_ENDPOINTS.README);
        const response = await this.httpClient.fetchPage(readmeUrl);
        
        if (response && response.data) {
            const versionMatch = response.data.match(/version\s+(\d+\.[\d.]+)/i);
            if (versionMatch) {
                return {
                    version: versionMatch[1],
                    method: DETECTION_METHODS.README_HTML,
                    confidence: CONFIDENCE_LEVELS.HIGH,
                    source: readmeUrl
                };
            }
        }
        return null;
    }

    /**
     * Detect version from script version parameters
     * @param {Object} $ - Cheerio instance
     * @returns {Object|null} Version info or null
     */
    detectFromScriptVersions($) {
        const scripts = $('script[src*="wp-includes"], script[src*="wp-content"]');
        
        for (let i = 0; i < scripts.length; i++) {
            const src = $(scripts[i]).attr('src');
            if (src) {
                const version = UrlHelper.extractVersion(src);
                if (version && this.isValidVersion(version)) {
                    return {
                        version: version,
                        method: DETECTION_METHODS.SCRIPT_VERSION,
                        confidence: CONFIDENCE_LEVELS.MEDIUM,
                        source: src
                    };
                }
            }
        }
        return null;
    }

    /**
     * Detect version from CSS version parameters
     * @param {Object} $ - Cheerio instance
     * @returns {Object|null} Version info or null
     */
    detectFromCssVersions($) {
        const stylesheets = $('link[rel="stylesheet"][href*="wp-"]');
        
        for (let i = 0; i < stylesheets.length; i++) {
            const href = $(stylesheets[i]).attr('href');
            if (href) {
                const version = UrlHelper.extractVersion(href);
                if (version && this.isValidVersion(version)) {
                    return {
                        version: version,
                        method: DETECTION_METHODS.CSS_VERSION,
                        confidence: CONFIDENCE_LEVELS.MEDIUM,
                        source: href
                    };
                }
            }
        }
        return null;
    }

    /**
     * Detect version from OPML file
     * @param {string} baseUrl - Base URL
     * @returns {Object|null} Version info or null
     */
    async detectFromOpmlFile(baseUrl) {
        const opmlUrl = UrlHelper.joinPath(baseUrl, VERSION_ENDPOINTS.OPML);
        const response = await this.httpClient.fetchPage(opmlUrl);
        
        if (response && response.data) {
            const versionMatch = response.data.match(/generator="wordpress\/(\d+\.[\d.]+)"/i);
            if (versionMatch) {
                return {
                    version: versionMatch[1],
                    method: DETECTION_METHODS.OPML_FILE,
                    confidence: CONFIDENCE_LEVELS.MEDIUM,
                    source: opmlUrl
                };
            }
        }
        return null;
    }

    /**
     * Detect version from RSS feed
     * @param {string} baseUrl - Base URL
     * @returns {Object|null} Version info or null
     */
    async detectFromRssFeed(baseUrl) {
        const rssUrl = UrlHelper.joinPath(baseUrl, VERSION_ENDPOINTS.RSS);
        const response = await this.httpClient.fetchPage(rssUrl);
        
        if (response && response.data) {
            const versionMatch = response.data.match(/wordpress\.org\/\?v=(\d+\.[\d.]+)/i);
            if (versionMatch) {
                return {
                    version: versionMatch[1],
                    method: DETECTION_METHODS.RSS_FEED,
                    confidence: CONFIDENCE_LEVELS.MEDIUM,
                    source: rssUrl
                };
            }
        }
        return null;
    }

    /**
     * Detect version from HTML comments
     * @param {string} html - Raw HTML content
     * @returns {Object|null} Version info or null
     */
    detectFromComments(html) {
        // Look for version in HTML comments
        const commentMatches = html.match(/<!--.*?wordpress.*?(\d+\.[\d.]+).*?-->/gi);
        if (commentMatches && commentMatches.length > 0) {
            const versionMatch = commentMatches[0].match(/(\d+\.[\d.]+)/);
            if (versionMatch) {
                return {
                    version: versionMatch[1],
                    method: 'html_comment',
                    confidence: CONFIDENCE_LEVELS.LOW,
                    source: 'HTML comment'
                };
            }
        }
        return null;
    }

    /**
     * Validate if a version string looks like a WordPress version
     * @param {string} version - Version string to validate
     * @returns {boolean} Whether version is valid
     */
    isValidVersion(version) {
        // WordPress versions typically follow X.Y or X.Y.Z pattern
        const versionPattern = /^\d+\.\d+(\.\d+)?$/;
        return versionPattern.test(version);
    }

    /**
     * Get multiple version candidates and choose the best one
     * @param {string} baseUrl - Base URL
     * @param {Object} $ - Cheerio instance
     * @param {string} html - Raw HTML content
     * @returns {Object} Best version detection result
     */
    async detectBestVersion(baseUrl, $, html) {
        const methods = [
            { name: 'meta', fn: () => this.detectFromMetaGenerator($), priority: 1 },
            { name: 'readme', fn: () => this.detectFromReadmeFile(baseUrl), priority: 2 },
            { name: 'scripts', fn: () => this.detectFromScriptVersions($), priority: 3 },
            { name: 'css', fn: () => this.detectFromCssVersions($), priority: 4 },
            { name: 'opml', fn: () => this.detectFromOpmlFile(baseUrl), priority: 5 },
            { name: 'rss', fn: () => this.detectFromRssFeed(baseUrl), priority: 6 }
        ];

        const results = [];

        // Run all methods
        for (const method of methods) {
            try {
                const result = await method.fn();
                if (result && result.version) {
                    results.push({ ...result, priority: method.priority });
                }
            } catch (error) {
                console.warn(`Version detection method ${method.name} failed:`, error.message);
            }
        }

        if (results.length === 0) {
            return {
                version: null,
                method: null,
                confidence: CONFIDENCE_LEVELS.LOW
            };
        }

        // Sort by confidence and priority
        results.sort((a, b) => {
            const confidenceOrder = { high: 3, medium: 2, low: 1 };
            const confDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
            return confDiff !== 0 ? confDiff : a.priority - b.priority;
        });

        return results[0];
    }

    /**
     * Detect version from WordPress REST API
     * @param {string} baseUrl - Base URL
     * @returns {Object|null} Version info or null
     */
    async detectFromRestAPI(baseUrl) {
        try {
            const apiUrl = UrlHelper.joinPath(baseUrl, '/wp-json/');
            const response = await this.httpClient.fetchPage(apiUrl);
            
            if (response && response.data) {
                const apiData = typeof response.data === 'string' 
                    ? JSON.parse(response.data) 
                    : response.data;
                
                if (apiData.wordpress_version) {
                    return {
                        version: apiData.wordpress_version,
                        method: 'rest_api',
                        confidence: CONFIDENCE_LEVELS.HIGH,
                        source: '/wp-json/'
                    };
                }
            }
        } catch (error) {
            // API not accessible or doesn't contain version info
        }
        return null;
    }

    /**
     * Detect version from data attributes
     * @param {Object} $ - Cheerio instance
     * @returns {Object|null} Version info or null
     */
    detectFromDataAttributes($) {
        // Look for WordPress version in data attributes
        const dataAttributes = [
            $('[data-wp-version]').attr('data-wp-version'),
            $('[data-wordpress-version]').attr('data-wordpress-version'),
            $('body').attr('data-wp-version'),
            $('html').attr('data-wp-version')
        ];

        for (const version of dataAttributes) {
            if (version && this.isValidVersion(version)) {
                return {
                    version: version,
                    method: 'data_attributes',
                    confidence: CONFIDENCE_LEVELS.MEDIUM,
                    source: 'HTML data attribute'
                };
            }
        }
        return null;
    }

    /**
     * Detect version from JavaScript variables
     * @param {string} html - Raw HTML content
     * @returns {Object|null} Version info or null
     */
    detectFromJavaScriptVariables(html) {
        // Common WordPress version variable patterns
        const patterns = [
            /window\.wp_version\s*=\s*["']([^"']+)["']/i,
            /wp_version:\s*["']([^"']+)["']/i,
            /wordpress_version:\s*["']([^"']+)["']/i,
            /"wp_version":\s*"([^"]+)"/i,
            /'wp_version':\s*'([^']+)'/i
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && this.isValidVersion(match[1])) {
                return {
                    version: match[1],
                    method: 'javascript_variables',
                    confidence: CONFIDENCE_LEVELS.MEDIUM,
                    source: 'JavaScript variable'
                };
            }
        }
        return null;
    }
}

module.exports = VersionDetector;
