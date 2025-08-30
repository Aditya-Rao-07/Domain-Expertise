// File: ./src/detectors/wordpress-detector.js

const { WORDPRESS_INDICATORS } = require('../config/constants');

/**
 * WordPress detection logic
 */
class WordPressDetector {
    /**
     * Detect if the site is running WordPress
     * @param {Object} $ - Cheerio instance
     * @param {string} html - Raw HTML content
     * @returns {Object} Detection result with confidence level
     */
    static detect($, html) {
        const indicators = [];
        let confidence = 'low';

        // Check meta generator tag (highest confidence)
        const generator = $('meta[name="generator"]').attr('content');
        if (generator && generator.toLowerCase().includes('wordpress')) {
            indicators.push({
                type: 'meta_generator',
                value: generator,
                confidence: 'high'
            });
            confidence = 'high';
        }

        // Check for WordPress-specific paths in HTML
        WORDPRESS_INDICATORS.PATHS.forEach(path => {
            if (html.includes(path)) {
                indicators.push({
                    type: 'path_indicator',
                    value: path,
                    confidence: 'medium'
                });
                if (confidence === 'low') confidence = 'medium';
            }
        });

        // Check WordPress-specific body classes and IDs
        const bodyClass = $('body').attr('class') || '';
        const hasWpClass = WORDPRESS_INDICATORS.CLASSES.some(cls => 
            bodyClass.includes(cls) || $(`#${cls}`).length > 0
        );
        
        if (hasWpClass) {
            indicators.push({
                type: 'css_class',
                value: bodyClass,
                confidence: 'medium'
            });
            if (confidence === 'low') confidence = 'medium';
        }

        // Check for WordPress admin bar
        if ($('#wpadminbar').length > 0) {
            indicators.push({
                type: 'admin_bar',
                value: 'wpadminbar',
                confidence: 'high'
            });
            confidence = 'high';
        }

        // Check WordPress script tags
        const wpScripts = $('script[src*="wp-includes"], script[src*="wp-content"]').length;
        if (wpScripts > 0) {
            indicators.push({
                type: 'script_tags',
                value: `${wpScripts} WordPress scripts found`,
                confidence: 'high'
            });
            confidence = 'high';
        }

        // Check WordPress CSS files
        const wpStyles = $('link[href*="wp-content"], link[href*="wp-includes"]').length;
        if (wpStyles > 0) {
            indicators.push({
                type: 'css_files',
                value: `${wpStyles} WordPress stylesheets found`,
                confidence: 'high'
            });
            confidence = 'high';
        }

        // Check for wp-json endpoint references
        if (html.includes('wp-json') || html.includes('rest_route')) {
            indicators.push({
                type: 'rest_api',
                value: 'WordPress REST API detected',
                confidence: 'high'
            });
            confidence = 'high';
        }

        const isWordPress = indicators.length > 0;

        return {
            isWordPress,
            confidence,
            indicators,
            score: this.calculateScore(indicators)
        };
    }

    /**
     * Calculate confidence score based on indicators
     * @param {Array} indicators - Array of detection indicators
     * @returns {number} Score from 0-100
     */
    static calculateScore(indicators) {
        const weights = {
            'meta_generator': 30,
            'admin_bar': 25,
            'script_tags': 20,
            'css_files': 15,
            'rest_api': 15,
            'path_indicator': 5,
            'css_class': 5
        };

        let score = 0;
        const seenTypes = new Set();

        indicators.forEach(indicator => {
            if (!seenTypes.has(indicator.type)) {
                seenTypes.add(indicator.type);
                score += weights[indicator.type] || 1;
            }
        });

        return Math.min(100, score);
    }

    /**
     * Get WordPress detection summary
     * @param {Object} detectionResult - Result from detect method
     * @returns {string} Human-readable summary
     */
    static getSummary(detectionResult) {
        if (!detectionResult.isWordPress) {
            return 'Site does not appear to be running WordPress';
        }

        const { confidence, score, indicators } = detectionResult;
        const indicatorTypes = indicators.map(i => i.type).join(', ');
        
        return `WordPress detected with ${confidence} confidence (score: ${score}/100). ` +
               `Indicators: ${indicatorTypes}`;
    }
}

module.exports = WordPressDetector;
