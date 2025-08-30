// File: ./src/reporters/html-reporter.js

/**
 * HTML reporter for WordPress analysis results
 * Generates clean, professional HTML reports with minimal styling
 */
class HtmlReporter {
    /**
     * Generate HTML report
     * @param {Object} results - Analysis results
     * @param {Object} options - Report options
     * @returns {string} Complete HTML document
     */
    static generate(results, options = {}) {
        const reportData = this.processResults(results);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordPress Analysis Report - ${reportData.domain}</title>
    ${this.generateStyles()}
</head>
<body>
    <div class="container">
        ${this.generateHeader(reportData)}
        ${this.generateSummaryCards(reportData)}
        ${this.generateWordPressSection(reportData)}
        ${this.generateVersionSection(reportData)}
        ${this.generateThemeSection(reportData)}
        ${this.generatePluginsSection(reportData)}
        ${this.generateFooter(reportData)}
    </div>
    ${this.generateScripts()}
</body>
</html>`;
    }

    /**
     * Process analysis results for HTML generation
     * @param {Object} results - Raw analysis results
     * @returns {Object} Processed data for HTML generation
     */
    static processResults(results) {
        const url = new URL(results.url);
        
        return {
            domain: url.hostname,
            url: results.url,
            timestamp: new Date(results.timestamp),
            duration: results.duration || 0,
            wordpress: results.wordpress || { isWordPress: false },
            version: results.version || null,
            theme: results.theme || null,
            plugins: results.plugins || [],
            pluginStats: this.calculatePluginStats(results.plugins || []),
            overallStatus: this.calculateOverallStatus(results)
        };
    }

    /**
     * Calculate plugin statistics
     * @param {Array} plugins - Plugin array
     * @returns {Object} Plugin statistics
     */
    static calculatePluginStats(plugins) {
        return {
            total: plugins.length,
            outdated: plugins.filter(p => p.isOutdated === true).length,
            upToDate: plugins.filter(p => p.isOutdated === false).length,
            unknown: plugins.filter(p => p.isOutdated === null).length
        };
    }



    /**
     * Calculate overall status
     * @param {Object} results - Analysis results
     * @returns {Object} Overall status assessment
     */
    static calculateOverallStatus(results) {
        if (!results.wordpress?.isWordPress) {
            return { status: 'not-wordpress', label: 'Not WordPress', color: '#6b7280' };
        }

        const outdated = (results.plugins || []).filter(p => p.isOutdated === true).length;
        
        if (outdated === 0) {
            return { status: 'good', label: 'Good', color: '#10b981' };
        } else if (outdated <= 2) {
            return { status: 'warning', label: 'Needs Attention', color: '#f59e0b' };
        } else {
            return { status: 'critical', label: 'Critical', color: '#ef4444' };
        }
    }



    /**
     * Generate CSS styles
     * @returns {string} CSS styles
     */
    static generateStyles() {
        return `<style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                background-color: #ffffff;
                font-size: 14px;
            }

