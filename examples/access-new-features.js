// File: ./examples/access-new-features.js

const WordPressAnalyzer = require('../src/wordpress-analyzer');

/**
 * Example showing how to access the new performance analysis and recommendation system
 */
async function demonstrateNewFeatures() {
    console.log('🎯 Accessing New Performance Analysis & Recommendation System\n');
    
    // Initialize analyzer with new features enabled
    const analyzer = new WordPressAnalyzer({
        includePerformance: true,        // Enable performance analysis
        includeRecommendations: true,    // Enable recommendation system
        verbose: true                    // Show detailed logs
    });

    // Example URL (replace with actual WordPress site)
    const testUrl = 'https://wordpress.org';
    
    try {
        console.log(`🔍 Analyzing: ${testUrl}`);
        console.log('=' .repeat(60));
        
        // Perform analysis
        const results = await analyzer.analyzeSite(testUrl);
        
        if (!results.wordpress.isWordPress) {
            console.log('❌ Site not detected as WordPress');
            return;
        }

        // ========================================
        // 🆕 NEW PERFORMANCE ANALYSIS ACCESS
        // ========================================
        
        console.log('\n📊 PERFORMANCE ANALYSIS RESULTS:');
        console.log('=' .repeat(40));
        
        if (results.performance) {
            const perf = results.performance;
            
            // 1. Main page timing
            if (perf.main_page_timing) {
                console.log('\n⏱️  Page Load Timing:');
                console.log(`   Load Time: ${perf.main_page_timing.load_time || 'N/A'}ms`);
                console.log(`   DOM Content Loaded: ${perf.main_page_timing.dom_content_loaded || 'N/A'}ms`);
            }
            
            // 2. Plugin performance data
            if (perf.plugin_performance) {
                const pluginCount = Object.keys(perf.plugin_performance).length;
                console.log(`\n🔌 Plugin Performance Data (${pluginCount} plugins):`);
                
                for (const [pluginName, data] of Object.entries(perf.plugin_performance)) {
                    console.log(`   ${pluginName}:`);
                    console.log(`     Total Size: ${Math.round((data.total_size || 0) / 1024)}KB`);
                    console.log(`     Blocking Resources: ${data.blocking_resources || 0}`);
                    console.log(`     Performance Score: ${data.performance_score || 'N/A'}`);
                }
            }
            
            // 3. Optimization opportunities
            if (perf.optimization_opportunities) {
                console.log(`\n🚀 Optimization Opportunities (${perf.optimization_opportunities.length}):`);
                perf.optimization_opportunities.forEach((opp, index) => {
                    console.log(`   ${index + 1}. ${opp.type}: ${opp.recommendation}`);
                });
            }
            
            // 4. Performance recommendations
            if (perf.recommendations) {
                console.log(`\n💡 Performance Recommendations (${perf.recommendations.length}):`);
                perf.recommendations.forEach((rec, index) => {
                    console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
                    console.log(`      ${rec.description}`);
                });
            }
            
        } else {
            console.log('❌ No performance analysis data available');
        }

        // ========================================
        // 🆕 NEW RECOMMENDATION SYSTEM ACCESS
        // ========================================
        
        console.log('\n\n🎯 RECOMMENDATION SYSTEM RESULTS:');
        console.log('=' .repeat(40));
        
        if (results.recommendations) {
            const recs = results.recommendations;
            
            // 1. Summary
            if (recs.summary) {
                console.log('\n📋 Recommendation Summary:');
                console.log(`   Total Recommendations: ${recs.summary.total_recommendations || 0}`);
                console.log(`   High Priority: ${recs.summary.priority_breakdown?.high || 0}`);
                console.log(`   Medium Priority: ${recs.summary.priority_breakdown?.medium || 0}`);
                console.log(`   Low Priority: ${recs.summary.priority_breakdown?.low || 0}`);
                console.log(`   Estimated Impact: ${recs.summary.estimated_impact || 'N/A'}`);
                console.log(`   Implementation Effort: ${recs.summary.implementation_effort || 'N/A'}`);
            }
            
            // 2. Top recommendations
            if (recs.top_recommendations) {
                console.log(`\n🏆 Top Recommendations (${recs.top_recommendations.length}):`);
                recs.top_recommendations.forEach((rec, index) => {
                    console.log(`   ${index + 1}. ${rec.name} [${rec.priority.toUpperCase()}]`);
                    console.log(`      Category: ${rec.category}`);
                    console.log(`      Reason: ${rec.reason}`);
                });
            }
            
            // 3. Category-specific recommendations
            if (recs.recommendations) {
                const categories = ['performance', 'functionality', 'compatibility', 'optimization'];
                
                categories.forEach(category => {
                    const categoryRecs = recs.recommendations[category] || [];
                    if (categoryRecs.length > 0) {
                        console.log(`\n📂 ${category.toUpperCase()} Recommendations (${categoryRecs.length}):`);
                        categoryRecs.forEach((rec, index) => {
                            console.log(`   ${index + 1}. ${rec.name} - ${rec.reason}`);
                        });
                    }
                });
            }
            
            // 4. Implementation guide
            if (recs.implementation_guide) {
                console.log('\n📅 Implementation Guide:');
                const guide = recs.implementation_guide;
                
                if (guide.phases) {
                    console.log(`   Total Effort: ${guide.estimated_total_effort || 'N/A'}`);
                    
                    if (guide.phases.immediate) {
                        console.log(`   Immediate (${guide.phases.immediate.recommendations.length} items):`);
                        guide.phases.immediate.recommendations.forEach(rec => {
                            console.log(`     • ${rec.name} (${rec.estimated_effort})`);
                        });
                    }
                }
                
                if (guide.implementation_tips) {
                    console.log(`\n💡 Implementation Tips (${guide.implementation_tips.length}):`);
                    guide.implementation_tips.slice(0, 3).forEach((tip, index) => {
                        console.log(`   ${index + 1}. ${tip}`);
                    });
                }
            }
            
            // 5. Analysis breakdown
            if (recs.analysis) {
                console.log('\n🔬 Analysis Breakdown:');
                
                if (recs.analysis.enhanced_asset_analysis) {
                    const asset = recs.analysis.enhanced_asset_analysis;
                    console.log(`   Assets Analyzed: ${asset.inspected_assets || 0}/${asset.total_assets || 0}`);
                    console.log(`   Plugin Signatures: ${asset.plugin_signatures?.length || 0}`);
                }
                
                if (recs.analysis.performance_analysis) {
                    const perf = recs.analysis.performance_analysis;
                    console.log(`   Performance Score: ${perf.score || 'N/A'}`);
                    console.log(`   Issues Found: ${perf.issues?.length || 0}`);
                }
                
                if (recs.analysis.functionality_analysis) {
                    const func = recs.analysis.functionality_analysis;
                    console.log(`   Functionality Score: ${func.score || 'N/A'}`);
                    console.log(`   Missing Features: ${Object.keys(func.missing || {}).length}`);
                }
            }
            
        } else {
            console.log('❌ No recommendation system data available');
        }

        // ========================================
        // 📄 GENERATE REPORTS
        // ========================================
        
        console.log('\n\n📄 GENERATING REPORTS:');
        console.log('=' .repeat(40));
        
        // Generate JSON report
        const jsonReport = analyzer.generateJsonReport(results);
        console.log('✅ JSON Report Generated');
        console.log(`   Sections: ${Object.keys(jsonReport).join(', ')}`);
        
        // Check if recommendations section exists
        if (jsonReport.recommendations) {
            console.log('✅ Recommendations section included in JSON report');
        }
        
        // Check if performance section exists
        if (jsonReport.performance) {
            console.log('✅ Performance section included in JSON report');
        }
        
        // Generate HTML report
        const htmlReport = analyzer.generateHtmlReport(results);
        console.log('✅ HTML Report Generated');
        console.log(`   Size: ${Math.round(htmlReport.length / 1024)}KB`);
        
        // ========================================
        // 🎯 SPECIFIC DATA ACCESS EXAMPLES
        // ========================================
        
        console.log('\n\n🔍 SPECIFIC DATA ACCESS EXAMPLES:');
        console.log('=' .repeat(40));
        
        // Example 1: Get all high-priority recommendations
        if (results.recommendations?.recommendations) {
            const highPriorityRecs = [];
            Object.values(results.recommendations.recommendations).forEach(categoryRecs => {
                highPriorityRecs.push(...categoryRecs.filter(rec => rec.priority === 'high'));
            });
            
            console.log(`\n🎯 High Priority Recommendations (${highPriorityRecs.length}):`);
            highPriorityRecs.forEach(rec => {
                console.log(`   • ${rec.name}: ${rec.reason}`);
            });
        }
        
        // Example 2: Get performance issues
        if (results.performance?.optimization_opportunities) {
            const largeFiles = results.performance.optimization_opportunities.filter(
                opp => opp.type === 'large_file_size'
            );
            
            console.log(`\n📦 Large Files Detected (${largeFiles.length}):`);
            largeFiles.forEach(file => {
                console.log(`   • ${Math.round(file.size / 1024)}KB: ${file.url.split('/').pop()}`);
            });
        }
        
        // Example 3: Get missing functionality
        if (results.recommendations?.analysis?.functionality_analysis?.missing) {
            const missingFeatures = Object.keys(results.recommendations.analysis.functionality_analysis.missing);
            
            console.log(`\n❌ Missing Functionality (${missingFeatures.length}):`);
            missingFeatures.forEach(feature => {
                console.log(`   • ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            });
        }
        
        console.log('\n✅ All new features demonstrated successfully!');
        
    } catch (error) {
        console.error('❌ Error demonstrating new features:', error.message);
    }
}

/**
 * Show how to access data programmatically
 */
function showProgrammaticAccess() {
    console.log('\n\n💻 PROGRAMMATIC ACCESS EXAMPLES:');
    console.log('=' .repeat(50));
    
    console.log(`
// 1. Access performance analysis
const performanceData = results.performance;
const pluginPerformance = performanceData.plugin_performance;
const optimizationOpps = performanceData.optimization_opportunities;

// 2. Access recommendation system
const recommendations = results.recommendations;
const topRecs = recommendations.top_recommendations;
const implementationGuide = recommendations.implementation_guide;

// 3. Access specific categories
const perfRecs = recommendations.recommendations.performance;
const funcRecs = recommendations.recommendations.functionality;

// 4. Access analysis breakdown
const assetAnalysis = recommendations.analysis.enhanced_asset_analysis;
const perfAnalysis = recommendations.analysis.performance_analysis;
const funcAnalysis = recommendations.analysis.functionality_analysis;

// 5. Generate reports
const jsonReport = analyzer.generateJsonReport(results);
const htmlReport = analyzer.generateHtmlReport(results);
    `);
}

// Run the demonstration
if (require.main === module) {
    demonstrateNewFeatures()
        .then(() => showProgrammaticAccess())
        .then(() => {
            console.log('\n🎉 Demonstration completed!');
            console.log('\n📚 Key Takeaways:');
            console.log('  • Performance analysis is in results.performance');
            console.log('  • Recommendations are in results.recommendations');
            console.log('  • Both sections are included in JSON/HTML reports');
            console.log('  • Use includePerformance: true and includeRecommendations: true');
        })
        .catch(error => {
            console.error('❌ Demonstration failed:', error);
        });
}

module.exports = {
    demonstrateNewFeatures,
    showProgrammaticAccess
};


