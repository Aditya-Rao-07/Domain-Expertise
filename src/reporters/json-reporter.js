// File: ./src/reporters/json-reporter.js

/**
 * JSON reporter for WordPress analysis results
 */
class JsonReporter {
    /**
     * Generate structured JSON report
     * @param {Object} results - Analysis results
     * @param {Object} options - Report options
     * @returns {Object} Structured JSON report
     */
    static generate(results, options = {}) {
        const report = {
            meta: this.generateMeta(results, options),
            wordpress: this.generateWordPressSection(results),
            version: this.generateVersionSection(results),
            theme: this.generateThemeSection(results),
            plugins: this.generatePluginsSection(results),
            performance: this.generatePerformanceSection(results),
            recommendations: this.generateRecommendationsSection(results)
        };

        if (options.includeRawData) {
            report.raw = results;
        }

        return report;
    }

    /**
     * Generate metadata section
     * @param {Object} results - Analysis results
     * @param {Object} options - Report options
     * @returns {Object} Metadata object
     */
    static generateMeta(results, options) {
        return {
            url: results.url,
            analyzedAt: results.timestamp,
            duration: results.duration || null,
            analyzer: {
                name: 'WordPress Site Analyzer',
                version: '1.0.0'
            },
            reportFormat: 'json',
            reportOptions: options
        };
    }

    /**
     * Generate WordPress detection section
     * @param {Object} results - Analysis results
     * @returns {Object} WordPress detection data
     */
    static generateWordPressSection(results) {
        const wp = results.wordpress || {};
        
        return {
            detected: wp.isWordPress || false,
            confidence: wp.confidence || 'unknown',
            score: wp.score || 0,
            indicators: (wp.indicators || []).map(indicator => ({
                type: indicator.type,
                description: indicator.value,
                confidence: indicator.confidence
            })),
            detectionMethods: (wp.indicators || []).map(i => i.type),
            fingerprintingLevel: this.calculateFingerprintingLevel(wp.indicators || [])
        };
    }

    /**
     * Generate version section
     * @param {Object} results - Analysis results
     * @returns {Object} Version data
     */
    static generateVersionSection(results) {
        const version = results.version || {};
        
        return {
            detected: !!version.version,
            version: version.version || null,
            method: version.method || null,
            confidence: version.confidence || 'unknown',
            source: version.source || null,
            isLatest: null, // Would need current WordPress version check
            releaseDate: null, // Would need WordPress release data
            supportStatus: null // Would need WordPress support lifecycle data
        };
    }

    /**
     * Generate theme section
     * @param {Object} results - Analysis results
     * @returns {Object} Theme data
     */
    static generateThemeSection(results) {
        const theme = results.theme || {};
        
        return {
            detected: !!theme.name,
            name: theme.name || null,
            displayName: theme.displayName || null,
            version: theme.version || null,
            author: theme.author || null,
            description: theme.description || null,
            path: theme.path || null,
            detectionMethod: theme.method || null,
            tags: theme.tags || [],
            isChildTheme: theme.template && theme.template !== theme.name,
            parentTheme: theme.template || null,
            customizations: {
                hasCustomCss: false, // Would need additional detection
                hasChildTheme: false, // Would need additional detection
                hasCustomizations: false // Would need additional detection
            }
        };
    }

