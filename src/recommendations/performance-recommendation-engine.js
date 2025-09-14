// File: ./src/recommendations/performance-recommendation-engine.js

const HttpClient = require('../utils/http-client');
const UrlHelper = require('../utils/url-helper');

/**
 * Performance-Based Plugin Recommendation Engine
 * Analyzes site performance and suggests plugins for optimization
 */
class PerformanceRecommendationEngine {
    constructor(httpClient) {
        this.httpClient = httpClient || new HttpClient();
        
        // Performance thresholds
        this.thresholds = {
            pageLoadTime: 3000, // 3 seconds
            resourceSize: 500000, // 500KB
            resourceCount: 50,
            blockingResources: 10,
            unusedCSS: 0.3, // 30%
            unusedJS: 0.2, // 20%
            imageOptimization: 0.8, // 80% of images not optimized
            cachingScore: 0.5 // 50% cache hit ratio
        };

        // Plugin recommendations database
        this.recommendations = this.initializeRecommendations();
    }

    /**
     * Initialize plugin recommendations database
     * @returns {Object} Recommendations organized by performance issue
     */
    initializeRecommendations() {
        return {
            // Caching plugins
            caching: {
                high: [
                    {
                        plugin: 'wp-rocket',
                        name: 'WP Rocket',
                        category: 'caching',
                        priority: 'high',
                        description: 'Premium caching plugin with advanced optimization features',
                        features: ['Page caching', 'Browser caching', 'Database optimization', 'CDN integration'],
                        performance_impact: 'high',
                        cost: 'premium',
                        alternatives: ['w3-total-cache', 'wp-super-cache', 'litespeed-cache']
                    },
                    {
                        plugin: 'w3-total-cache',
                        name: 'W3 Total Cache',
                        category: 'caching',
                        priority: 'high',
                        description: 'Comprehensive caching solution with CDN support',
                        features: ['Page caching', 'Object caching', 'Database caching', 'CDN integration'],
                        performance_impact: 'high',
                        cost: 'freemium',
                        alternatives: ['wp-rocket', 'wp-super-cache', 'litespeed-cache']
                    }
                ],
                medium: [
                    {
                        plugin: 'wp-super-cache',
                        name: 'WP Super Cache',
                        category: 'caching',
                        priority: 'medium',
                        description: 'Simple and effective caching plugin',
                        features: ['Page caching', 'Browser caching', 'Compression'],
                        performance_impact: 'medium',
                        cost: 'free',
                        alternatives: ['w3-total-cache', 'wp-rocket']
                    },
                    {
                        plugin: 'litespeed-cache',
                        name: 'LiteSpeed Cache',
                        category: 'caching',
                        priority: 'medium',
                        description: 'Optimized for LiteSpeed servers',
                        features: ['Page caching', 'Object caching', 'Image optimization'],
                        performance_impact: 'high',
                        cost: 'free',
                        alternatives: ['wp-rocket', 'w3-total-cache']
                    }
                ]
            },

            // Image optimization plugins
            imageOptimization: {
                high: [
                    {
                        plugin: 'smush',
                        name: 'Smush',
                        category: 'image-optimization',
                        priority: 'high',
                        description: 'Automatic image optimization and compression',
                        features: ['Bulk optimization', 'WebP conversion', 'Lazy loading', 'CDN integration'],
                        performance_impact: 'high',
                        cost: 'freemium',
                        alternatives: ['shortpixel', 'imagify', 'ewww-image-optimizer']
                    },
                    {
                        plugin: 'shortpixel',
                        name: 'ShortPixel',
                        category: 'image-optimization',
                        priority: 'high',
                        description: 'Advanced image optimization with WebP support',
                        features: ['Lossless compression', 'WebP conversion', 'AVIF support', 'CDN integration'],
                        performance_impact: 'high',
                        cost: 'freemium',
                        alternatives: ['smush', 'imagify', 'ewww-image-optimizer']
                    }
                ],
                medium: [
                    {
                        plugin: 'ewww-image-optimizer',
                        name: 'EWWW Image Optimizer',
                        category: 'image-optimization',
                        priority: 'medium',
                        description: 'Free image optimization with good compression',
                        features: ['Bulk optimization', 'WebP conversion', 'Lazy loading'],
                        performance_impact: 'medium',
                        cost: 'free',
                        alternatives: ['smush', 'shortpixel']
                    }
                ]
            },

            // Minification plugins
            minification: {
                high: [
                    {
                        plugin: 'autoptimize',
                        name: 'Autoptimize',
                        category: 'minification',
                        priority: 'high',
                        description: 'Comprehensive CSS, JS, and HTML optimization',
                        features: ['CSS minification', 'JS minification', 'HTML optimization', 'Inline CSS'],
                        performance_impact: 'high',
                        cost: 'free',
                        alternatives: ['wp-rocket', 'w3-total-cache']
                    },
                    {
                        plugin: 'wp-rocket',
                        name: 'WP Rocket',
                        category: 'minification',
                        priority: 'high',
                        description: 'All-in-one optimization including minification',
                        features: ['CSS minification', 'JS minification', 'HTML optimization', 'Concatenation'],
                        performance_impact: 'high',
                        cost: 'premium',
                        alternatives: ['autoptimize', 'w3-total-cache']
                    }
                ]
            },

            // Database optimization plugins
            databaseOptimization: {
                high: [
                    {
                        plugin: 'wp-optimize',
                        name: 'WP-Optimize',
                        category: 'database-optimization',
                        priority: 'high',
                        description: 'Database cleanup and optimization',
                        features: ['Database cleanup', 'Image optimization', 'Caching', 'Compression'],
                        performance_impact: 'medium',
                        cost: 'freemium',
                        alternatives: ['wp-sweep', 'advanced-database-cleaner']
                    }
                ],
                medium: [
                    {
                        plugin: 'wp-sweep',
                        name: 'WP-Sweep',
                        category: 'database-optimization',
                        priority: 'medium',
                        description: 'Simple database cleanup tool',
                        features: ['Database cleanup', 'Orphaned data removal'],
                        performance_impact: 'medium',
                        cost: 'free',
                        alternatives: ['wp-optimize', 'advanced-database-cleaner']
                    }
                ]
            },

            // CDN plugins
            cdn: {
                high: [
                    {
                        plugin: 'cloudflare',
                        name: 'Cloudflare',
                        category: 'cdn',
                        priority: 'high',
                        description: 'Global CDN with advanced optimization features',
                        features: ['Global CDN', 'DDoS protection', 'SSL', 'Page rules'],
                        performance_impact: 'high',
                        cost: 'freemium',
                        alternatives: ['keycdn', 'maxcdn', 'bunnycdn']
                    }
                ]
            },

            // Lazy loading plugins
            lazyLoading: {
                medium: [
                    {
                        plugin: 'a3-lazy-load',
                        name: 'A3 Lazy Load',
                        category: 'lazy-loading',
                        priority: 'medium',
                        description: 'Lazy loading for images and videos',
                        features: ['Image lazy loading', 'Video lazy loading', 'Iframe lazy loading'],
                        performance_impact: 'medium',
                        cost: 'free',
                        alternatives: ['wp-rocket', 'smush']
                    }
                ]
            },

            // Performance monitoring plugins
            monitoring: {
                medium: [
                    {
                        plugin: 'query-monitor',
                        name: 'Query Monitor',
                        category: 'monitoring',
                        priority: 'medium',
                        description: 'Database query monitoring and performance analysis',
                        features: ['Query monitoring', 'Performance analysis', 'Debug information'],
                        performance_impact: 'low',
                        cost: 'free',
                        alternatives: ['new-relic', 'gtmetrix']
                    }
                ]
            }
        };
    }

