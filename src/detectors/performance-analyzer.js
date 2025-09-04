// File: ./src/detectors/performance-analyzer.js

/**
 * WordPress Plugin Performance Analyzer
 * Analyzes the performance impact of WordPress plugins and provides actionable insights
 */

const axios = require('axios');
const cheerio = require('cheerio');

class PerformanceAnalyzer {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.performanceData = {};
        this.session = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
    }

    /**
     * Fetch page with timing measurements
     * @param {string} url - URL to fetch
     * @returns {Object} Page content and timing data
     */
    async fetchPageWithTiming(url = null) {
        const targetUrl = url || this.baseUrl;
        const startTime = Date.now();
        
        try {
            const response = await axios.get(targetUrl, {
                headers: this.session.headers,
                timeout: 30000,
                validateStatus: () => true
            });
            
            const totalTime = (Date.now() - startTime) / 1000;
            
            const timing = {
                total_time: totalTime,
                response_time: totalTime,
                content_length: response.data.length,
                status_code: response.status
            };
            
            return { content: response.data, timing };
        } catch (error) {
            console.error(`Error fetching ${targetUrl}:`, error.message);
            return { content: null, timing: null };
        }
    }

    /**
     * Extract plugin name from URL
     * @param {string} url - Resource URL
     * @returns {string|null} Plugin name
     */
    extractPluginNameFromUrl(url) {
        const match = url.match(/\/wp-content\/plugins\/([^\/]+)\//);
        return match ? match[1] : null;
    }

    /**
     * Analyze resource file performance
     * @param {string} url - Resource URL
     * @param {string} fileType - File type (css/js)
     * @returns {Object|null} Resource performance data
     */
    async analyzeResourceFile(url, fileType) {
        if (!url.startsWith('http')) {
            url = new URL(url, this.baseUrl).href;
        }
        
        const startTime = Date.now();
        try {
            const response = await axios.head(url, {
                headers: this.session.headers,
                timeout: 10000,
                validateStatus: () => true
            });
            
            const loadTime = (Date.now() - startTime) / 1000;
            
            if (response.status === 200) {
                let size = parseInt(response.headers['content-length'] || '0');
                
                // If HEAD doesn't give size, try GET with range
                if (size === 0) {
                    try {
                        const getResponse = await axios.get(url, {
                            headers: this.session.headers,
                            timeout: 10000,
                            validateStatus: () => true
                        });
                        size = getResponse.data.length;
                    } catch (error) {
                        size = 0;
                    }
                }
                
                return {
                    url: url,
                    filename: url.split('/').pop().split('?')[0],
                    size: size,
                    size_kb: Math.round(size / 1024 * 100) / 100,
                    load_time: Math.round(loadTime * 1000) / 1000,
                    type: fileType,
                    status: response.status
                };
            }
        } catch (error) {
            // Silently fail for resource analysis
        }
        
        return null;
    }

    /**
     * Analyze plugin resource performance
     * @param {string} html - Page HTML content
     * @returns {Object} Plugin performance data
     */
    async analyzeResourcePerformance(html) {
        const $ = cheerio.load(html);
        const pluginResources = new Map();
        
        // Helper function to get default plugin data
        const getDefaultPluginData = () => ({
            css_files: [],
            js_files: [],
            css_size: 0,
            js_size: 0,
            css_load_time: 0,
            js_load_time: 0,
            total_requests: 0,
            blocking_resources: 0,
            total_size: 0
        });
        
        // Analyze CSS files
        const cssPromises = [];
        $('link[rel="stylesheet"]').each((i, link) => {
            const href = $(link).attr('href');
            if (href && href.includes('/wp-content/plugins/')) {
                const pluginName = this.extractPluginNameFromUrl(href);
                if (pluginName) {
                    cssPromises.push(this.analyzeResourceFile(href, 'css').then(fileInfo => ({
                        pluginName,
                        fileInfo,
                        media: $(link).attr('media')
                    })));
                }
            }
        });
        
        // Analyze JavaScript files
        const jsPromises = [];
        $('script[src]').each((i, script) => {
            const src = $(script).attr('src');
            if (src && src.includes('/wp-content/plugins/')) {
                const pluginName = this.extractPluginNameFromUrl(src);
                if (pluginName) {
                    jsPromises.push(this.analyzeResourceFile(src, 'js').then(fileInfo => ({
                        pluginName,
                        fileInfo,
                        async: $(script).attr('async'),
                        defer: $(script).attr('defer')
                    })));
                }
            }
        });
        
        // Wait for all resource analysis to complete
        const allResults = await Promise.allSettled([...cssPromises, ...jsPromises]);
        
        // Process CSS results
        allResults.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                const { pluginName, fileInfo, media, async, defer } = result.value;
                
                if (!pluginResources.has(pluginName)) {
                    pluginResources.set(pluginName, getDefaultPluginData());
                }
                
                const pluginData = pluginResources.get(pluginName);
                
                if (fileInfo.type === 'css') {
                    pluginData.css_files.push(fileInfo);
                    pluginData.css_size += fileInfo.size;
                    pluginData.css_load_time += fileInfo.load_time;
                    pluginData.total_requests += 1;
                    pluginData.total_size += fileInfo.size;
                    
                    // Check if it's render-blocking
                    if (!media || media === 'all') {
                        pluginData.blocking_resources += 1;
                    }
                } else if (fileInfo.type === 'js') {
                    pluginData.js_files.push(fileInfo);
                    pluginData.js_size += fileInfo.size;
                    pluginData.js_load_time += fileInfo.load_time;
                    pluginData.total_requests += 1;
                    pluginData.total_size += fileInfo.size;
                    
                    // Check if it's render-blocking (no async/defer)
                    if (!async && !defer) {
                        pluginData.blocking_resources += 1;
                    }
                }
            }
        });
        
        return Object.fromEntries(pluginResources);
    }

    /**
     * Detect unused CSS/JS resources
     * @param {string} html - Page HTML content
     * @returns {Object} Usage analysis data
     */
    detectUnusedCssJs(html) {
        const $ = cheerio.load(html);
        const pluginUsage = new Map();
        
        const getDefaultUsageData = () => ({
            css_rules_used: 0,
            js_functions_called: 0,
            likely_unused: false,
            page_specific: false
        });
        
        // Simple heuristic: check if plugin CSS classes exist in HTML
        $('link[rel="stylesheet"]').each((i, link) => {
            const href = $(link).attr('href');
            if (href && href.includes('/wp-content/plugins/')) {
                const pluginName = this.extractPluginNameFromUrl(href);
                if (pluginName) {
                    if (!pluginUsage.has(pluginName)) {
                        pluginUsage.set(pluginName, getDefaultUsageData());
                    }
                    
                    // Check if plugin-related classes exist in HTML
                    const pluginClasses = this.findPluginCssUsage(html, pluginName);
                    const usageData = pluginUsage.get(pluginName);
                    usageData.css_rules_used = pluginClasses.length;
                    
                    // If no classes found, likely unused on this page
                    if (pluginClasses.length === 0) {
                        usageData.likely_unused = true;
                    }
                }
            }
        });
        
        return Object.fromEntries(pluginUsage);
    }

    /**
     * Find plugin CSS usage in HTML
     * @param {string} html - Page HTML content
     * @param {string} pluginName - Plugin name
     * @returns {Array} Found CSS classes
     */
    findPluginCssUsage(html, pluginName) {
        const patterns = [
            pluginName,
            pluginName.replace(/-/g, '_'),
            pluginName.replace(/_/g, '-'),
            pluginName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
        ];
        
        const foundClasses = new Set();
        for (const pattern of patterns) {
            const regex = new RegExp(`class="[^"]*${pattern}[^"]*"`, 'gi');
            const matches = html.match(regex) || [];
            matches.forEach(match => foundClasses.add(match));
        }
        
        return Array.from(foundClasses);
    }

    /**
     * Calculate performance score for a plugin
     * @param {Object} pluginData - Plugin performance data
     * @returns {number} Performance score (0-100, higher = worse)
     */
    calculatePerformanceScore(pluginData) {
        let score = 0;
        
        // Size penalty (larger files = higher score)
        const sizeMb = pluginData.total_size / (1024 * 1024);
        score += Math.min(sizeMb * 20, 40); // Max 40 points for size
        
        // Request count penalty
        score += Math.min(pluginData.total_requests * 5, 20); // Max 20 points for requests
        
        // Blocking resources penalty
        score += Math.min(pluginData.blocking_resources * 15, 30); // Max 30 points for blocking
        
        return Math.min(Math.floor(score), 100);
    }

    /**
     * Identify optimization opportunities
     * @param {Object} performanceData - Plugin performance data
     * @returns {Object} Optimization opportunities
     */
    identifyOptimizationOpportunities(performanceData) {
        const opportunities = {
            high_impact_plugins: [],
            unused_resources: [],
            render_blocking: [],
            large_files: [],
            unnecessary_loading: []
        };
        
        for (const [pluginName, data] of Object.entries(performanceData)) {
            // High impact plugins (score > 50)
            if (data.performance_score > 50) {
                opportunities.high_impact_plugins.push({
                    plugin: pluginName,
                    score: data.performance_score,
                    total_size_kb: Math.round(data.total_size / 1024 * 100) / 100,
                    requests: data.total_requests
                });
            }
            
            // Render-blocking resources
            if (data.blocking_resources > 0) {
                opportunities.render_blocking.push({
                    plugin: pluginName,
                    blocking_resources: data.blocking_resources,
                    css_blocking: data.css_files.filter(f => !f.media || f.media === 'all').length,
                    js_blocking: data.js_files.filter(f => !f.async && !f.defer).length
                });
            }
            
            // Large files
            if (data.total_size > 100 * 1024) { // > 100KB
                opportunities.large_files.push({
                    plugin: pluginName,
                    size_kb: Math.round(data.total_size / 1024 * 100) / 100,
                    files: data.total_requests
                });
            }
        }
        
        return opportunities;
    }

    /**
     * Generate actionable recommendations
     * @param {Object} performanceData - Performance analysis data
     * @returns {Array} Actionable recommendations
     */
    generateRecommendations(performanceData) {
        const recommendations = [];
        const opportunities = this.identifyOptimizationOpportunities(performanceData);
        
        // High impact plugins
        if (opportunities.high_impact_plugins.length > 0) {
            const worstPlugin = opportunities.high_impact_plugins[0];
            recommendations.push({
                priority: 'high',
                category: 'performance',
                title: 'Optimize High-Impact Plugin',
                description: `${worstPlugin.plugin} is significantly impacting page performance`,
                action: `Consider optimizing ${worstPlugin.plugin} or finding a lighter alternative`,
                impact: 'High - Can improve page load time by 20-40%',
                effort: 'Medium - Requires plugin configuration or replacement'
            });
        }
        
        // Render-blocking resources
        if (opportunities.render_blocking.length > 0) {
            const blockingPlugin = opportunities.render_blocking[0];
            recommendations.push({
                priority: 'medium',
                category: 'performance',
                title: 'Reduce Render-Blocking Resources',
                description: `${blockingPlugin.plugin} has ${blockingPlugin.blocking_resources} render-blocking resources`,
                action: 'Add async/defer attributes to JavaScript files and optimize CSS loading',
                impact: 'Medium - Can improve First Contentful Paint by 15-30%',
                effort: 'Low - Requires theme/plugin configuration'
            });
        }
        
        // Large files
        if (opportunities.large_files.length > 0) {
            const largePlugin = opportunities.large_files[0];
            recommendations.push({
                priority: 'medium',
                category: 'performance',
                title: 'Optimize Large Plugin Files',
                description: `${largePlugin.plugin} has ${largePlugin.size_kb}KB of resources`,
                action: 'Enable compression, minification, and consider CDN for static assets',
                impact: 'Medium - Can reduce bandwidth usage and improve load times',
                effort: 'Low - Can be automated with caching plugins'
            });
        }
        
        // General recommendations
        if (Object.keys(performanceData).length > 5) {
            recommendations.push({
                priority: 'low',
                category: 'performance',
                title: 'Consider Plugin Audit',
                description: 'Multiple plugins detected that may impact performance',
                action: 'Review and remove unnecessary plugins, consolidate functionality',
                impact: 'High - Can significantly improve overall site performance',
                effort: 'High - Requires careful testing and planning'
            });
        }
        
        return recommendations;
    }

    /**
     * Run comprehensive performance analysis
     * @returns {Object} Complete performance analysis data
     */
    async analyze() {
        console.log('🔍 Starting plugin performance analysis...');
        
        // Step 1: Basic page analysis
        const { content, timing } = await this.fetchPageWithTiming();
        if (!content) {
            return null;
        }
        
        // Step 2: Plugin resource performance
        const performanceData = await this.analyzeResourcePerformance(content);
        
        // Step 3: Usage analysis
        const usageAnalysis = this.detectUnusedCssJs(content);
        
        // Step 4: Calculate performance scores
        for (const [pluginName, data] of Object.entries(performanceData)) {
            data.performance_score = this.calculatePerformanceScore(data);
        }
        
        // Step 5: Generate recommendations
        const recommendations = this.generateRecommendations(performanceData);
        
        // Combine all data
        this.performanceData = {
            main_page_timing: timing,
            plugin_performance: performanceData,
            usage_analysis: usageAnalysis,
            optimization_opportunities: this.identifyOptimizationOpportunities(performanceData),
            recommendations: recommendations
        };
        
        return this.performanceData;
    }
}

module.exports = PerformanceAnalyzer;

