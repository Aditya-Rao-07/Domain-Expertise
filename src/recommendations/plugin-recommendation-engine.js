// File: ./src/recommendations/plugin-recommendation-engine.js

const EnhancedAssetInspector = require('../detectors/enhanced-asset-inspector');
const PerformanceRecommendationEngine = require('./performance-recommendation-engine');
const FunctionalityGapAnalyzer = require('../analysis/functionality-gap-analyzer');
const PSIRecommendationEngine = require('./psi-recommendation-engine');
const HttpClient = require('../utils/http-client');

/**
 * Main Plugin Recommendation Engine
 * Integrates enhanced asset analysis, performance recommendations, and functionality gap analysis
 */
class PluginRecommendationEngine {
    constructor(httpClient) {
        this.httpClient = httpClient || new HttpClient();
        
        // Initialize components
        this.assetInspector = new EnhancedAssetInspector(this.httpClient);
        this.performanceEngine = new PerformanceRecommendationEngine(this.httpClient);
        this.functionalityAnalyzer = new FunctionalityGapAnalyzer(this.httpClient);
        this.psiEngine = new PSIRecommendationEngine();
        
        // Recommendation weights
        this.weights = {
            performance: 0.4,    // 40% weight
            functionality: 0.35, // 35% weight
            compatibility: 0.15, // 15% weight
            popularity: 0.1      // 10% weight
        };
    }

    /**
     * Generate comprehensive plugin recommendations
     * @param {string} baseUrl - Base URL of the site
     * @param {Object} $ - Cheerio instance
     * @param {string} html - Raw HTML content
     * @param {Object} siteData - General site data (plugins, theme, version, etc.)
     * @param {Object} performanceData - Performance analysis data
     * @returns {Object} Comprehensive recommendations
     */
    async generateRecommendations(baseUrl, $, html, siteData, performanceData) {
        console.log('🚀 Starting comprehensive plugin recommendation analysis...');
        
        const recommendations = {
            timestamp: new Date().toISOString(),
            site: {
                url: baseUrl,
                wordpress_version: siteData.version?.version || 'unknown',
                theme: siteData.theme?.name || 'unknown',
                detected_plugins: siteData.plugins?.length || 0
            },
            analysis: {
                enhanced_asset_analysis: null,
                performance_analysis: null,
                functionality_analysis: null
            },
            recommendations: {
                performance: [],
                functionality: [],
                compatibility: [],
                optimization: []
            },
            summary: {
                total_recommendations: 0,
                priority_breakdown: { high: 0, medium: 0, low: 0 },
                estimated_impact: 'medium',
                implementation_effort: 'medium'
            }
        };

        try {
            // Step 1: Enhanced Asset Analysis
            console.log('📊 Step 1: Enhanced asset analysis...');
            recommendations.analysis.enhanced_asset_analysis = await this.performEnhancedAssetAnalysis(baseUrl, $, html);
            
            // Step 2: Performance Analysis
            console.log('⚡ Step 2: Performance analysis...');
            recommendations.analysis.performance_analysis = await this.performanceEngine.analyzePerformanceAndRecommend(performanceData, siteData);
            
            // Step 3: Functionality Gap Analysis (TEMPORARILY DISABLED)
            console.log('🔍 Step 3: Functionality gap analysis... (DISABLED)');
            // recommendations.analysis.functionality_analysis = await this.functionalityAnalyzer.analyzeFunctionality(baseUrl, $, html, siteData.plugins || []);
            
            // Provide empty functionality analysis to maintain structure
            recommendations.analysis.functionality_analysis = {
                detected: {},
                missing: {},
                recommendations: [],
                score: 100,
                summary: 'Functionality analysis temporarily disabled'
            };
            
            // Step 4: Generate PSI-based recommendations
            console.log('🎯 Step 4: Generating PSI-based recommendations...');
            const psiRecommendations = this.generatePSIRecommendations(performanceData);
            recommendations.analysis.psi_recommendations = psiRecommendations;
            
            // Step 5: Generate Integrated Recommendations
            console.log('🎯 Step 5: Generating integrated recommendations...');
            recommendations.recommendations = await this.generateIntegratedRecommendations(recommendations.analysis, siteData);
            
            // Step 5: Calculate Summary
            console.log('📋 Step 5: Calculating summary...');
            recommendations.summary = this.calculateRecommendationSummary(recommendations.recommendations);
            
            console.log(`✅ Recommendation analysis complete: ${recommendations.summary.total_recommendations} total recommendations generated`);
            
        } catch (error) {
            console.error('❌ Error in recommendation generation:', error);
            recommendations.error = error.message;
        }

        return recommendations;
    }