    /**
     * Analyze performance data and generate recommendations
     * @param {Object} performanceData - Performance analysis data
     * @param {Object} siteData - General site data
     * @returns {Object} Performance recommendations
     */
    async analyzePerformanceAndRecommend(performanceData, siteData) {
        console.log('🔍 Analyzing performance data for recommendations...');
        
        const recommendations = {
            priority: 'high',
            issues: [],
            recommendations: [],
            score: 0,
            summary: ''
        };

        // Analyze different performance aspects
        const issues = await this.identifyPerformanceIssues(performanceData, siteData);
        recommendations.issues = issues;

        // Generate recommendations based on issues
        for (const issue of issues) {
            const issueRecommendations = await this.generateRecommendationsForIssue(issue, siteData);
            recommendations.recommendations.push(...issueRecommendations);
        }

        // Calculate overall performance score
        recommendations.score = this.calculatePerformanceScore(performanceData, issues);
        
        // Generate summary
        recommendations.summary = this.generatePerformanceSummary(recommendations);

        // Sort recommendations by priority
        recommendations.recommendations.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        console.log(`✅ Generated ${recommendations.recommendations.length} performance recommendations`);
        return recommendations;
    }

    /**
     * Identify performance issues from analysis data
     * @param {Object} performanceData - Performance data
     * @param {Object} siteData - Site data
     * @returns {Array} Identified issues
     */
    async identifyPerformanceIssues(performanceData, siteData) {
        const issues = [];

        // Check page load time
        if (performanceData && performanceData.main_page_timing && performanceData.main_page_timing.load_time > this.thresholds.pageLoadTime) {
            issues.push({
                type: 'slow_page_load',
                severity: 'high',
                description: `Page load time is ${performanceData.main_page_timing.load_time}ms (threshold: ${this.thresholds.pageLoadTime}ms)`,
                impact: 'User experience, SEO, conversion rates',
                metrics: {
                    current: performanceData.main_page_timing.load_time,
                    threshold: this.thresholds.pageLoadTime
                }
            });
        }

        // Check resource size
        if (performanceData && performanceData.plugin_performance) {
            const totalSize = Object.values(performanceData.plugin_performance)
                .reduce((sum, plugin) => sum + (plugin.total_size || 0), 0);
            
            if (totalSize > this.thresholds.resourceSize) {
                issues.push({
                    type: 'large_resource_size',
                    severity: 'high',
                    description: `Total resource size is ${Math.round(totalSize / 1024)}KB (threshold: ${Math.round(this.thresholds.resourceSize / 1024)}KB)`,
                    impact: 'Bandwidth usage, load times, mobile performance',
                    metrics: {
                        current: totalSize,
                        threshold: this.thresholds.resourceSize
                    }
                });
            }
        }

        // Check blocking resources
        if (performanceData && performanceData.plugin_performance) {
            const blockingResources = Object.values(performanceData.plugin_performance)
                .reduce((sum, plugin) => sum + (plugin.blocking_resources || 0), 0);
            
            if (blockingResources > this.thresholds.blockingResources) {
                issues.push({
                    type: 'blocking_resources',
                    severity: 'medium',
                    description: `${blockingResources} blocking resources detected (threshold: ${this.thresholds.blockingResources})`,
                    impact: 'Render-blocking, perceived performance',
                    metrics: {
                        current: blockingResources,
                        threshold: this.thresholds.blockingResources
                    }
                });
            }
        }

        // Check for unused CSS/JS
        if (performanceData && performanceData.usage_analysis) {
            const unusedCSS = performanceData.usage_analysis.unused_css_ratio || 0;
            const unusedJS = performanceData.usage_analysis.unused_js_ratio || 0;
            
            if (unusedCSS > this.thresholds.unusedCSS) {
                issues.push({
                    type: 'unused_css',
                    severity: 'medium',
                    description: `${Math.round(unusedCSS * 100)}% of CSS is unused`,
                    impact: 'Bandwidth waste, slower load times',
                    metrics: {
                        current: unusedCSS,
                        threshold: this.thresholds.unusedCSS
                    }
                });
            }
            
            if (unusedJS > this.thresholds.unusedJS) {
                issues.push({
                    type: 'unused_js',
                    severity: 'medium',
                    description: `${Math.round(unusedJS * 100)}% of JavaScript is unused`,
                    impact: 'Bandwidth waste, slower load times',
                    metrics: {
                        current: unusedJS,
                        threshold: this.thresholds.unusedJS
                    }
                });
            }
        }

        // Check for missing caching
        if (!this.hasCachingPlugin(siteData.plugins)) {
            issues.push({
                type: 'no_caching',
                severity: 'high',
                description: 'No caching plugin detected',
                impact: 'Slower page loads, higher server load',
                metrics: {
                    current: 0,
                    threshold: 1
                }
            });
        }

        // Check for missing image optimization
        if (!this.hasImageOptimizationPlugin(siteData.plugins)) {
            issues.push({
                type: 'no_image_optimization',
                severity: 'medium',
                description: 'No image optimization plugin detected',
                impact: 'Larger file sizes, slower load times',
                metrics: {
                    current: 0,
                    threshold: 1
                }
            });
        }

        // Check for missing minification
        if (!this.hasMinificationPlugin(siteData.plugins)) {
            issues.push({
                type: 'no_minification',
                severity: 'medium',
                description: 'No minification plugin detected',
                impact: 'Larger file sizes, slower load times',
                metrics: {
                    current: 0,
                    threshold: 1
                }
            });
        }

        return issues;
    }