    /**
     * Generate plugins section
     * @param {Object} results - Analysis results
     * @returns {Object} Plugins data
     */
    static generatePluginsSection(results) {
        const plugins = results.plugins || [];
        
        const pluginStats = {
            total: plugins.length,
            active: plugins.length, // All detected plugins are assumed active
            outdated: plugins.filter(p => p.isOutdated === true).length,
            upToDate: plugins.filter(p => p.isOutdated === false).length,
            unknownStatus: plugins.filter(p => p.isOutdated === null).length
        };

        const categorizedPlugins = {
            security: this.categorizePlugins(plugins, 'security'),
            seo: this.categorizePlugins(plugins, 'seo'),
            performance: this.categorizePlugins(plugins, 'performance'),
            ecommerce: this.categorizePlugins(plugins, 'ecommerce'),
            forms: this.categorizePlugins(plugins, 'forms'),
            backup: this.categorizePlugins(plugins, 'backup'),
            other: this.categorizePlugins(plugins, 'other')
        };

        return {
            statistics: pluginStats,
            categories: categorizedPlugins,
            list: plugins.map(plugin => ({
                name: plugin.name,
                displayName: plugin.displayName || plugin.name,
                version: plugin.version || null,
                latestVersion: plugin.latestVersion || null,
                isOutdated: plugin.isOutdated,
                author: plugin.author || null,
                description: plugin.description || null,
                path: plugin.path || null,
                confidence: plugin.confidence || 'unknown',
                detectionMethods: (plugin.detectionMethods || []).map(m => m.method),
                rating: plugin.rating || null,
                downloads: plugin.downloadCount || null,
                lastUpdated: plugin.lastUpdated || null,
                category: this.categorizePlugin(plugin),
                riskLevel: this.assessPluginRisk(plugin)
            }))
        };
    }



    /**
     * Generate performance insights section
     * @param {Object} results - Analysis results
     * @returns {Object} Performance data
     */
    static generatePerformanceSection(results) {
        const plugins = results.plugins || [];
        
        // Categorize plugins by performance impact
        const heavyPlugins = plugins.filter(p => 
            ['elementor', 'woocommerce', 'jetpack'].includes(p.name)
        );
        
        const optimizationPlugins = plugins.filter(p =>
            ['wp-rocket', 'w3-total-cache', 'wp-super-cache'].includes(p.name)
        );

        return {
            potentialIssues: {
                heavyPlugins: heavyPlugins.length,
                totalPlugins: plugins.length,
                hasOptimization: optimizationPlugins.length > 0
            },
            recommendations: this.generatePerformanceRecommendations(plugins),
            metrics: {
                pluginCount: plugins.length,
                estimatedImpact: this.estimatePerformanceImpact(plugins)
            }
        };
    }

    /**
     * Generate recommendations section
     * @param {Object} results - Analysis results
     * @returns {Object} Recommendations data
     */
    static generateRecommendationsSection(results) {
        if (!results.recommendations) {
            return {
                available: false,
                message: 'Recommendations not generated'
            };
        }

        const recommendations = results.recommendations;
        
        return {
            available: true,
            summary: recommendations.summary || {},
            analysis: {
                enhanced_asset_analysis: recommendations.analysis?.enhanced_asset_analysis || null,
                performance_analysis: recommendations.analysis?.performance_analysis || null,
                functionality_analysis: recommendations.analysis?.functionality_analysis || null
            },
            recommendations: {
                performance: recommendations.recommendations?.performance || [],
                functionality: recommendations.recommendations?.functionality || [],
                compatibility: recommendations.recommendations?.compatibility || [],
                optimization: recommendations.recommendations?.optimization || []
            },
            top_recommendations: this.getTopRecommendations(recommendations),
            implementation_guide: this.generateImplementationGuide(recommendations)
        };
    }

    /**
     * Get top recommendations across all categories
     * @param {Object} recommendations - Recommendations data
     * @returns {Array} Top recommendations
     */
    static getTopRecommendations(recommendations) {
        const allRecs = [
            ...(recommendations.recommendations?.performance || []),
            ...(recommendations.recommendations?.functionality || []),
            ...(recommendations.recommendations?.compatibility || []),
            ...(recommendations.recommendations?.optimization || [])
        ];

        // Sort by priority and return top 10
        return allRecs
            .sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
            .slice(0, 10)
            .map(rec => ({
                plugin: rec.plugin,
                name: rec.name,
                category: rec.category,
                priority: rec.priority,
                description: rec.description,
                reason: rec.reason
            }));
    }