    /**
     * Perform enhanced asset analysis
     * @param {string} baseUrl - Base URL
     * @param {Object} $ - Cheerio instance
     * @param {string} html - HTML content
     * @returns {Object} Enhanced asset analysis results
     */
    async performEnhancedAssetAnalysis(baseUrl, $, html) {
        try {
            // Extract asset URLs from HTML (resolved against baseUrl)
            const assetUrls = this.extractAssetUrls($, baseUrl);
            
            // Perform enhanced inspection
            const inspectionResults = await this.assetInspector.inspectAssetsEnhanced(assetUrls);
            
            // Analyze results
            const analysis = {
                total_assets: assetUrls.length,
                inspected_assets: inspectionResults.length,
                plugin_signatures: [],
                performance_insights: [],
                security_insights: [],
                optimization_opportunities: []
            };

            // Process inspection results
            for (const result of inspectionResults) {
                if (result.signatures && result.signatures.length > 0) {
                    analysis.plugin_signatures.push(...result.signatures);
                }
                
                if (result.performance) {
                    analysis.performance_insights.push({
                        url: result.url,
                        size: result.performance.size,
                        is_minified: result.performance.isMinified,
                        has_optimization: result.performance.hasMinification
                    });
                }
                
                if (result.fingerprint) {
                    if (result.fingerprint.hasSecurityHeaders) {
                        analysis.security_insights.push({
                            url: result.url,
                            security_features: ['security_headers']
                        });
                    }
                }
            }

            // Identify optimization opportunities
            analysis.optimization_opportunities = this.identifyOptimizationOpportunities(inspectionResults);

            return analysis;
        } catch (error) {
            console.warn('Enhanced asset analysis failed:', error.message);
            return { error: error.message };
        }
    }

    /**
     * Extract asset URLs from HTML
     * @param {Object} $ - Cheerio instance
     * @param {string} baseUrl - Base URL to resolve relative URLs
     * @returns {Array} Array of asset URLs
     */
    extractAssetUrls($, baseUrl) {
        const assetUrls = [];
        
        // Extract CSS files
        $('link[rel="stylesheet"]').each((i, link) => {
            const href = $(link).attr('href');
            if (href && (href.includes('/wp-content/') || href.includes('.css'))) {
                // Convert relative/protocol-relative URLs to absolute using baseUrl
                const absoluteUrl = this.resolveUrl(baseUrl, href);
                if (absoluteUrl) {
                    assetUrls.push(absoluteUrl);
                }
            }
        });
        
        // Extract JavaScript files
        $('script[src]').each((i, script) => {
            const src = $(script).attr('src');
            if (src && (src.includes('/wp-content/') || src.includes('.js'))) {
                // Convert relative/protocol-relative URLs to absolute using baseUrl
                const absoluteUrl = this.resolveUrl(baseUrl, src);
                if (absoluteUrl) {
                    assetUrls.push(absoluteUrl);
                }
            }
        });
        
        return assetUrls;
    }

    /**
     * Resolve URL against baseUrl. Supports protocol-relative (//) and relative paths.
     * @param {string} baseUrl
     * @param {string} url
     * @returns {string|null}
     */
    resolveUrl(baseUrl, url) {
        try {
            // Protocol-relative
            if (url.startsWith('//')) {
                return 'https:' + url;
            }

            // Absolute or relative with base
            const resolved = new URL(url, baseUrl).toString();
            // Normalize potential double slashes in path (keep protocol part)
            return resolved.replace(/([^:]\/)\/+/g, '$1/');
        } catch (error) {
            console.warn(`Failed to resolve URL ${url} against ${baseUrl}:`, error.message);
            return null;
        }
    }