    /**
     * Generate recommendations for a specific issue
     * @param {Object} issue - Performance issue
     * @param {Object} siteData - Site data
     * @returns {Array} Recommendations for the issue
     */
    async generateRecommendationsForIssue(issue, siteData) {
        const recommendations = [];

        switch (issue.type) {
            case 'slow_page_load':
            case 'no_caching':
                recommendations.push(...this.getCachingRecommendations(issue.severity));
                break;
                
            case 'large_resource_size':
            case 'no_minification':
                recommendations.push(...this.getMinificationRecommendations(issue.severity));
                break;
                
            case 'unused_css':
            case 'unused_js':
                recommendations.push(...this.getMinificationRecommendations('medium'));
                break;
                
            case 'no_image_optimization':
                recommendations.push(...this.getImageOptimizationRecommendations(issue.severity));
                break;
                
            case 'blocking_resources':
                recommendations.push(...this.getLazyLoadingRecommendations());
                break;
        }

        // Add context to recommendations
        recommendations.forEach(rec => {
            rec.issue_context = issue;
            rec.reason = this.getRecommendationReason(issue, rec);
        });

        return recommendations;
    }

    /**
     * Get caching plugin recommendations
     * @param {string} severity - Issue severity
     * @returns {Array} Caching recommendations
     */
    getCachingRecommendations(severity) {
        const recommendations = [];
        
        if (severity === 'high') {
            recommendations.push(...this.recommendations.caching.high);
        } else {
            recommendations.push(...this.recommendations.caching.medium);
        }
        
        return recommendations;
    }

