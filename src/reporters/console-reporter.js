// File: ./src/reporters/console-reporter.js

/**
 * Console output reporter for WordPress analysis results
 */
class ConsoleReporter {
    /**
     * Generate a formatted console report
     * @param {Object} results - Analysis results
     * @returns {string} Formatted report
     */
    static generate(results) {
        let report = this.generateHeader(results);
        
        if (!results.wordpress.isWordPress) {
            report += '\nThis site does not appear to be running WordPress.\n';
            return report;
        }

        report += this.generateWordPressSection(results);
        report += this.generateVersionSection(results);
        report += this.generateThemeSection(results);
        report += this.generatePluginsSection(results);

        return report;
    }

    /**
     * Generate report header
     * @param {Object} results - Analysis results
     * @returns {string} Header section
     */
    static generateHeader(results) {
        return `
${'='.repeat(60)}
          WordPress Site Analysis Report
${'='.repeat(60)}
URL: ${results.url}
Analysis Date: ${new Date(results.timestamp).toLocaleString()}
Analysis Duration: ${results.duration || 'N/A'}ms
${'='.repeat(60)}
`;
    }

    /**
     * Generate WordPress detection section
     * @param {Object} results - Analysis results
     * @returns {string} WordPress section
     */
    static generateWordPressSection(results) {
        const wp = results.wordpress;
        let section = `\n📋 WORDPRESS DETECTION
${'─'.repeat(30)}
Status: ${wp.isWordPress ? '✅ WordPress Detected' : '❌ Not WordPress'}
Confidence: ${wp.confidence?.toUpperCase() || 'Unknown'} (Score: ${wp.score || 0}/100)
`;

        if (wp.indicators && wp.indicators.length > 0) {
            section += `\nDetection Indicators (${wp.indicators.length}):\n`;
            wp.indicators.forEach((indicator, index) => {
                section += `  ${index + 1}. ${indicator.type}: ${indicator.value} (${indicator.confidence})\n`;
            });
        }

        return section;
    }

    /**
     * Generate version section
     * @param {Object} results - Analysis results
     * @returns {string} Version section
     */
    static generateVersionSection(results) {
        const version = results.version;
        let section = `\n🔖 WORDPRESS VERSION
${'─'.repeat(30)}`;

        if (version && version.version) {
            section += `
Version: ${version.version}
Detection Method: ${version.method || 'Unknown'}
Confidence: ${version.confidence?.toUpperCase() || 'Unknown'}
Source: ${version.source || 'N/A'}
`;
        } else {
            section += '\nVersion: ❌ Could not detect WordPress version\n';
        }

        return section;
    }

    /**
     * Generate theme section
     * @param {Object} results - Analysis results
     * @returns {string} Theme section
     */
    static generateThemeSection(results) {
        const theme = results.theme;
        let section = `\n🎨 ACTIVE THEME
${'─'.repeat(30)}`;

        if (theme && theme.name) {
            section += `
Theme Name: ${theme.displayName || theme.name}
Directory: ${theme.name}
Version: ${theme.version || 'Unknown'}
Author: ${theme.author || 'Unknown'}
Path: ${theme.path || 'Unknown'}
Detection Method: ${theme.method || 'Unknown'}
`;

            if (theme.description) {
                section += `Description: ${theme.description}\n`;
            }

            if (theme.tags && theme.tags.length > 0) {
                section += `Tags: ${theme.tags.join(', ')}\n`;
            }
        } else {
            section += '\nTheme: ❌ Could not detect active theme\n';
        }

        return section;
    }

    /**
     * Generate plugins section
     * @param {Object} results - Analysis results
     * @returns {string} Plugins section
     */
    static generatePluginsSection(results) {
        const plugins = results.plugins || [];
        let section = `\n🔌 DETECTED PLUGINS (${plugins.length})
${'─'.repeat(30)}`;

        if (plugins.length === 0) {
            section += '\nNo plugins detected or plugins are not publicly detectable.\n';
            return section;
        }

        // Group plugins by status
        const outdated = plugins.filter(p => p.isOutdated === true);
        const upToDate = plugins.filter(p => p.isOutdated === false);
        const unknown = plugins.filter(p => p.isOutdated === null);

        section += `\n📊 Plugin Status Summary:
  ✅ Up to Date: ${upToDate.length}
  ⚠️  Outdated: ${outdated.length}
  ❓ Unknown Status: ${unknown.length}
`;

        // Show outdated plugins first (security priority)
        if (outdated.length > 0) {
            section += `\n⚠️  OUTDATED PLUGINS (Security Risk):
`;
            outdated.forEach((plugin, index) => {
                section += this.formatPluginEntry(plugin, index + 1, '⚠️');
            });
        }

        // Show up-to-date plugins
        if (upToDate.length > 0) {
            section += `\n✅ UP-TO-DATE PLUGINS:
`;
            upToDate.forEach((plugin, index) => {
                section += this.formatPluginEntry(plugin, index + 1, '✅');
            });
        }

        // Show unknown status plugins
        if (unknown.length > 0) {
            section += `\n❓ UNKNOWN STATUS PLUGINS:
`;
            unknown.forEach((plugin, index) => {
                section += this.formatPluginEntry(plugin, index + 1, '❓');
            });
        }

        return section;
    }

    /**
     * Format individual plugin entry
     * @param {Object} plugin - Plugin object
     * @param {number} index - Plugin index
     * @param {string} icon - Status icon
     * @returns {string} Formatted plugin entry
     */
    static formatPluginEntry(plugin, index, icon) {
        let entry = `  ${icon} ${index}. ${plugin.displayName || plugin.name}\n`;
        entry += `     Directory: ${plugin.name}\n`;
        entry += `     Current Version: ${plugin.version || 'Unknown'}\n`;
        
        if (plugin.latestVersion) {
            entry += `     Latest Version: ${plugin.latestVersion}\n`;
        }
        
        entry += `     Author: ${plugin.author || 'Unknown'}\n`;
        entry += `     Confidence: ${plugin.confidence?.toUpperCase() || 'Unknown'}\n`;
        
        if (plugin.detectionMethods && plugin.detectionMethods.length > 0) {
            const methods = plugin.detectionMethods.map(m => m.method).join(', ');
            entry += `     Detection: ${methods}\n`;
        }
        
        if (plugin.rating && plugin.numRatings) {
            entry += `     Rating: ${plugin.rating}/5 (${plugin.numRatings} ratings)\n`;
        }
        
        entry += '\n';
        return entry;
    }



    /**
     * Generate compact summary for CLI
     * @param {Object} results - Analysis results
     * @returns {string} Compact summary
     */
    static generateCompactSummary(results) {
        if (!results.wordpress.isWordPress) {
            return `❌ Not WordPress | URL: ${results.url}`;
        }

        const version = results.version?.version || 'Unknown';
        const theme = results.theme?.name || 'Unknown';
        const pluginCount = results.plugins?.length || 0;
        const outdated = (results.plugins || []).filter(p => p.isOutdated === true).length;

        return `✅ WordPress ${version} | Theme: ${theme} | Plugins: ${pluginCount} (${outdated} outdated)`;
    }
}

module.exports = ConsoleReporter;