    /**
     * Identify optimization opportunities from asset analysis
     * @param {Array} inspectionResults - Asset inspection results
     * @returns {Array} Optimization opportunities
     */
    identifyOptimizationOpportunities(inspectionResults) {
        const opportunities = [];
        
        for (const result of inspectionResults) {
            if (result.performance) {
                // Large file size
                if (result.performance.size > 100000) { // 100KB
                    opportunities.push({
                        type: 'large_file_size',
                        url: result.url,
                        size: result.performance.size,
                        recommendation: 'Consider minification or compression'
                    });
                }
                
                // Unminified files
                if (!result.performance.isMinified && result.url.includes('.js')) {
                    opportunities.push({
                        type: 'unminified_js',
                        url: result.url,
                        recommendation: 'Minify JavaScript file'
                    });
                }
                
                // Missing optimization
                if (!result.performance.hasMinification) {
                    opportunities.push({
                        type: 'missing_optimization',
                        url: result.url,
                        recommendation: 'Apply optimization techniques'
                    });
                }
            }
        }
        
        return opportunities;
    }

    /**
     * Generate integrated recommendations from all analyses
     * @param {Object} analysis - Combined analysis results
     * @param {Object} siteData - Site data
     * @returns {Object} Integrated recommendations
     */
    async generateIntegratedRecommendations(analysis, siteData) {
        try {
            const recommendations = {
                performance: [],
                functionality: [],
                compatibility: [],
                optimization: []
            };

            // Performance recommendations
            try {
                if (analysis.performance_analysis && analysis.performance_analysis.recommendations) {
                    recommendations.performance = analysis.performance_analysis.recommendations.map(rec => ({
                        ...rec,
                        source: 'performance_analysis',
                        weight: this.weights.performance
                    }));
                }
            } catch (error) {
                console.warn('Error processing performance recommendations:', error.message);
            }

            // Functionality recommendations
            try {
                if (analysis.functionality_analysis && analysis.functionality_analysis.recommendations) {
                    recommendations.functionality = analysis.functionality_analysis.recommendations.map(rec => ({
                        ...rec,
                        source: 'functionality_analysis',
                        weight: this.weights.functionality
                    }));
                }
            } catch (error) {
                console.warn('Error processing functionality recommendations:', error.message);
            }

            // Compatibility recommendations
            try {
                recommendations.compatibility = await this.generateCompatibilityRecommendations(siteData);
            } catch (error) {
                console.warn('Error generating compatibility recommendations:', error.message);
            }

            // Optimization recommendations
            try {
                recommendations.optimization = this.generateOptimizationRecommendations(analysis, siteData);
            } catch (error) {
                console.warn('Error generating optimization recommendations:', error.message);
            }

            // Remove duplicates and merge similar recommendations
            try {
                return this.mergeAndDeduplicateRecommendations(recommendations);
            } catch (error) {
                console.warn('Error merging recommendations:', error.message);
                return recommendations; // Return unmerged recommendations as fallback
            }
        } catch (error) {
            console.error('Critical error in generateIntegratedRecommendations:', error.message);
            return {
                performance: [],
                functionality: [],
                compatibility: [],
                optimization: []
            };
        }
    }

    /**
     * Generate compatibility recommendations
     * @param {Object} siteData - Site data
     * @returns {Array} Compatibility recommendations
     */
    async generateCompatibilityRecommendations(siteData) {
        const recommendations = [];
        
        // Check WordPress version compatibility
        if (siteData.version && siteData.version.version) {
            const wpVersion = siteData.version.version;
            const isOutdated = this.isWordPressVersionOutdated(wpVersion);
            
            if (isOutdated) {
                recommendations.push({
                    plugin: 'wordpress-core-update',
                    name: 'WordPress Core Update',
                    category: 'compatibility',
                    priority: 'high',
                    description: 'Update WordPress to the latest version for security and compatibility',
                    reason: `Current version ${wpVersion} may have security vulnerabilities`,
                    source: 'compatibility_analysis',
                    weight: this.weights.compatibility
                });
            }
        }

        // Check plugin compatibility
        if (siteData.plugins) {
            for (const plugin of siteData.plugins) {
                if (plugin.isOutdated === true) {
                    recommendations.push({
                        plugin: plugin.slug,
                        name: plugin.name,
                        category: 'compatibility',
                        priority: 'medium',
                        description: `Update ${plugin.name} to the latest version`,
                        reason: 'Plugin is outdated and may have compatibility issues',
                        source: 'compatibility_analysis',
                        weight: this.weights.compatibility
                    });
                }
            }
        }

        return recommendations;
    }