    /**
     * Get minification plugin recommendations
     * @param {string} severity - Issue severity
     * @returns {Array} Minification recommendations
     */
    getMinificationRecommendations(severity) {
        const recommendations = [];
        
        if (severity === 'high') {
            recommendations.push(...this.recommendations.minification.high);
        } else {
            recommendations.push(...this.recommendations.minification.medium || []);
        }
        
        return recommendations;
    }

    /**
     * Get image optimization plugin recommendations
     * @param {string} severity - Issue severity
     * @returns {Array} Image optimization recommendations
     */
    getImageOptimizationRecommendations(severity) {
        const recommendations = [];
        
        if (severity === 'high') {
            recommendations.push(...this.recommendations.imageOptimization.high);
        } else {
            recommendations.push(...this.recommendations.imageOptimization.medium);
        }
        
        return recommendations;
    }

    /**
     * Get lazy loading plugin recommendations
     * @returns {Array} Lazy loading recommendations
     */
    getLazyLoadingRecommendations() {
        return [...this.recommendations.lazyLoading.medium];
    }

    /**
     * Get recommendation reason
     * @param {Object} issue - Performance issue
     * @param {Object} recommendation - Plugin recommendation
     * @returns {string} Reason for recommendation
     */
    getRecommendationReason(issue, recommendation) {
        const reasons = {
            'slow_page_load': `This plugin will help reduce page load time from ${issue.metrics.current}ms`,
            'no_caching': 'Caching will significantly improve page load times and reduce server load',
            'large_resource_size': `This plugin will help reduce the ${Math.round(issue.metrics.current / 1024)}KB resource size`,
            'no_minification': 'Minification will reduce file sizes and improve load times',
            'unused_css': `This plugin will help remove the ${Math.round(issue.metrics.current * 100)}% unused CSS`,
            'unused_js': `This plugin will help remove the ${Math.round(issue.metrics.current * 100)}% unused JavaScript`,
            'no_image_optimization': 'Image optimization will reduce file sizes and improve load times',
            'blocking_resources': `This plugin will help optimize the ${issue.metrics.current} blocking resources`
        };
        
        return reasons[issue.type] || 'This plugin will help improve overall site performance';
    }