    /**
     * Generate implementation guide
     * @param {Object} recommendations - Recommendations data
     * @returns {Object} Implementation guide
     */
    static generateImplementationGuide(recommendations) {
        const allRecs = [
            ...(recommendations.recommendations?.performance || []),
            ...(recommendations.recommendations?.functionality || []),
            ...(recommendations.recommendations?.compatibility || []),
            ...(recommendations.recommendations?.optimization || [])
        ];

        const highPriority = allRecs.filter(r => r.priority === 'high');
        const mediumPriority = allRecs.filter(r => r.priority === 'medium');
        const lowPriority = allRecs.filter(r => r.priority === 'low');

        return {
            phases: {
                immediate: {
                    description: 'High priority recommendations to implement first',
                    recommendations: highPriority.slice(0, 3).map(rec => ({
                        plugin: rec.plugin,
                        name: rec.name,
                        reason: rec.reason,
                        estimated_effort: this.estimateEffort(rec)
                    }))
                },
                short_term: {
                    description: 'Medium priority recommendations for next phase',
                    recommendations: mediumPriority.slice(0, 5).map(rec => ({
                        plugin: rec.plugin,
                        name: rec.name,
                        reason: rec.reason,
                        estimated_effort: this.estimateEffort(rec)
                    }))
                },
                long_term: {
                    description: 'Low priority recommendations for future consideration',
                    recommendations: lowPriority.slice(0, 3).map(rec => ({
                        plugin: rec.plugin,
                        name: rec.name,
                        reason: rec.reason,
                        estimated_effort: this.estimateEffort(rec)
                    }))
                }
            },
            estimated_total_effort: this.calculateTotalEffort(allRecs),
            implementation_tips: this.generateImplementationTips(allRecs)
        };
    }

    /**
     * Estimate implementation effort for a recommendation
     * @param {Object} recommendation - Plugin recommendation
     * @returns {string} Effort estimate
     */
    static estimateEffort(recommendation) {
        const effortMap = {
            'contact-form-7': '30 minutes',
            'wpforms-lite': '1 hour',
            'woocommerce': '2-4 hours',
            'wordpress-seo': '1-2 hours',
            'wordfence': '30 minutes',
            'updraftplus': '30 minutes',
            'wp-rocket': '1 hour',
            'autoptimize': '1 hour'
        };

        return effortMap[recommendation.plugin] || '1-2 hours';
    }

    /**
     * Calculate total implementation effort
     * @param {Array} recommendations - All recommendations
     * @returns {string} Total effort estimate
     */
    static calculateTotalEffort(recommendations) {
        const highPriority = recommendations.filter(r => r.priority === 'high').length;
        const mediumPriority = recommendations.filter(r => r.priority === 'medium').length;
        const lowPriority = recommendations.filter(r => r.priority === 'low').length;

        const totalHours = (highPriority * 1.5) + (mediumPriority * 1) + (lowPriority * 0.5);
        
        if (totalHours <= 2) return '2-4 hours';
        if (totalHours <= 6) return '4-8 hours';
        if (totalHours <= 12) return '1-2 days';
        return '2-3 days';
    }

    /**
     * Generate implementation tips
     * @param {Array} recommendations - All recommendations
     * @returns {Array} Implementation tips
     */
    static generateImplementationTips(recommendations) {
        const tips = [
            'Always backup your site before installing new plugins',
            'Test plugins on a staging site first if possible',
            'Install and configure one plugin at a time',
            'Monitor site performance after each plugin installation',
            'Keep plugins updated regularly for security and compatibility'
        ];

        // Add specific tips based on recommendations
        if (recommendations.some(r => r.category === 'security')) {
            tips.push('Security plugins should be configured immediately after installation');
        }

        if (recommendations.some(r => r.category === 'performance')) {
            tips.push('Performance plugins may require server-level configuration');
        }

        if (recommendations.some(r => r.category === 'ecommerce')) {
            tips.push('E-commerce plugins require SSL certificate and payment gateway setup');
        }

        return tips;
    }