    /**
     * Generate optimization recommendations
     * @param {Object} analysis - Analysis results
     * @param {Object} siteData - Site data
     * @returns {Array} Optimization recommendations
     */
    generateOptimizationRecommendations(analysis, siteData) {
        const recommendations = [];
        
        // Based on enhanced asset analysis
        if (analysis.enhanced_asset_analysis && analysis.enhanced_asset_analysis.optimization_opportunities) {
            for (const opportunity of analysis.enhanced_asset_analysis.optimization_opportunities) {
                if (opportunity.type === 'unminified_js') {
                    recommendations.push({
                        plugin: 'autoptimize',
                        name: 'Autoptimize',
                        category: 'optimization',
                        priority: 'medium',
                        description: 'Minify and optimize CSS, JavaScript, and HTML',
                        reason: 'Unminified JavaScript files detected',
                        source: 'asset_analysis',
                        weight: this.weights.performance
                    });
                }
            }
        }

        // Based on detected plugins
        if (siteData.plugins) {
            const hasCaching = siteData.plugins.some(p => ['wp-rocket', 'w3-total-cache', 'wp-super-cache'].includes(p.slug));
            if (!hasCaching) {
                recommendations.push({
                    plugin: 'wp-super-cache',
                    name: 'WP Super Cache',
                    category: 'optimization',
                    priority: 'high',
                    description: 'Simple and effective caching plugin',
                    reason: 'No caching plugin detected',
                    source: 'plugin_analysis',
                    weight: this.weights.performance
                });
            }
        }

        return recommendations;
    }

    /**
     * Generate PSI-based recommendations
     * @param {Object} performanceData - Performance analysis data including PSI
     * @returns {Object} PSI recommendations
     */
    generatePSIRecommendations(performanceData) {
        if (!performanceData?.pagespeed) {
            return { opportunities: [], diagnostics: [], categories: [], summary: null };
        }

        try {
            const psiData = {
                mobile: performanceData.pagespeed.mobile,
                desktop: performanceData.pagespeed.desktop
            };

            // Generate recommendations for both mobile and desktop
            const mobileRecs = psiData.mobile ? this.psiEngine.generateRecommendations(psiData.mobile, {}) : null;
            const desktopRecs = psiData.desktop ? this.psiEngine.generateRecommendations(psiData.desktop, {}) : null;

            // Merge and deduplicate recommendations
            const mergedRecommendations = this.mergePSIRecommendations(mobileRecs, desktopRecs);

            return mergedRecommendations;
        } catch (error) {
            console.warn('PSI recommendation generation failed:', error.message);
            return { opportunities: [], diagnostics: [], categories: [], summary: null };
        }
    }

