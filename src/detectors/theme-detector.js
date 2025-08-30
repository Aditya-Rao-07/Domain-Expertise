// File: ./src/detectors/theme-detector.js

const { DETECTION_METHODS } = require('../config/constants');
const HttpClient = require('../utils/http-client');
const UrlHelper = require('../utils/url-helper');

/**
 * WordPress theme detection
 */
class ThemeDetector {
    constructor(httpClient) {
        this.httpClient = httpClient || new HttpClient();
    }

    /**
     * Detect active WordPress theme
     * @param {string} baseUrl - Base URL of the site
     * @param {Object} $ - Cheerio instance
     * @returns {Object} Theme information
     */
    async detect(baseUrl, $) {
        const themeInfo = {
            name: null,
            version: null,
            author: null,
            description: null,
            path: null,
            method: null,
            stylesheet: null
        };

        // Method 1: CSS stylesheet link (most reliable)
        const stylesheetResult = this.detectFromStylesheet($);
        if (stylesheetResult.name) {
            Object.assign(themeInfo, stylesheetResult);
            await this.enrichThemeDetails(baseUrl, themeInfo);
            return themeInfo;
        }

        // Method 2: Body class analysis
        const bodyClassResult = this.detectFromBodyClass($);
        if (bodyClassResult.name) {
            Object.assign(themeInfo, bodyClassResult);
            await this.enrichThemeDetails(baseUrl, themeInfo);
            return themeInfo;
        }

        // Method 3: Asset path examination
        const assetPathResult = this.detectFromAssetPaths($);
        if (assetPathResult.name) {
            Object.assign(themeInfo, assetPathResult);
            await this.enrichThemeDetails(baseUrl, themeInfo);
            return themeInfo;
        }

        // Method 4: Template hints in HTML
        const templateResult = this.detectFromTemplateHints($);
        if (templateResult.name) {
            Object.assign(themeInfo, templateResult);
            await this.enrichThemeDetails(baseUrl, themeInfo);
            return themeInfo;
        }

        return themeInfo;
    }

    /**
     * Detect theme from stylesheet links
     * @param {Object} $ - Cheerio instance
     * @returns {Object} Theme detection result
     */
    detectFromStylesheet($) {
        const result = {
            name: null,
            version: null,
            path: null,
            method: DETECTION_METHODS.STYLESHEET_LINK,
            stylesheet: null
        };

        // Look for theme stylesheets
        const stylesheetLinks = $('link[rel="stylesheet"]');
        
        for (let i = 0; i < stylesheetLinks.length; i++) {
            const href = $(stylesheetLinks[i]).attr('href');
            
            if (href && href.includes('/wp-content/themes/')) {
                const themeName = UrlHelper.extractThemeName(href);
                if (themeName) {
                    result.name = themeName;
                    result.path = `/wp-content/themes/${themeName}/`;
                    result.stylesheet = href;
                    
                    // Try to extract version from URL
                    const version = UrlHelper.extractVersion(href);
                    if (version) {
                        result.version = version;
                    }
                    
                    break;
                }
            }
        }

        return result;
    }

    /**
     * Detect theme from body classes
     * @param {Object} $ - Cheerio instance
     * @returns {Object} Theme detection result
     */
    detectFromBodyClass($) {
        const result = {
            name: null,
            method: DETECTION_METHODS.BODY_CLASS
        };

        const bodyClass = $('body').attr('class') || '';
        
        // Look for theme-specific body classes
        const themeClassPatterns = [
            /theme-([a-zA-Z0-9\-_]+)/,
            /([a-zA-Z0-9\-_]+)-theme/,
            /wp-theme-([a-zA-Z0-9\-_]+)/
        ];

        for (const pattern of themeClassPatterns) {
            const match = bodyClass.match(pattern);
            if (match) {
                result.name = match[1];
                result.path = `/wp-content/themes/${match[1]}/`;
                break;
            }
        }

        return result;
    }

    /**
     * Detect theme from asset paths
     * @param {Object} $ - Cheerio instance
     * @returns {Object} Theme detection result
     */
    detectFromAssetPaths($) {
        const result = {
            name: null,
            method: DETECTION_METHODS.ASSET_PATH
        };

        // Check script and link tags for theme paths
        const assetTags = $('script[src*="/wp-content/themes/"], link[href*="/wp-content/themes/"]');
        
        for (let i = 0; i < assetTags.length; i++) {
            const src = $(assetTags[i]).attr('src') || $(assetTags[i]).attr('href');
            
            if (src) {
                const themeName = UrlHelper.extractThemeName(src);
                if (themeName) {
                    result.name = themeName;
                    result.path = `/wp-content/themes/${themeName}/`;
                    break;
                }
            }
        }

        return result;
    }

