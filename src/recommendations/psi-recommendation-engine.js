// File: ./src/recommendations/psi-recommendation-engine.js

/**
 * Advanced PSI-based recommendation engine
 * Generates specific recommendations based on comprehensive PageSpeed Insights data
 */
class PSIRecommendationEngine {
    constructor() {
        this.opportunityMappings = {
            // Performance opportunities
            'unused-css-rules': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['autoptimize', 'wp-rocket', 'w3-total-cache'],
                action: 'remove_unused_css',
                impact: 'high'
            },
            'unused-javascript': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['autoptimize', 'wp-rocket', 'w3-total-cache'],
                action: 'remove_unused_js',
                impact: 'high'
            },
            'render-blocking-resources': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['autoptimize', 'wp-rocket', 'async-javascript'],
                action: 'eliminate_render_blocking',
                impact: 'high'
            },
            'unminified-css': {
                category: 'optimization',
                priority: 'medium',
                plugin_suggestions: ['autoptimize', 'wp-rocket', 'w3-total-cache'],
                action: 'minify_css',
                impact: 'medium'
            },
            'unminified-javascript': {
                category: 'optimization',
                priority: 'medium',
                plugin_suggestions: ['autoptimize', 'wp-rocket', 'w3-total-cache'],
                action: 'minify_js',
                impact: 'medium'
            },
            'uses-text-compression': {
                category: 'optimization',
                priority: 'high',
                plugin_suggestions: ['wp-rocket', 'w3-total-cache', 'wp-super-cache'],
                action: 'enable_compression',
                impact: 'high'
            },
            'uses-long-cache-ttl': {
                category: 'optimization',
                priority: 'medium',
                plugin_suggestions: ['wp-rocket', 'w3-total-cache', 'wp-super-cache'],
                action: 'optimize_caching',
                impact: 'medium'
            },
            'uses-http2': {
                category: 'optimization',
                priority: 'low',
                plugin_suggestions: ['wp-rocket', 'w3-total-cache'],
                action: 'enable_http2',
                impact: 'low'
            },
            'offscreen-images': {
                category: 'optimization',
                priority: 'medium',
                plugin_suggestions: ['smush', 'shortpixel', 'ewww-image-optimizer'],
                action: 'lazy_load_images',
                impact: 'medium'
            },
            'uses-webp-images': {
                category: 'optimization',
                priority: 'medium',
                plugin_suggestions: ['smush', 'shortpixel', 'ewww-image-optimizer'],
                action: 'convert_to_webp',
                impact: 'medium'
            },
            'uses-optimized-images': {
                category: 'optimization',
                priority: 'medium',
                plugin_suggestions: ['smush', 'shortpixel', 'ewww-image-optimizer'],
                action: 'optimize_images',
                impact: 'medium'
            },
            'modern-image-formats': {
                category: 'optimization',
                priority: 'medium',
                plugin_suggestions: ['smush', 'shortpixel', 'ewww-image-optimizer'],
                action: 'use_modern_formats',
                impact: 'medium'
            },
            'uses-responsive-images': {
                category: 'optimization',
                priority: 'low',
                plugin_suggestions: ['smush', 'shortpixel', 'ewww-image-optimizer'],
                action: 'implement_responsive_images',
                impact: 'low'
            },
            'preload-lcp-image': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'flying-press'],
                action: 'preload_lcp_image',
                impact: 'high'
            },
            'uses-rel-preconnect': {
                category: 'performance',
                priority: 'medium',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'flying-press'],
                action: 'add_preconnect',
                impact: 'medium'
            },
            'uses-rel-preload': {
                category: 'performance',
                priority: 'medium',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'flying-press'],
                action: 'add_preload',
                impact: 'medium'
            },
            'dom-size': {
                category: 'performance',
                priority: 'medium',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'w3-total-cache'],
                action: 'reduce_dom_size',
                impact: 'medium'
            },
            'duplicated-javascript': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['autoptimize', 'wp-rocket', 'w3-total-cache'],
                action: 'remove_duplicate_js',
                impact: 'high'
            },
            'legacy-javascript': {
                category: 'performance',
                priority: 'medium',
                plugin_suggestions: ['autoptimize', 'wp-rocket'],
                action: 'update_legacy_js',
                impact: 'medium'
            },
            'no-document-write': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['autoptimize', 'wp-rocket'],
                action: 'remove_document_write',
                impact: 'high'
            },
            'total-byte-weight': {
                category: 'performance',
                priority: 'medium',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'w3-total-cache'],
                action: 'reduce_page_size',
                impact: 'medium'
            }
        };

        this.diagnosticMappings = {
            'long_tasks': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'w3-total-cache'],
                action: 'optimize_long_tasks',
                impact: 'high'
            },
            'render_blocking_resources': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['autoptimize', 'wp-rocket', 'async-javascript'],
                action: 'eliminate_render_blocking',
                impact: 'high'
            },
            'third_party_summary': {
                category: 'performance',
                priority: 'medium',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'w3-total-cache'],
                action: 'optimize_third_party',
                impact: 'medium'
            },
            'main_thread_work': {
                category: 'performance',
                priority: 'high',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'w3-total-cache'],
                action: 'reduce_main_thread_work',
                impact: 'high'
            },
            'dom_nodes': {
                category: 'performance',
                priority: 'medium',
                plugin_suggestions: ['wp-rocket', 'autoptimize', 'w3-total-cache'],
                action: 'reduce_dom_complexity',
                impact: 'medium'
            }
        };
    }

    /**
     * Generate comprehensive recommendations from PSI data
     * @param {Object} psiData - Complete PSI report data
     * @param {Object} siteData - Site analysis data
     * @returns {Object} Comprehensive recommendations
     */
    generateRecommendations(psiData, siteData) {
        if (!psiData) return { opportunities: [], diagnostics: [], categories: [], summary: null };

        const recommendations = {
            opportunities: this.generateOpportunityRecommendations(psiData.opportunities || {}),
            diagnostics: this.generateDiagnosticRecommendations(psiData.diagnostics || {}),
            categories: this.generateCategoryRecommendations(psiData.categories || {}),
            core_web_vitals: this.generateCWVRecommendations(psiData.core_web_vitals || {}),
            accessibility: this.generateAccessibilityRecommendations(psiData.accessibility || {}),
            best_practices: this.generateBestPracticesRecommendations(psiData.best_practices || {}),
            seo: this.generateSEORecommendations(psiData.seo || {}),
            network: this.generateNetworkRecommendations(psiData.network_analysis || {}),
            summary: this.generateSummary(psiData, siteData)
        };

        return recommendations;
    }

    /**
     * Generate recommendations from PSI opportunities
     */
    generateOpportunityRecommendations(opportunities) {
        const recommendations = [];

        Object.entries(opportunities).forEach(([opportunityId, opportunity]) => {
            const mapping = this.opportunityMappings[opportunityId];
            if (!mapping) return;

            const recommendation = {
                id: `psi_opportunity_${opportunityId}`,
                type: 'psi_opportunity',
                category: mapping.category,
                priority: mapping.priority,
                impact: mapping.impact,
                title: opportunity.title,
                description: opportunity.description,
                action: mapping.action,
                plugin_suggestions: mapping.plugin_suggestions,
                savings: opportunity.savings,
                score: opportunity.score,
                display_value: opportunity.displayValue,
                source: 'pagespeed_insights',
                enhanced_score: this.calculateOpportunityScore(opportunity, mapping)
            };

            recommendations.push(recommendation);
        });

        return recommendations.sort((a, b) => b.enhanced_score - a.enhanced_score);
    }

    /**
     * Generate recommendations from PSI diagnostics
     */
    generateDiagnosticRecommendations(diagnostics) {
        const recommendations = [];

        Object.entries(diagnostics).forEach(([diagnosticId, diagnostic]) => {
            const mapping = this.diagnosticMappings[diagnosticId];
            if (!mapping || !diagnostic.count) return;

            const recommendation = {
                id: `psi_diagnostic_${diagnosticId}`,
                type: 'psi_diagnostic',
                category: mapping.category,
                priority: mapping.priority,
                impact: mapping.impact,
                title: this.getDiagnosticTitle(diagnosticId),
                description: this.getDiagnosticDescription(diagnosticId, diagnostic),
                action: mapping.action,
                plugin_suggestions: mapping.plugin_suggestions,
                count: diagnostic.count,
                total_duration: diagnostic.total_duration || diagnostic.total_waste || 0,
                source: 'pagespeed_insights',
                enhanced_score: this.calculateDiagnosticScore(diagnostic, mapping)
            };

            recommendations.push(recommendation);
        });

        return recommendations.sort((a, b) => b.enhanced_score - a.enhanced_score);
    }

    /**
     * Generate recommendations from PSI categories
     */
    generateCategoryRecommendations(categories) {
        const recommendations = [];

        Object.entries(categories).forEach(([categoryId, category]) => {
            if (category.score === null || category.score >= 0.9) return;

            const recommendation = {
                id: `psi_category_${categoryId}`,
                type: 'psi_category',
                category: this.mapCategoryToRecommendationCategory(categoryId),
                priority: this.getCategoryPriority(category.score),
                impact: this.getCategoryImpact(category.score),
                title: `${category.title} Score Improvement`,
                description: `Improve ${category.title.toLowerCase()} score from ${Math.round(category.score * 100)}/100`,
                action: `improve_${categoryId}`,
                plugin_suggestions: this.getCategoryPluginSuggestions(categoryId),
                current_score: category.score,
                target_score: 0.9,
                source: 'pagespeed_insights',
                enhanced_score: this.calculateCategoryScore(category)
            };

            recommendations.push(recommendation);
        });

        return recommendations.sort((a, b) => b.enhanced_score - a.enhanced_score);
    }

    /**
     * Generate Core Web Vitals recommendations
     */
    generateCWVRecommendations(cwv) {
        const recommendations = [];

        Object.entries(cwv).forEach(([metric, data]) => {
            if (!data || data.status === 'good' || data.status === 'unknown') return;

            const recommendation = {
                id: `psi_cwv_${metric}`,
                type: 'psi_core_web_vital',
                category: 'performance',
                priority: data.status === 'poor' ? 'high' : 'medium',
                impact: data.status === 'poor' ? 'high' : 'medium',
                title: `Improve ${metric.toUpperCase()}`,
                description: `${metric.toUpperCase()} is ${data.status} (${data.displayValue || data.value})`,
                action: `improve_${metric}`,
                plugin_suggestions: this.getCWVPluginSuggestions(metric),
                current_value: data.value,
                target_value: this.getCWVTarget(metric),
                status: data.status,
                source: 'pagespeed_insights',
                enhanced_score: this.calculateCWVScore(data)
            };

            recommendations.push(recommendation);
        });

        return recommendations.sort((a, b) => b.enhanced_score - a.enhanced_score);
    }

    /**
     * Generate accessibility recommendations
     */
    generateAccessibilityRecommendations(accessibility) {
        const recommendations = [];

        Object.entries(accessibility).forEach(([auditId, audit]) => {
            if (audit.score >= 0.9) return;

            const recommendation = {
                id: `psi_accessibility_${auditId}`,
                type: 'psi_accessibility',
                category: 'accessibility',
                priority: audit.score < 0.5 ? 'high' : 'medium',
                impact: audit.score < 0.5 ? 'high' : 'medium',
                title: audit.title,
                description: audit.description,
                action: `fix_${auditId}`,
                plugin_suggestions: this.getAccessibilityPluginSuggestions(auditId),
                current_score: audit.score,
                source: 'pagespeed_insights',
                enhanced_score: this.calculateAccessibilityScore(audit)
            };

            recommendations.push(recommendation);
        });

        return recommendations.sort((a, b) => b.enhanced_score - a.enhanced_score);
    }

    /**
     * Generate best practices recommendations
     */
    generateBestPracticesRecommendations(bestPractices) {
        const recommendations = [];

        Object.entries(bestPractices).forEach(([auditId, audit]) => {
            if (audit.score >= 0.9) return;

            const recommendation = {
                id: `psi_best_practices_${auditId}`,
                type: 'psi_best_practices',
                category: 'security',
                priority: audit.score < 0.5 ? 'high' : 'medium',
                impact: audit.score < 0.5 ? 'high' : 'medium',
                title: audit.title,
                description: audit.description,
                action: `fix_${auditId}`,
                plugin_suggestions: this.getBestPracticesPluginSuggestions(auditId),
                current_score: audit.score,
                source: 'pagespeed_insights',
                enhanced_score: this.calculateBestPracticesScore(audit)
            };

            recommendations.push(recommendation);
        });

        return recommendations.sort((a, b) => b.enhanced_score - a.enhanced_score);
    }

    /**
     * Generate SEO recommendations
     */
    generateSEORecommendations(seo) {
        const recommendations = [];

        Object.entries(seo).forEach(([auditId, audit]) => {
            if (audit.score >= 0.9) return;

            const recommendation = {
                id: `psi_seo_${auditId}`,
                type: 'psi_seo',
                category: 'seo',
                priority: audit.score < 0.5 ? 'high' : 'medium',
                impact: audit.score < 0.5 ? 'high' : 'medium',
                title: audit.title,
                description: audit.description,
                action: `fix_${auditId}`,
                plugin_suggestions: this.getSEOPluginSuggestions(auditId),
                current_score: audit.score,
                source: 'pagespeed_insights',
                enhanced_score: this.calculateSEOScore(audit)
            };

            recommendations.push(recommendation);
        });

        return recommendations.sort((a, b) => b.enhanced_score - a.enhanced_score);
    }

    /**
     * Generate network recommendations
     */
    generateNetworkRecommendations(network) {
        const recommendations = [];

        if (network.uses_http2 && network.uses_http2.score < 0.9) {
            recommendations.push({
                id: 'psi_network_http2',
                type: 'psi_network',
                category: 'optimization',
                priority: 'low',
                impact: 'low',
                title: 'Enable HTTP/2',
                description: 'Enable HTTP/2 for better performance',
                action: 'enable_http2',
                plugin_suggestions: ['wp-rocket', 'w3-total-cache'],
                source: 'pagespeed_insights',
                enhanced_score: 30
            });
        }

        if (network.uses_text_compression && network.uses_text_compression.score < 0.9) {
            recommendations.push({
                id: 'psi_network_compression',
                type: 'psi_network',
                category: 'optimization',
                priority: 'high',
                impact: 'high',
                title: 'Enable Text Compression',
                description: 'Enable gzip/brotli compression for text resources',
                action: 'enable_compression',
                plugin_suggestions: ['wp-rocket', 'w3-total-cache', 'wp-super-cache'],
                source: 'pagespeed_insights',
                enhanced_score: 80
            });
        }

        return recommendations.sort((a, b) => b.enhanced_score - a.enhanced_score);
    }

    /**
     * Generate comprehensive summary
     */
    generateSummary(psiData, siteData) {
        const allRecommendations = [
            ...this.generateOpportunityRecommendations(psiData.opportunities || {}),
            ...this.generateDiagnosticRecommendations(psiData.diagnostics || {}),
            ...this.generateCategoryRecommendations(psiData.categories || {}),
            ...this.generateCWVRecommendations(psiData.core_web_vitals || {}),
            ...this.generateAccessibilityRecommendations(psiData.accessibility || {}),
            ...this.generateBestPracticesRecommendations(psiData.best_practices || {}),
            ...this.generateSEORecommendations(psiData.seo || {}),
            ...this.generateNetworkRecommendations(psiData.network_analysis || {})
        ];

        const priorityBreakdown = {
            high: allRecommendations.filter(r => r.priority === 'high').length,
            medium: allRecommendations.filter(r => r.priority === 'medium').length,
            low: allRecommendations.filter(r => r.priority === 'low').length
        };

        const categoryBreakdown = {};
        allRecommendations.forEach(rec => {
            categoryBreakdown[rec.category] = (categoryBreakdown[rec.category] || 0) + 1;
        });

        return {
            total_recommendations: allRecommendations.length,
            priority_breakdown: priorityBreakdown,
            category_breakdown: categoryBreakdown,
            estimated_impact: this.calculateOverallImpact(priorityBreakdown),
            implementation_effort: this.calculateImplementationEffort(allRecommendations),
            top_opportunities: allRecommendations.slice(0, 5),
            cwv_status: psiData.core_web_vitals ? {
                lcp: psiData.core_web_vitals.lcp?.status || 'unknown',
                cls: psiData.core_web_vitals.cls?.status || 'unknown',
                inp: psiData.core_web_vitals.inp?.status || 'unknown'
            } : null,
            performance_score: psiData.performance_score,
            categories_scores: psiData.categories ? {
                performance: psiData.categories.performance?.score || null,
                accessibility: psiData.categories.accessibility?.score || null,
                best_practices: psiData.categories['best-practices']?.score || null,
                seo: psiData.categories.seo?.score || null
            } : null
        };
    }

    // Helper methods for scoring and calculations
    calculateOpportunityScore(opportunity, mapping) {
        let score = 50;
        score += mapping.priority === 'high' ? 30 : mapping.priority === 'medium' ? 15 : 5;
        score += mapping.impact === 'high' ? 25 : mapping.impact === 'medium' ? 15 : 5;
        score += (1 - opportunity.score) * 20; // Lower PSI score = higher recommendation score
        return Math.min(score, 100);
    }

    calculateDiagnosticScore(diagnostic, mapping) {
        let score = 50;
        score += mapping.priority === 'high' ? 30 : mapping.priority === 'medium' ? 15 : 5;
        score += mapping.impact === 'high' ? 25 : mapping.impact === 'medium' ? 15 : 5;
        score += Math.min(diagnostic.count * 2, 20); // More issues = higher score
        return Math.min(score, 100);
    }

    calculateCategoryScore(category) {
        let score = 50;
        score += (1 - category.score) * 40; // Lower category score = higher recommendation score
        return Math.min(score, 100);
    }

    calculateCWVScore(data) {
        let score = 50;
        score += data.status === 'poor' ? 40 : data.status === 'needs-improvement' ? 25 : 10;
        return Math.min(score, 100);
    }

    calculateAccessibilityScore(audit) {
        let score = 50;
        score += (1 - audit.score) * 40;
        return Math.min(score, 100);
    }

    calculateBestPracticesScore(audit) {
        let score = 50;
        score += (1 - audit.score) * 40;
        return Math.min(score, 100);
    }

    calculateSEOScore(audit) {
        let score = 50;
        score += (1 - audit.score) * 40;
        return Math.min(score, 100);
    }

    calculateOverallImpact(priorityBreakdown) {
        const total = priorityBreakdown.high + priorityBreakdown.medium + priorityBreakdown.low;
        if (total === 0) return 'low';
        const highRatio = priorityBreakdown.high / total;
        if (highRatio > 0.5) return 'high';
        if (highRatio > 0.2) return 'medium';
        return 'low';
    }

    calculateImplementationEffort(recommendations) {
        const highEffortCount = recommendations.filter(r => 
            ['unused-css-rules', 'unused-javascript', 'render-blocking-resources', 'dom-size'].includes(r.action)
        ).length;
        
        const total = recommendations.length;
        if (total === 0) return 'low';
        const highEffortRatio = highEffortCount / total;
        if (highEffortRatio > 0.5) return 'high';
        if (highEffortRatio > 0.2) return 'medium';
        return 'low';
    }

    // Additional helper methods...
    getDiagnosticTitle(diagnosticId) {
        const titles = {
            'long_tasks': 'Optimize Long Tasks',
            'render_blocking_resources': 'Eliminate Render-Blocking Resources',
            'third_party_summary': 'Optimize Third-Party Scripts',
            'main_thread_work': 'Reduce Main Thread Work',
            'dom_nodes': 'Reduce DOM Complexity'
        };
        return titles[diagnosticId] || 'Optimize Performance';
    }

    getDiagnosticDescription(diagnosticId, diagnostic) {
        const descriptions = {
            'long_tasks': `${diagnostic.count} long tasks detected (${diagnostic.total_duration}ms total)`,
            'render_blocking_resources': `${diagnostic.count} render-blocking resources (${diagnostic.total_waste}ms wasted)`,
            'third_party_summary': `${diagnostic.count} third-party scripts (${diagnostic.total_waste}ms main thread time)`,
            'main_thread_work': `Main thread work: ${diagnostic.total_time}ms`,
            'dom_nodes': `DOM size: ${diagnostic.count} nodes`
        };
        return descriptions[diagnosticId] || 'Performance optimization needed';
    }

    mapCategoryToRecommendationCategory(categoryId) {
        const mapping = {
            'performance': 'performance',
            'accessibility': 'accessibility',
            'best-practices': 'security',
            'seo': 'seo'
        };
        return mapping[categoryId] || 'optimization';
    }

    getCategoryPriority(score) {
        if (score < 0.5) return 'high';
        if (score < 0.8) return 'medium';
        return 'low';
    }

    getCategoryImpact(score) {
        if (score < 0.5) return 'high';
        if (score < 0.8) return 'medium';
        return 'low';
    }

    getCategoryPluginSuggestions(categoryId) {
        const suggestions = {
            'performance': ['wp-rocket', 'autoptimize', 'w3-total-cache'],
            'accessibility': ['wp-accessibility', 'one-click-accessibility'],
            'best-practices': ['wordfence', 'sucuri-scanner', 'security-ninja'],
            'seo': ['yoast-seo', 'rankmath', 'seopress']
        };
        return suggestions[categoryId] || ['wp-rocket', 'autoptimize'];
    }

    getCWVPluginSuggestions(metric) {
        const suggestions = {
            'lcp': ['wp-rocket', 'autoptimize', 'flying-press'],
            'cls': ['wp-rocket', 'autoptimize', 'w3-total-cache'],
            'inp': ['wp-rocket', 'autoptimize', 'w3-total-cache']
        };
        return suggestions[metric] || ['wp-rocket', 'autoptimize'];
    }

    getCWVTarget(metric) {
        const targets = {
            'lcp': 2500,
            'cls': 0.1,
            'inp': 200
        };
        return targets[metric] || null;
    }

    getAccessibilityPluginSuggestions(auditId) {
        return ['wp-accessibility', 'one-click-accessibility', 'wp-accessibility-helper'];
    }

    getBestPracticesPluginSuggestions(auditId) {
        return ['wordfence', 'sucuri-scanner', 'security-ninja', 'wp-security-audit-log'];
    }

    getSEOPluginSuggestions(auditId) {
        return ['yoast-seo', 'rankmath', 'seopress', 'all-in-one-seo'];
    }
}

module.exports = PSIRecommendationEngine;