    /**
     * Merge mobile and desktop PSI recommendations
     * @param {Object} mobileRecs - Mobile recommendations
     * @param {Object} desktopRecs - Desktop recommendations
     * @returns {Object} Merged recommendations
     */
    mergePSIRecommendations(mobileRecs, desktopRecs) {
        if (!mobileRecs && !desktopRecs) {
            return { opportunities: [], diagnostics: [], categories: [], summary: null };
        }

        if (!mobileRecs) return desktopRecs;
        if (!desktopRecs) return mobileRecs;

        // Merge opportunities (prioritize mobile issues)
        const mergedOpportunities = [...(mobileRecs.opportunities || [])];
        const mobileOppIds = new Set(mergedOpportunities.map(r => r.id));
        
        (desktopRecs.opportunities || []).forEach(desktopOpp => {
            if (!mobileOppIds.has(desktopOpp.id)) {
                mergedOpportunities.push(desktopOpp);
            }
        });

        // Merge diagnostics (combine counts)
        const mergedDiagnostics = [...(mobileRecs.diagnostics || [])];
        const mobileDiagIds = new Set(mergedDiagnostics.map(r => r.id));
        
        (desktopRecs.diagnostics || []).forEach(desktopDiag => {
            const existingIndex = mergedDiagnostics.findIndex(r => r.id === desktopDiag.id);
            if (existingIndex >= 0) {
                // Combine counts and take higher priority
                mergedDiagnostics[existingIndex].count = Math.max(
                    mergedDiagnostics[existingIndex].count || 0,
                    desktopDiag.count || 0
                );
                mergedDiagnostics[existingIndex].priority = 
                    mergedDiagnostics[existingIndex].priority === 'high' || desktopDiag.priority === 'high' 
                        ? 'high' : mergedDiagnostics[existingIndex].priority;
            } else {
                mergedDiagnostics.push(desktopDiag);
            }
        });

        // Merge categories (take worst score)
        const mergedCategories = [...(mobileRecs.categories || [])];
        const mobileCatIds = new Set(mergedCategories.map(r => r.id));
        
        (desktopRecs.categories || []).forEach(desktopCat => {
            const existingIndex = mergedCategories.findIndex(r => r.id === desktopCat.id);
            if (existingIndex >= 0) {
                // Take the worse score
                if (desktopCat.current_score < mergedCategories[existingIndex].current_score) {
                    mergedCategories[existingIndex] = desktopCat;
                }
            } else {
                mergedCategories.push(desktopCat);
            }
        });

        // Generate combined summary
        const allRecs = [...mergedOpportunities, ...mergedDiagnostics, ...mergedCategories];
        const summary = {
            total_recommendations: allRecs.length,
            priority_breakdown: {
                high: allRecs.filter(r => r.priority === 'high').length,
                medium: allRecs.filter(r => r.priority === 'medium').length,
                low: allRecs.filter(r => r.priority === 'low').length
            },
            estimated_impact: this.calculateOverallImpact(allRecs),
            implementation_effort: this.calculateImplementationEffort(allRecs)
        };

        return {
            opportunities: mergedOpportunities,
            diagnostics: mergedDiagnostics,
            categories: mergedCategories,
            core_web_vitals: mobileRecs.core_web_vitals || desktopRecs.core_web_vitals || [],
            accessibility: mobileRecs.accessibility || desktopRecs.accessibility || [],
            best_practices: mobileRecs.best_practices || desktopRecs.best_practices || [],
            seo: mobileRecs.seo || desktopRecs.seo || [],
            network: mobileRecs.network || desktopRecs.network || [],
            summary: summary
        };
    }

