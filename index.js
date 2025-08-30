// File: ./index.js

/**
 * WordPress Site Analyzer - Main Entry Point
 * 
 * A comprehensive JavaScript tool for analyzing WordPress sites without admin access.
 * Detects WordPress version, active theme, installed plugins, and checks for outdated components.
 */

const WordPressAnalyzer = require('./src/wordpress-analyzer');

// Export main class
module.exports = WordPressAnalyzer;

// Export individual components for advanced usage
module.exports.WordPressAnalyzer = WordPressAnalyzer;
module.exports.detectors = {
    WordPressDetector: require('./src/detectors/wordpress-detector'),
    VersionDetector: require('./src/detectors/version-detector'),
    ThemeDetector: require('./src/detectors/theme-detector'),
    PluginDetector: require('./src/detectors/plugin-detector')
};

module.exports.utils = {
    HttpClient: require('./src/utils/http-client'),
    UrlHelper: require('./src/utils/url-helper'),
    VersionComparator: require('./src/utils/version-comparator')
};

module.exports.reporters = {
    ConsoleReporter: require('./src/reporters/console-reporter'),
    JsonReporter: require('./src/reporters/json-reporter'),
    HtmlReporter: require('./src/reporters/html-reporter')
};

module.exports.constants = require('./src/config/constants');