    /**
     * Detect theme from template hints in HTML
     * @param {Object} $ - Cheerio instance
     * @returns {Object} Theme detection result
     */
    detectFromTemplateHints($) {
        const result = {
            name: null,
            method: 'template_hints'
        };

        // Look for theme-specific template classes or IDs
        const selectors = [
            '[class*="template-"]',
            '[id*="template-"]',
            '[class*="page-template"]',
            '[data-template]'
        ];

        for (const selector of selectors) {
            const elements = $(selector);
            if (elements.length > 0) {
                // Try to extract theme name from template information
                elements.each((i, elem) => {
                    const className = $(elem).attr('class') || '';
                    const id = $(elem).attr('id') || '';
                    const dataTemplate = $(elem).attr('data-template') || '';
                    
                    const combined = `${className} ${id} ${dataTemplate}`;
                    const themeMatch = combined.match(/([a-zA-Z0-9\-_]+)[-_]theme/i);
                    
                    if (themeMatch) {
                        result.name = themeMatch[1];
                        result.path = `/wp-content/themes/${themeMatch[1]}/`;
                        return false; // Break the loop
                    }
                });
                
                if (result.name) break;
            }
        }

        return result;
    }

    /**
     * Enrich theme details by fetching style.css
     * @param {string} baseUrl - Base URL of the site
     * @param {Object} themeInfo - Theme information object to enrich
     */
    async enrichThemeDetails(baseUrl, themeInfo) {
        if (!themeInfo.path) return;

        const styleCssUrl = UrlHelper.joinPath(baseUrl, themeInfo.path + 'style.css');
        const response = await this.httpClient.fetchPage(styleCssUrl);
        
        if (response && response.data) {
            const cssContent = response.data;
            this.parseThemeHeader(cssContent, themeInfo);
        }
    }

    /**
     * Parse theme header from style.css content
     * @param {string} cssContent - CSS file content
     * @param {Object} themeInfo - Theme info object to update
     */
    parseThemeHeader(cssContent, themeInfo) {
        // WordPress theme header format
        const headerPatterns = {
            name: /Theme Name:\s*(.+)/i,
            description: /Description:\s*(.+)/i,
            version: /Version:\s*(.+)/i,
            author: /Author:\s*(.+)/i,
            authorUri: /Author URI:\s*(.+)/i,
            themeUri: /Theme URI:\s*(.+)/i,
            textDomain: /Text Domain:\s*(.+)/i,
            domainPath: /Domain Path:\s*(.+)/i,
            requiresWp: /Requires at least:\s*(.+)/i,
            testedWp: /Tested up to:\s*(.+)/i,
            requiresPhp: /Requires PHP:\s*(.+)/i,
            license: /License:\s*(.+)/i,
            licenseUri: /License URI:\s*(.+)/i,
            tags: /Tags:\s*(.+)/i
        };

        for (const [key, pattern] of Object.entries(headerPatterns)) {
            const match = cssContent.match(pattern);
            if (match) {
                const value = match[1].trim();
                
                // Map to standard property names
                switch (key) {
                    case 'name':
                        if (!themeInfo.name || themeInfo.name === themeInfo.path?.split('/')[3]) {
                            themeInfo.name = value;
                        }
                        themeInfo.displayName = value;
                        break;
                    case 'version':
                        themeInfo.version = value;
                        break;
                    case 'author':
                        themeInfo.author = value;
                        break;
                    case 'description':
                        themeInfo.description = value;
                        break;
                    case 'themeUri':
                        themeInfo.uri = value;
                        break;
                    case 'tags':
                        themeInfo.tags = value.split(',').map(tag => tag.trim());
                        break;
                    default:
                        themeInfo[key] = value;
                }
            }
        }
    }

    /**
     * Get all possible theme indicators
     * @param {string} baseUrl - Base URL
     * @param {Object} $ - Cheerio instance
     * @returns {Array} Array of theme detection results
     */
    async detectAll(baseUrl, $) {
        const results = [];

        const methods = [
            () => this.detectFromStylesheet($),
            () => this.detectFromBodyClass($),
            () => this.detectFromAssetPaths($),
            () => this.detectFromTemplateHints($)
        ];

        for (const method of methods) {
            try {
                const result = method();
                if (result.name) {
                    await this.enrichThemeDetails(baseUrl, result);
                    results.push(result);
                }
            } catch (error) {
                console.warn('Theme detection method failed:', error.message);
            }
        }

        return results;
    }
}

module.exports = ThemeDetector;