    /**
     * Calculate performance score
     * @param {Object} performanceData - Performance data
     * @param {Array} issues - Identified issues
     * @returns {number} Performance score (0-100)
     */
    calculatePerformanceScore(performanceData, issues) {
        let score = 100;
        
        // Deduct points for each issue
        issues.forEach(issue => {
            switch (issue.severity) {
                case 'high':
                    score -= 20;
                    break;
                case 'medium':
                    score -= 10;
                    break;
                case 'low':
                    score -= 5;
                    break;
            }
        });
        
        // Bonus points for good performance
        if (performanceData && performanceData.main_page_timing && performanceData.main_page_timing.load_time < 2000) {
            score += 10;
        }
        
        if (performanceData && performanceData.plugin_performance) {
            const totalSize = Object.values(performanceData.plugin_performance)
                .reduce((sum, plugin) => sum + (plugin.total_size || 0), 0);
            
            if (totalSize < 200000) { // Less than 200KB
                score += 10;
            }
        }
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate performance summary
     * @param {Object} recommendations - Recommendations object
     * @returns {string} Performance summary
     */
    generatePerformanceSummary(recommendations) {
        const issueCount = recommendations.issues.length;
        const recCount = recommendations.recommendations.length;
        const score = recommendations.score;
        
        if (score >= 80) {
            return `Excellent performance! Only ${issueCount} minor issues found. ${recCount} optimization recommendations available.`;
        } else if (score >= 60) {
            return `Good performance with room for improvement. ${issueCount} issues found. ${recCount} optimization recommendations available.`;
        } else if (score >= 40) {
            return `Performance needs attention. ${issueCount} significant issues found. ${recCount} optimization recommendations available.`;
        } else {
            return `Performance requires immediate attention. ${issueCount} critical issues found. ${recCount} optimization recommendations available.`;
        }
    }

    /**
     * Check if site has caching plugin
     * @param {Array} plugins - Detected plugins
     * @returns {boolean} Has caching plugin
     */
    hasCachingPlugin(plugins) {
        const cachingPlugins = ['wp-rocket', 'w3-total-cache', 'wp-super-cache', 'litespeed-cache', 'wp-fastest-cache'];
        return plugins.some(plugin => cachingPlugins.includes(plugin.slug));
    }

    /**
     * Check if site has image optimization plugin
     * @param {Array} plugins - Detected plugins
     * @returns {boolean} Has image optimization plugin
     */
    hasImageOptimizationPlugin(plugins) {
        const imagePlugins = ['smush', 'shortpixel', 'imagify', 'ewww-image-optimizer', 'wp-smushit'];
        return plugins.some(plugin => imagePlugins.includes(plugin.slug));
    }

    /**
     * Check if site has minification plugin
     * @param {Array} plugins - Detected plugins
     * @returns {boolean} Has minification plugin
     */
    hasMinificationPlugin(plugins) {
        const minificationPlugins = ['autoptimize', 'wp-rocket', 'w3-total-cache'];
        return plugins.some(plugin => minificationPlugins.includes(plugin.slug));
    }

    /**
     * Get plugin alternatives
     * @param {string} pluginSlug - Plugin slug
     * @returns {Array} Alternative plugins
     */
    getPluginAlternatives(pluginSlug) {
        // Find plugin in recommendations and return alternatives
        for (const category of Object.values(this.recommendations)) {
            for (const priority of Object.values(category)) {
                for (const plugin of priority) {
                    if (plugin.plugin === pluginSlug && plugin.alternatives) {
                        return plugin.alternatives;
                    }
                }
            }
        }
        return [];
    }

    /**
     * Estimate performance improvement
     * @param {Object} recommendation - Plugin recommendation
     * @param {Object} currentPerformance - Current performance data
     * @returns {Object} Estimated improvement
     */
    estimatePerformanceImprovement(recommendation, currentPerformance) {
        const improvements = {
            'wp-rocket': {
                pageLoadTime: -0.4, // 40% improvement
                resourceSize: -0.3, // 30% improvement
                blockingResources: -0.6 // 60% improvement
            },
            'w3-total-cache': {
                pageLoadTime: -0.35,
                resourceSize: -0.25,
                blockingResources: -0.5
            },
            'autoptimize': {
                resourceSize: -0.4,
                blockingResources: -0.3
            },
            'smush': {
                resourceSize: -0.2 // 20% improvement for images
            }
        };

        const pluginImprovements = improvements[recommendation.plugin] || {};
        const estimated = {};

        if (currentPerformance.main_page_timing && pluginImprovements.pageLoadTime) {
            estimated.pageLoadTime = Math.round(
                currentPerformance.main_page_timing.load_time * (1 + pluginImprovements.pageLoadTime)
            );
        }

        if (currentPerformance.plugin_performance && pluginImprovements.resourceSize) {
            const totalSize = Object.values(currentPerformance.plugin_performance)
                .reduce((sum, plugin) => sum + (plugin.total_size || 0), 0);
            estimated.resourceSize = Math.round(totalSize * (1 + pluginImprovements.resourceSize));
        }

        return estimated;
    }
}

module.exports = PerformanceRecommendationEngine;