    /**
     * Calculate enhanced recommendation score based on CWV, plugin quality, and impact
     * @param {Object} recommendation - Recommendation object
     * @param {Object} siteData - Site analysis data
     * @param {Object} performanceData - Performance analysis data
     * @returns {number} Score (0-100)
     */
    calculateEnhancedScore(recommendation, siteData, performanceData) {
        let score = 50; // Base score
        
        // Priority weight (0-30 points)
        const priorityWeights = { high: 30, medium: 15, low: 5 };
        score += priorityWeights[recommendation.priority] || 0;
        
        // Category weight (0-25 points)
        const categoryWeights = {
            performance: 25,
            security: 20,
            functionality: 15,
            optimization: 10,
            maintenance: 5
        };
        score += categoryWeights[recommendation.category] || 0;
        
        // Core Web Vitals impact (0-35 points)
        if (performanceData?.pagespeed) {
            const cwvScore = this.calculateCWVImpact(recommendation, performanceData.pagespeed);
            score += cwvScore;
        }
        
        // Plugin quality impact (0-15 points)
        if (recommendation.plugin_metadata?.quality_score) {
            const qualityScore = this.calculatePluginQualityImpact(recommendation);
            score += qualityScore;
        }
        
        // Performance impact (0-20 points)
        if (performanceData) {
            const perfScore = this.calculatePerformanceImpact(recommendation, performanceData);
            score += perfScore;
        }
        
        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * Calculate Core Web Vitals impact score
     * @param {Object} recommendation - Recommendation object
     * @param {Object} pagespeed - PageSpeed data
     * @returns {number} CWV impact score (0-35)
     */
    calculateCWVImpact(recommendation, pagespeed) {
        let score = 0;
        
        // Only apply to performance/optimization recommendations
        if (recommendation.category !== 'performance' && recommendation.category !== 'optimization') {
            return 0;
        }
        
        // Get worst CWV scores across mobile/desktop
        const mobile = pagespeed.mobile;
        const desktop = pagespeed.desktop;
        
        if (mobile || desktop) {
            const lcp = Math.min(
                mobile?.lcp_ms || Infinity,
                desktop?.lcp_ms || Infinity
            );
            const cls = Math.max(
                mobile?.cls || 0,
                desktop?.cls || 0
            );
            const inp = Math.min(
                mobile?.inp_ms || Infinity,
                desktop?.inp_ms || Infinity
            );
            
            // LCP scoring (0-15 points)
            if (lcp !== Infinity) {
                if (lcp > 4000) score += 15; // Poor LCP
                else if (lcp > 2500) score += 10; // Needs improvement
                else if (lcp > 2000) score += 5; // Good
            }
            
            // CLS scoring (0-10 points)
            if (cls > 0.25) score += 10; // Poor CLS
            else if (cls > 0.1) score += 7; // Needs improvement
            else if (cls > 0.05) score += 3; // Good
            
            // INP scoring (0-10 points)
            if (inp !== Infinity) {
                if (inp > 500) score += 10; // Poor INP
                else if (inp > 200) score += 7; // Needs improvement
                else if (inp > 100) score += 3; // Good
            }
        }
        
        return Math.min(score, 35); // Cap at 35 points
    }

    /**
     * Calculate plugin quality impact score
     * @param {Object} recommendation - Recommendation object
     * @returns {number} Quality impact score (0-15)
     */
    calculatePluginQualityImpact(recommendation) {
        if (!recommendation.plugin_metadata?.quality_score) return 0;
        
        const qualityScore = recommendation.plugin_metadata.quality_score;
        
        // High quality plugins get bonus points
        if (qualityScore >= 80) return 15;
        else if (qualityScore >= 60) return 10;
        else if (qualityScore >= 40) return 5;
        else if (qualityScore >= 20) return 0;
        else return -5; // Low quality plugins get penalty
    }

    /**
     * Calculate performance impact score
     * @param {Object} recommendation - Recommendation object
     * @param {Object} performanceData - Performance data
     * @returns {number} Performance impact score (0-20)
     */
    calculatePerformanceImpact(recommendation, performanceData) {
        let score = 0;
        
        // Check if recommendation is performance-related
        if (recommendation.category !== 'performance' && recommendation.category !== 'optimization') {
            return 0;
        }
        
        // Plugin performance impact
        if (performanceData.plugin_performance) {
            const pluginPerf = performanceData.plugin_performance;
            const totalSize = Object.values(pluginPerf).reduce((sum, p) => sum + (p.total_size || 0), 0);
            const totalLoadTime = Object.values(pluginPerf).reduce((sum, p) => sum + (p.total_load_time || 0), 0);
            
            // Size impact (0-10 points)
            if (totalSize > 500000) score += 10; // >500KB
            else if (totalSize > 200000) score += 7; // >200KB
            else if (totalSize > 100000) score += 5; // >100KB
            else if (totalSize > 50000) score += 3; // >50KB
            
            // Load time impact (0-10 points)
            if (totalLoadTime > 1000) score += 10; // >1s
            else if (totalLoadTime > 500) score += 7; // >500ms
            else if (totalLoadTime > 200) score += 5; // >200ms
            else if (totalLoadTime > 100) score += 3; // >100ms
        }
        
        return Math.min(score, 20); // Cap at 20 points
    }

    /**
     * Calculate overall impact from recommendations
     * @param {Array} recommendations - Array of recommendations
     * @returns {string} Impact level
     */
    calculateOverallImpact(recommendations) {
        const highCount = recommendations.filter(r => r.priority === 'high').length;
        const total = recommendations.length;
        if (total === 0) return 'low';
        const highRatio = highCount / total;
        if (highRatio > 0.5) return 'high';
        if (highRatio > 0.2) return 'medium';
        return 'low';
    }

    /**
     * Calculate implementation effort from recommendations
     * @param {Array} recommendations - Array of recommendations
     * @returns {string} Effort level
     */
    calculateImplementationEffort(recommendations) {
        const highEffortActions = [
            'remove_unused_css', 'remove_unused_js', 'eliminate_render_blocking',
            'reduce_dom_size', 'remove_duplicate_js', 'reduce_main_thread_work'
        ];
        
        const highEffortCount = recommendations.filter(r => 
            highEffortActions.includes(r.action)
        ).length;
        
        const total = recommendations.length;
        if (total === 0) return 'low';
        const highEffortRatio = highEffortCount / total;
        if (highEffortRatio > 0.5) return 'high';
        if (highEffortRatio > 0.2) return 'medium';
        return 'low';
    }

    /**
     * Merge and deduplicate recommendations
     * @param {Object} recommendations - Raw recommendations
     * @returns {Object} Merged recommendations
     */
    mergeAndDeduplicateRecommendations(recommendations) {
        const merged = {
            performance: [],
            functionality: [],
            compatibility: [],
            optimization: []
        };

        // Combine all recommendations
        const allRecommendations = [
            ...recommendations.performance,
            ...recommendations.functionality,
            ...recommendations.compatibility,
            ...recommendations.optimization
        ];

        // Group by plugin slug
        const grouped = {};
        for (const rec of allRecommendations) {
            const key = rec.plugin;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(rec);
        }

        // Merge recommendations for the same plugin
        for (const [pluginSlug, pluginRecs] of Object.entries(grouped)) {
            if (pluginRecs.length === 1) {
                // Single recommendation, add to appropriate category
                const rec = pluginRecs[0];
                if (rec.category && merged[rec.category]) {
                    merged[rec.category].push(rec);
                }
            } else {
                // Multiple recommendations, merge them
                const mergedRec = this.mergePluginRecommendations(pluginRecs);
                if (mergedRec.category && merged[mergedRec.category]) {
                    merged[mergedRec.category].push(mergedRec);
                }
            }
        }

        // Calculate enhanced scores and sort
        for (const category of Object.keys(merged)) {
            merged[category].forEach(rec => {
                // Add enhanced score if not already present
                if (!rec.enhanced_score) {
                    rec.enhanced_score = this.calculateEnhancedScore(rec, {}, {});
                }
            });
            
            // Sort by enhanced score (descending), then priority, then weight
            merged[category].sort((a, b) => {
                const scoreDiff = (b.enhanced_score || 0) - (a.enhanced_score || 0);
                if (scoreDiff !== 0) return scoreDiff;
                
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                
                return (b.weight || 0) - (a.weight || 0);
            });
        }

        return merged;
    }

    /**
     * Merge multiple recommendations for the same plugin
     * @param {Array} recommendations - Recommendations for the same plugin
     * @returns {Object} Merged recommendation
     */
    mergePluginRecommendations(recommendations) {
        const base = recommendations[0];
        const merged = { ...base };
        
        // Combine reasons
        const reasons = recommendations.map(r => r.reason).filter(r => r);
        if (reasons.length > 1) {
            merged.reason = reasons.join('; ');
        }
        
        // Use highest priority
        const priorities = recommendations.map(r => r.priority);
        if (priorities.includes('high')) {
            merged.priority = 'high';
        } else if (priorities.includes('medium')) {
            merged.priority = 'medium';
        } else {
            merged.priority = 'low';
        }
        
        // Combine sources
        merged.sources = [...new Set(recommendations.map(r => r.source))];
        
        // Calculate combined weight
        merged.weight = recommendations.reduce((sum, r) => sum + (r.weight || 0), 0) / recommendations.length;
        
        return merged;
    }

    /**
     * Calculate recommendation summary
     * @param {Object} recommendations - Final recommendations
     * @returns {Object} Summary statistics
     */
    calculateRecommendationSummary(recommendations) {
        const allRecs = [
            ...recommendations.performance,
            ...recommendations.functionality,
            ...recommendations.compatibility,
            ...recommendations.optimization
        ];

        const summary = {
            total_recommendations: allRecs.length,
            priority_breakdown: { high: 0, medium: 0, low: 0 },
            estimated_impact: 'medium',
            implementation_effort: 'medium'
        };

        // Count by priority
        for (const rec of allRecs) {
            summary.priority_breakdown[rec.priority]++;
        }

        // Estimate overall impact
        const highPriorityCount = summary.priority_breakdown.high;
        const totalCount = summary.total_recommendations;
        
        if (highPriorityCount / totalCount > 0.5) {
            summary.estimated_impact = 'high';
        } else if (highPriorityCount / totalCount > 0.2) {
            summary.estimated_impact = 'medium';
        } else {
            summary.estimated_impact = 'low';
        }

        // Estimate implementation effort
        const complexPlugins = allRecs.filter(r => 
            ['woocommerce', 'memberpress', 'elementor'].includes(r.plugin)
        ).length;
        
        if (complexPlugins > 2) {
            summary.implementation_effort = 'high';
        } else if (complexPlugins > 0) {
            summary.implementation_effort = 'medium';
        } else {
            summary.implementation_effort = 'low';
        }

        return summary;
    }

    /**
     * Check if WordPress version is outdated
     * @param {string} version - WordPress version
     * @returns {boolean} Is outdated
     */
    isWordPressVersionOutdated(version) {
        // Simple version comparison (in real implementation, you'd check against latest version)
        const versionParts = version.split('.').map(Number);
        const currentMajor = versionParts[0] || 0;
        const currentMinor = versionParts[1] || 0;
        
        // Consider outdated if major version is less than 6 or minor is significantly behind
        return currentMajor < 6 || (currentMajor === 6 && currentMinor < 3);
    }

    /**
     * Get top recommendations by category
     * @param {Object} recommendations - All recommendations
     * @param {string} category - Category to filter
     * @param {number} limit - Maximum number of recommendations
     * @returns {Array} Top recommendations
     */
    getTopRecommendations(recommendations, category = 'all', limit = 5) {
        let recs = [];
        
        if (category === 'all') {
            recs = [
                ...recommendations.performance,
                ...recommendations.functionality,
                ...recommendations.compatibility,
                ...recommendations.optimization
            ];
        } else {
            recs = recommendations[category] || [];
        }
        
        return recs.slice(0, limit);
    }

    /**
     * Export recommendations to different formats
     * @param {Object} recommendations - Recommendations data
     * @param {string} format - Export format (json, csv, html)
     * @returns {string} Exported data
     */
    exportRecommendations(recommendations, format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(recommendations, null, 2);
            case 'csv':
                return this.exportToCSV(recommendations);
            case 'html':
                return this.exportToHTML(recommendations);
            default:
                return JSON.stringify(recommendations, null, 2);
        }
    }