            .container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 40px 20px;
            }

            .header {
                text-align: left;
                margin-bottom: 50px;
                padding-bottom: 30px;
                border-bottom: 1px solid #e5e5e5;
            }

            .header h1 {
                font-size: 32px;
                font-weight: 600;
                margin-bottom: 8px;
                color: #1a1a1a;
            }

            .header .subtitle {
                font-size: 16px;
                color: #666666;
                font-weight: 400;
            }

            .summary-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 50px;
            }

            .card {
                background: #fafafa;
                border: 1px solid #e5e5e5;
                padding: 24px;
                border-radius: 4px;
            }

            .card-header {
                margin-bottom: 16px;
            }

            .card-title {
                font-size: 14px;
                font-weight: 500;
                color: #666666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
            }

            .card-value {
                font-size: 28px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 4px;
            }

            .card-description {
                font-size: 13px;
                color: #666666;
            }

            .section {
                margin-bottom: 40px;
                border: 1px solid #e5e5e5;
                border-radius: 4px;
                background: #ffffff;
            }

            .section-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 24px;
                color: #1a1a1a;
                padding: 24px 24px 0 24px;
            }

            .section-content {
                padding: 0 24px 24px 24px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }

            .info-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .info-label {
                font-size: 12px;
                font-weight: 500;
                color: #666666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .info-value {
                font-size: 14px;
                font-weight: 500;
                color: #1a1a1a;
            }

            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .status-success { 
                background: #f0f9f0; 
                color: #166534; 
                border: 1px solid #bbf7d0;
            }
            
            .status-warning { 
                background: #fffbeb; 
                color: #92400e; 
                border: 1px solid #fed7aa;
            }
            
            .status-danger { 
                background: #fef2f2; 
                color: #991b1b; 
                border: 1px solid #fecaca;
            }
            
            .status-info { 
                background: #f0f9ff; 
                color: #1e40af; 
                border: 1px solid #bfdbfe;
            }
            
            .status-secondary { 
                background: #f9fafb; 
                color: #374151; 
                border: 1px solid #d1d5db;
            }

            .plugin-list {
                display: grid;
                gap: 16px;
            }

            .plugin-item {
                border: 1px solid #e5e5e5;
                border-radius: 4px;
                padding: 20px;
                background: #fafafa;
            }

            .plugin-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }

            .plugin-main-info {
                flex: 1;
            }

            .plugin-name {
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 4px;
                font-size: 16px;
            }

            .plugin-meta {
                font-size: 13px;
                color: #666666;
            }

            .plugin-status {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;
            }

            .health-score {
                font-size: 12px;
                font-weight: 500;
                color: #666666;
            }

            .plugin-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin: 16px 0;
                padding: 16px;
                background: #ffffff;
                border: 1px solid #e5e5e5;
                border-radius: 4px;
            }

            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .detail-label {
                font-size: 12px;
                font-weight: 500;
                color: #666666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .detail-value {
                font-size: 14px;
                font-weight: 500;
                color: #1a1a1a;
            }

            .recommendations {
                margin-top: 16px;
                padding: 16px;
                background: #f8f9fa;
                border: 1px solid #e5e5e5;
                border-radius: 4px;
            }

            .recommendations h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                color: #1a1a1a;
            }

            .recommendations ul {
                margin: 0;
                padding-left: 20px;
            }

            .recommendation-item {
                margin-bottom: 8px;
                font-size: 13px;
                line-height: 1.5;
            }

            .recommendation-item.high {
                color: #dc2626;
            }

            .recommendation-item.medium {
                color: #ea580c;
            }

            .recommendation-item.low {
                color: #059669;
            }

            .plugin-description {
                margin-top: 16px;
                padding: 16px;
                background: #f8f9fa;
                border: 1px solid #e5e5e5;
                border-radius: 4px;
                font-size: 13px;
                line-height: 1.6;
                color: #666666;
            }

            .footer {
                text-align: center;
                padding: 40px 0;
                color: #666666;
                font-size: 13px;
                border-top: 1px solid #e5e5e5;
                margin-top: 50px;
            }

            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #666666;
                font-size: 14px;
            }

            @media (max-width: 768px) {
                .container {
                    padding: 20px 15px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .summary-cards {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .plugin-header {
                    flex-direction: column;
                    gap: 12px;
                }

                .plugin-details {
                    grid-template-columns: 1fr;
                }
            }

            @media print {
                body {
                    background: white;
                }
                
                .container {
                    max-width: none;
                    padding: 0;
                }
                
                .card,
                .plugin-item {
                    break-inside: avoid;
                }
            }
        </style>`;
    }

    /**
     * Generate header section
     * @param {Object} data - Processed report data
     * @returns {string} Header HTML
     */
    static generateHeader(data) {
        const analysisDate = data.timestamp.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
        <header class="header">
            <h1>WordPress Analysis Report</h1>
            <div class="subtitle">
                <strong>${data.domain}</strong> • Analyzed on ${analysisDate}
            </div>
        </header>`;
    }

    /**
     * Generate summary cards
     * @param {Object} data - Processed report data
     * @returns {string} Summary cards HTML
     */
    static generateSummaryCards(data) {
        if (!data.wordpress.isWordPress) {
            return `
            <div class="summary-cards">
                            <div class="card">
                <div class="card-header">
                    <div class="card-title">Site Status</div>
                </div>
                <div class="card-value">Not WordPress</div>
                <div class="card-description">This site does not appear to be running WordPress</div>
            </div>
            </div>`;
        }

        return `
        <div class="summary-cards">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Overall Status</div>
                </div>
                <div class="card-value">${data.overallStatus.label}</div>
                <div class="card-description">Based on plugin maintenance status</div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-title">WordPress Version</div>
                </div>
                <div class="card-value">${data.version?.version || 'Unknown'}</div>
                <div class="card-description">${data.version?.confidence ? `${data.version.confidence} confidence` : 'Version not detected'}</div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Plugins Found</div>
                </div>
                <div class="card-value">${data.pluginStats.total}</div>
                <div class="card-description">
                    ${data.pluginStats.outdated > 0 ? 
                        `${data.pluginStats.outdated} outdated` : 'All up to date'}
                </div>
            </div>
            

        </div>`;
    }

    /**
     * Generate WordPress detection section
     * @param {Object} data - Processed report data
     * @returns {string} WordPress section HTML
     */
    static generateWordPressSection(data) {
        if (!data.wordpress.isWordPress) {
            return `
            <section class="section">
                <h2 class="section-title">WordPress Detection</h2>
                <div class="empty-state">
                    <h3>Not a WordPress Site</h3>
                    <p>This site does not appear to be running WordPress based on our analysis.</p>
                </div>
            </section>`;
        }

        const confidenceBadge = 'badge-secondary';

        return `
        <section class="section">
            <h2 class="section-title">WordPress Detection</h2>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value">WordPress Detected</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Confidence</div>
                        <div class="info-value">
                            <span class="status-badge status-info">${data.wordpress.confidence || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Detection Score</div>
                        <div class="info-value">${data.wordpress.score || 0}/100</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Indicators Found</div>
                        <div class="info-value">${data.wordpress.indicators?.length || 0}</div>
                    </div>
                </div>
            </div>
        </section>`;
    }

    /**
     * Generate version section
     * @param {Object} data - Processed report data
     * @returns {string} Version section HTML
     */
    static generateVersionSection(data) {
        if (!data.wordpress.isWordPress) return '';

        if (!data.version || !data.version.version) {
            return `
            <section class="section">
                <h2 class="section-title">WordPress Version</h2>
                <div class="empty-state">
                    <h3>Version Not Detected</h3>
                    <p>Could not determine the WordPress version for this site.</p>
                </div>
            </section>`;
        }

        const confidenceBadge = 'badge-secondary';

        return `
        <section class="section">
            <h2 class="section-title">WordPress Version</h2>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Version</div>
                        <div class="info-value">${data.version.version}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Detection Method</div>
                        <div class="info-value">${data.version.method || 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Confidence</div>
                        <div class="info-value">
                            <span class="status-badge status-info">${data.version.confidence || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Source</div>
                        <div class="info-value">${data.version.source || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </section>`;
    }

    /**
     * Generate theme section
     * @param {Object} data - Processed report data
     * @returns {string} Theme section HTML
     */
    static generateThemeSection(data) {
        if (!data.wordpress.isWordPress) return '';

        if (!data.theme || !data.theme.name) {
            return `
            <section class="section">
                <h2 class="section-title">Active Theme</h2>
                <div class="empty-state">
                    <h3>Theme Not Detected</h3>
                    <p>Could not identify the active theme for this site.</p>
                </div>
            </section>`;
        }

        return `
        <section class="section">
            <h2 class="section-title">Active Theme</h2>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Theme Name</div>
                        <div class="info-value">${data.theme.displayName || data.theme.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Directory</div>
                        <div class="info-value">${data.theme.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Version</div>
                        <div class="info-value">${data.theme.version || 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Author</div>
                        <div class="info-value">${data.theme.author || 'Unknown'}</div>
                    </div>
                </div>
            </div>
        </section>`;
    }

    /**
     * Generate plugins section
     * @param {Object} data - Processed report data
     * @returns {string} Plugins section HTML
     */
    static generatePluginsSection(data) {
        if (!data.wordpress.isWordPress) return '';

        if (data.plugins.length === 0) {
            return `
            <section class="section">
                <h2 class="section-title">Detected Plugins</h2>
                <div class="empty-state">
                    <h3>No Plugins Detected</h3>
                    <p>No plugins were detected or they are not publicly detectable.</p>
                </div>
            </section>`;
        }

        // Sort plugins: outdated first, then by name
        const sortedPlugins = [...data.plugins].sort((a, b) => {
            if (a.isOutdated === true && b.isOutdated !== true) return -1;
            if (b.isOutdated === true && a.isOutdated !== true) return 1;
            return (a.displayName || a.name).localeCompare(b.displayName || b.name);
        });

        const pluginsList = sortedPlugins.map(plugin => {
            const statusClass = plugin.isOutdated === true ? 'status-danger' :
                              plugin.isOutdated === false ? 'status-success' : 'status-secondary';
            const statusText = plugin.isOutdated === true ? 'Outdated' :
                              plugin.isOutdated === false ? 'Up to Date' : 'Unknown';

            return `
            <div class="plugin-item">
                <div class="plugin-header">
                    <div class="plugin-main-info">
                        <div class="plugin-name">${plugin.displayName || plugin.name}</div>
                        <div class="plugin-meta">Directory: ${plugin.name}</div>
                        ${plugin.author ? `<div class="plugin-meta">Author: ${plugin.author}</div>` : ''}
                    </div>
                    <div class="plugin-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="plugin-details">
                    <div class="detail-item">
                        <div class="detail-label">Current Version</div>
                        <div class="detail-value">${plugin.version || 'Unknown'}</div>
                    </div>
                    ${plugin.latestVersion ? `
                    <div class="detail-item">
                        <div class="detail-label">Latest Version</div>
                        <div class="detail-value">${plugin.latestVersion}</div>
                    </div>` : ''}
                    ${plugin.lastUpdated ? `
                    <div class="detail-item">
                        <div class="detail-label">Last Updated</div>
                        <div class="detail-value">${this.formatDate(plugin.lastUpdated) || 'Unknown'}</div>
                    </div>` : ''}
                    ${plugin.confidence ? `
                    <div class="detail-item">
                        <div class="detail-label">Detection Confidence</div>
                        <div class="detail-value">${plugin.confidence}</div>
                    </div>` : ''}
                    ${plugin.ratingOutOfFive ? `
                    <div class="detail-item">
                        <div class="detail-label">Rating</div>
                        <div class="detail-value">${plugin.ratingOutOfFive}/5 (${plugin.numRatings || 0} reviews)</div>
                    </div>` : ''}
                    ${plugin.downloadCount ? `
                    <div class="detail-item">
                        <div class="detail-label">Downloads</div>
                        <div class="detail-value">${this.formatNumber(plugin.downloadCount) || 'Unknown'}</div>
                    </div>` : ''}
                </div>
                
                ${plugin.recommendations && plugin.recommendations.length > 0 ? `
                <div class="recommendations">
                    <h4>Recommendations</h4>
                    <ul>
                        ${plugin.recommendations.map(rec => `
                        <li class="recommendation-item ${rec.priority}">
                            ${rec.message}
                        </li>`).join('')}
                    </ul>
                </div>` : ''}
                
                ${plugin.shortDescription ? `
                <div class="plugin-description">
                    <p>${plugin.shortDescription}</p>
                </div>` : ''}
            </div>`;
        }).join('');

        return `
        <section class="section">
            <h2 class="section-title">Detected Plugins (${data.plugins.length})</h2>
            <div class="section-content">
                <div style="margin-bottom: 24px;">
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Total Plugins</div>
                            <div class="info-value">${data.pluginStats.total}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Up to Date</div>
                            <div class="info-value">${data.pluginStats.upToDate}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Outdated</div>
                            <div class="info-value">${data.pluginStats.outdated}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Unknown Status</div>
                            <div class="info-value">${data.pluginStats.unknown}</div>
                        </div>
                    </div>
                </div>
                <div class="plugin-list">
                    ${pluginsList}
                </div>
            </div>
        </section>`;
    }



    /**
     * Generate footer
     * @param {Object} data - Processed report data
     * @returns {string} Footer HTML
     */
    static generateFooter(data) {
        return `
        <footer class="footer">
            <p>Report generated by WordPress Site Analyzer v2.0.0</p>
            <p>Analysis completed in ${data.duration}ms on ${data.timestamp.toLocaleString()}</p>
            <p style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.7;">
                This report analyzes publicly available information and does not access private data.
            </p>
        </footer>`;
    }

    /**
     * Format date
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    static formatDate(dateString) {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    static formatNumber(num) {
        if (!num || isNaN(num)) return null;
        return num.toLocaleString();
    }

    /**
     * Generate JavaScript for interactive features
     * @returns {string} JavaScript code
     */
    static generateScripts() {
        return `<script>
            // Add print functionality
            function printReport() {
                window.print();
            }
            
            // Add keyboard shortcut for printing
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'p') {
                    e.preventDefault();
                    printReport();
                }
            });
            
            // Add smooth scroll behavior for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
            
            // Add copy URL functionality
            function copyUrl() {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Report URL copied to clipboard!');
                });
            }
        </script>`;
    }
}

module.exports = HtmlReporter;