    /**
     * Calculate fingerprinting level
     * @param {Array} indicators - Detection indicators
     * @returns {string} Fingerprinting level
     */
    static calculateFingerprintingLevel(indicators) {
        const score = indicators.length;
        if (score >= 6) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }

    /**
     * Categorize plugins by type
     * @param {Array} plugins - Array of plugins
     * @param {string} category - Category to filter
     * @returns {Array} Filtered plugins
     */
    static categorizePlugins(plugins, category) {
        const categories = {
            security: ['wordfence', 'akismet', 'jetpack', 'ithemes-security'],
            seo: ['wordpress-seo', 'seo-by-rank-math', 'all-in-one-seo-pack'],
            performance: ['wp-rocket', 'w3-total-cache', 'wp-super-cache', 'autoptimize'],
            ecommerce: ['woocommerce', 'easy-digital-downloads'],
            forms: ['contact-form-7', 'wpforms-lite', 'ninja-forms'],
            backup: ['updraftplus', 'backwpup', 'duplicator']
        };

        if (category === 'other') {
            const knownPlugins = Object.values(categories).flat();
            return plugins.filter(p => !knownPlugins.includes(p.name));
        }

        return plugins.filter(p => (categories[category] || []).includes(p.name));
    }

    /**
     * Categorize a single plugin
     * @param {Object} plugin - Plugin object
     * @returns {string} Plugin category
     */
    static categorizePlugin(plugin) {
        const categories = {
            security: ['wordfence', 'akismet', 'jetpack', 'ithemes-security'],
            seo: ['wordpress-seo', 'seo-by-rank-math', 'all-in-one-seo-pack'],
            performance: ['wp-rocket', 'w3-total-cache', 'wp-super-cache', 'autoptimize'],
            ecommerce: ['woocommerce', 'easy-digital-downloads'],
            forms: ['contact-form-7', 'wpforms-lite', 'ninja-forms'],
            backup: ['updraftplus', 'backwpup', 'duplicator']
        };

        for (const [category, plugins] of Object.entries(categories)) {
            if (plugins.includes(plugin.name)) {
                return category;
            }
        }

        return 'other';
    }

    /**
     * Assess plugin risk level
     * @param {Object} plugin - Plugin object
     * @returns {string} Risk level
     */
    static assessPluginRisk(plugin) {
        if (plugin.isOutdated === true) {
            return 'high';
        }
        
        if (plugin.isOutdated === null) {
            return 'medium';
        }
        
        return 'low';
    }



    /**
     * Generate performance recommendations
     * @param {Array} plugins - Array of plugins
     * @returns {Array} Array of performance recommendations
     */
    static generatePerformanceRecommendations(plugins) {
        const recommendations = [];
        const hasOptimization = plugins.some(p => 
            ['wp-rocket', 'w3-total-cache', 'wp-super-cache'].includes(p.name)
        );
        
        if (!hasOptimization && plugins.length > 5) {
            recommendations.push({
                priority: 'medium',
                category: 'performance',
                action: 'Consider implementing caching solution',
                impact: 'Improves page load times and server performance'
            });
        }
        
        if (plugins.length > 20) {
            recommendations.push({
                priority: 'medium',
                category: 'performance',
                action: 'Review and remove unnecessary plugins',
                impact: 'Reduces overhead and potential security risks'
            });
        }
        
        return recommendations;
    }

    /**
     * Estimate performance impact of plugins
     * @param {Array} plugins - Array of plugins
     * @returns {string} Impact level
     */
    static estimatePerformanceImpact(plugins) {
        const heavyPlugins = plugins.filter(p => 
            ['elementor', 'woocommerce', 'jetpack', 'revslider'].includes(p.name)
        ).length;
        
        if (heavyPlugins >= 3 || plugins.length > 25) return 'high';
        if (heavyPlugins >= 1 || plugins.length > 15) return 'medium';
        return 'low';
    }
}

module.exports = JsonReporter;