    /**
     * Export recommendations to CSV format
     * @param {Object} recommendations - Recommendations data
     * @returns {string} CSV data
     */
    exportToCSV(recommendations) {
        const allRecs = [
            ...recommendations.recommendations.performance,
            ...recommendations.recommendations.functionality,
            ...recommendations.recommendations.compatibility,
            ...recommendations.recommendations.optimization
        ];

        const headers = ['Plugin', 'Name', 'Category', 'Priority', 'Description', 'Reason'];
        const rows = allRecs.map(rec => [
            rec.plugin,
            rec.name,
            rec.category,
            rec.priority,
            rec.description,
            rec.reason
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    /**
     * Export recommendations to HTML format
     * @param {Object} recommendations - Recommendations data
     * @returns {string} HTML data
     */
    exportToHTML(recommendations) {
        const allRecs = [
            ...recommendations.recommendations.performance,
            ...recommendations.recommendations.functionality,
            ...recommendations.recommendations.compatibility,
            ...recommendations.recommendations.optimization
        ];

        let html = '<html><head><title>Plugin Recommendations</title></head><body>';
        html += '<h1>Plugin Recommendations</h1>';
        html += `<p>Total recommendations: ${allRecs.length}</p>`;
        
        for (const rec of allRecs) {
            html += `<div class="recommendation">`;
            html += `<h3>${rec.name}</h3>`;
            html += `<p><strong>Category:</strong> ${rec.category}</p>`;
            html += `<p><strong>Priority:</strong> ${rec.priority}</p>`;
            html += `<p><strong>Description:</strong> ${rec.description}</p>`;
            html += `<p><strong>Reason:</strong> ${rec.reason}</p>`;
            html += `</div>`;
        }
        
        html += '</body></html>';
        return html;
    }
}

module.exports = PluginRecommendationEngine;
