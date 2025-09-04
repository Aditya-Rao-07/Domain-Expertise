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
        ${this.generatePerformanceSection(reportData)}
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
            performance: results.performance || null,
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
     * Generate improved CSS styles
     * @returns {string} CSS styles
     */
    static generateStyles() {
        return `<style>
            :root {
                --primary-color: #2563eb;
                --primary-hover: #1d4ed8;
                --secondary-color: #64748b;
                --success-color: #059669;
                --warning-color: #d97706;
                --error-color: #dc2626;
                --background-color: #f8fafc;
                --surface-color: #ffffff;
                --border-color: #e2e8f0;
                --text-primary: #0f172a;
                --text-secondary: #64748b;
                --text-muted: #94a3b8;
                --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                --radius-sm: 0.375rem;
                --radius-md: 0.5rem;
                --radius-lg: 0.75rem;
                --radius-xl: 1rem;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: var(--text-primary);
                background-color: var(--background-color);
                font-size: 16px;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0;
                background: var(--surface-color);
                min-height: 100vh;
                box-shadow: var(--shadow-lg);
                border-radius: var(--radius-xl);
                overflow: hidden;
            }

            .header {
                background: var(--surface-color);
                color: var(--text-primary);
                padding: 3rem 2rem;
                text-align: center;
                margin-bottom: 0;
                border-bottom: 2px solid var(--border-color);
            }

            .header h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                letter-spacing: -0.025em;
                color: var(--text-primary);
            }

            .header .subtitle {
                font-size: 1.125rem;
                color: var(--text-secondary);
                font-weight: 400;
            }

            .header .domain {
                font-size: 1.25rem;
                font-weight: 600;
                margin-top: 0.5rem;
                color: var(--text-primary);
            }

            .summary-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                padding: 2rem;
                background: var(--surface-color);
                border-bottom: 1px solid var(--border-color);
            }

            .card {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                padding: 1.5rem;
                text-align: center;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
                box-shadow: var(--shadow-sm);
            }

            .card:hover {
                box-shadow: var(--shadow-sm);
            }

            .card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--border-color);
            }

            .card.primary::before {
                background: var(--text-primary);
            }

            .card.success::before {
                background: var(--text-primary);
            }

            .card.warning::before {
                background: var(--text-primary);
            }

            .card.error::before {
                background: var(--text-primary);
            }

            .card.danger::before {
                background: var(--text-primary);
            }

            .card.info::before {
                background: #3b82f6;
            }

            .card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }

            .card-title {
                font-size: 0.875rem;
                font-weight: 500;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 0.5rem;
            }

            .card-value {
                font-size: 2.5rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
                line-height: 1;
            }

            .card-description {
                font-size: 0.875rem;
                color: #9ca3af;
                line-height: 1.4;
            }

            .section {
                margin-bottom: 0;
                border-bottom: 1px solid #e5e7eb;
                background: #ffffff;
            }

            .section:last-child {
                border-bottom: none;
            }

            .section-title {
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 1rem;
                padding: 2rem 2rem 0 2rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .section-title::before {
                content: '';
                width: 4px;
                height: 1.5rem;
                background: var(--text-primary);
                border-radius: 2px;
            }

            .section-content {
                padding: 0 2rem 2rem 2rem;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .info-item {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                padding: 1rem;
                background: var(--background-color);
                border-radius: var(--radius-md);
                border: 1px solid var(--border-color);
            }

            .info-label {
                font-size: 0.75rem;
                font-weight: 500;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .info-value {
                font-size: 1rem;
                font-weight: 500;
                color: var(--text-primary);
            }

            .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 0.375rem 0.75rem;
                border-radius: var(--radius-sm);
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border: 1px solid transparent;
            }

            .status-badge::before {
                content: '';
                width: 6px;
                height: 6px;
                border-radius: 50%;
                margin-right: 0.5rem;
                background: currentColor;
            }

            .status-success {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #bae6fd;
            }

            .status-warning {
                background: #fffbeb;
                color: #d97706;
                border-color: #fed7aa;
            }

            .status-danger {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }

            .status-info {
                background: #f8fafc;
                color: #475569;
                border-color: #cbd5e1;
            }

            .status-secondary {
                background: #f9fafb;
                color: #6b7280;
                border-color: #d1d5db;
            }

            .plugin-list {
                display: grid;
                gap: 1.5rem;
            }

            .plugin-item {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                padding: 1.5rem;
                transition: all 0.2s ease;
                box-shadow: var(--shadow-sm);
                position: relative;
            }

            .plugin-item:hover {
                box-shadow: var(--shadow-sm);
            }

            .plugin-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--border-color);
                border-radius: var(--radius-lg) var(--radius-lg) 0 0;
            }

            .plugin-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .plugin-main-info {
                flex: 1;
            }

            .plugin-name {
                font-size: 1.125rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .plugin-meta {
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 0.25rem;
            }

            .plugin-status {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 0.5rem;
            }

            .plugin-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 1rem 0;
                padding: 1rem;
                background: #f9fafb;
                border-radius: 8px;
            }

            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .detail-label {
                font-size: 0.75rem;
                font-weight: 500;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .detail-value {
                font-size: 0.875rem;
                font-weight: 500;
                color: #1f2937;
            }

            .recommendations {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
            }

            .recommendations h4 {
                margin: 0 0 0.75rem 0;
                font-size: 0.875rem;
                font-weight: 600;
                color: #1f2937;
            }

            .recommendations ul {
                margin: 0;
                padding-left: 1.25rem;
            }

            .recommendation-item {
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
                line-height: 1.5;
                padding: 0.75rem;
                background: #ffffff;
                border-radius: 6px;
                border-left: 4px solid;
            }

            .recommendation-item.high {
                border-left-color: #dc2626;
                background: #fef2f2;
            }

            .recommendation-item.medium {
                border-left-color: #ea580c;
                background: #fffbeb;
            }

            .recommendation-item.low {
                border-left-color: #059669;
                background: #ecfdf5;
            }

            .plugin-description {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 0.875rem;
                line-height: 1.6;
                color: #6b7280;
            }

            .empty-state {
                text-align: center;
                padding: 3rem 2rem;
                color: #6b7280;
            }

            .empty-state h3 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #374151;
                margin-bottom: 0.5rem;
            }

            .empty-state p {
                font-size: 0.875rem;
                max-width: 400px;
                margin: 0 auto;
            }

            .footer {
                background: var(--background-color);
                border-top: 1px solid var(--border-color);
                padding: 2rem;
                text-align: center;
                color: var(--text-secondary);
                font-size: 0.875rem;
                position: relative;
            }

            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 60px;
                height: 2px;
                background: var(--border-color);
                border-radius: 2px;
            }

            .footer p {
                margin-bottom: 0.5rem;
            }

            .footer p:last-child {
                margin-bottom: 0;
                font-size: 0.75rem;
                opacity: 0.7;
            }

            .subsection-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 1rem;
                margin-top: 2rem;
            }

            @media (max-width: 768px) {
                .header {
                    padding: 2rem 1rem;
                }

                .header h1 {
                    font-size: 2rem;
                }

                .summary-cards {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 1.5rem;
                }

                .section-title {
                    padding: 1.5rem 1.5rem 0 1.5rem;
                }

                .section-content {
                    padding: 0 1.5rem 1.5rem 1.5rem;
                }

                .info-grid {
                    grid-template-columns: 1fr;
                }

                .plugin-header {
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .plugin-details {
                    grid-template-columns: 1fr;
                }

                .plugin-item {
                    padding: 1rem;
                }
            }

            @media print {
                body {
                    background: white;
                }
                
                .container {
                    max-width: none;
                    box-shadow: none;
                }
                
                .card,
                .plugin-item {
                    break-inside: avoid;
                }

                .header {
                    background: white !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
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
            <div class="subtitle">Comprehensive site analysis and recommendations</div>
            <div class="domain">${data.domain}</div>
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
                <div class="card primary">
                    <div class="card-title">Site Status</div>
                    <div class="card-value">Not WordPress</div>
                    <div class="card-description">This site does not appear to be running WordPress</div>
                </div>
            </div>`;
        }

        const statusClass = data.overallStatus.status === 'good' ? 'success' : 
                          data.overallStatus.status === 'warning' ? 'warning' : 'danger';

        return `
        <div class="summary-cards">
            <div class="card primary">
                <div class="card-title">Total Plugins</div>
                <div class="card-value">${data.pluginStats.total}</div>
                <div class="card-description">Detected on this WordPress site</div>
            </div>
            
            <div class="card ${statusClass}">
                <div class="card-title">Overall Status</div>
                <div class="card-value">
                    <span class="status-badge ${statusClass}">${data.overallStatus.label}</span>
                </div>
                <div class="card-description">Based on plugin maintenance status</div>
            </div>
            
            <div class="card info">
                <div class="card-title">WordPress Version</div>
                <div class="card-value">${data.version?.version || 'Unknown'}</div>
                <div class="card-description">${data.version?.confidence ? `${data.version.confidence} confidence` : 'Version not detected'}</div>
            </div>
            
            ${data.performance ? `
            <div class="card info">
                <div class="card-title">Performance Impact</div>
                <div class="card-value">${data.performance.main_page_timing?.total_time?.toFixed(2) || 'Unknown'}s</div>
                <div class="card-description">
                    ${Object.keys(data.performance.plugin_performance || {}).length} plugins analyzed
                </div>
            </div>` : ''}
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
                <div class="section-content">
                    <div class="empty-state">
                        <h3>Not a WordPress Site</h3>
                        <p>This site does not appear to be running WordPress based on our analysis.</p>
                    </div>
                </div>
            </section>`;
        }

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
                            <span class="status-badge status-success">${data.wordpress.confidence || 'Unknown'}</span>
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
                <div class="section-content">
                    <div class="empty-state">
                        <h3>Version Not Detected</h3>
                        <p>Could not determine the WordPress version for this site.</p>
                    </div>
                </div>
            </section>`;
        }

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
                <div class="section-content">
                    <div class="empty-state">
                        <h3>Theme Not Detected</h3>
                        <p>Could not identify the active theme for this site.</p>
                    </div>
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
                <div class="section-content">
                    <div class="empty-state">
                        <h3>No Plugins Detected</h3>
                        <p>No plugins were detected or they are not publicly detectable.</p>
                    </div>
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
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Total Plugins</div>
                        <div class="info-value">${data.pluginStats.total}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Up to Date</div>
                        <div class="info-value">
                            <span class="status-badge status-success">${data.pluginStats.upToDate}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Outdated</div>
                        <div class="info-value">
                            <span class="status-badge status-danger">${data.pluginStats.outdated}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Unknown Status</div>
                        <div class="info-value">
                            <span class="status-badge status-secondary">${data.pluginStats.unknown}</span>
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
     * Generate performance analysis section
     * @param {Object} data - Processed report data
     * @returns {string} Performance section HTML
     */
    static generatePerformanceSection(data) {
        if (!data.wordpress.isWordPress || !data.performance) return '';

        const performance = data.performance;
        const pluginPerformance = performance.plugin_performance || {};
        const recommendations = performance.recommendations || [];

        if (Object.keys(pluginPerformance).length === 0) {
            return `
            <section class="section">
                <h2 class="section-title">Performance Analysis</h2>
                <div class="section-content">
                    <div class="empty-state">
                        <h3>No Performance Data Available</h3>
                        <p>No plugin performance data was collected during analysis.</p>
                    </div>
                </div>
            </section>`;
        }

        // Main page timing
        const mainTiming = performance.main_page_timing;
        
        // Sort plugins by performance score (worst first)
        const sortedPlugins = Object.entries(pluginPerformance)
            .sort(([, a], [, b]) => (b.performance_score || 0) - (a.performance_score || 0))
            .slice(0, 10); // Top 10 worst performers

        // Generate plugin performance list
        const pluginsList = sortedPlugins.map(([pluginName, data]) => {
            const score = data.performance_score || 0;
            const scoreClass = score > 70 ? 'status-danger' : 
                             score > 40 ? 'status-warning' : 'status-success';
            const scoreText = score > 70 ? 'Critical' : 
                            score > 40 ? 'Poor' : 'Good';

            return `
            <div class="plugin-item">
                <div class="plugin-header">
                    <div class="plugin-main-info">
                        <div class="plugin-name">${pluginName}</div>
                        <div class="plugin-meta">Performance Score: ${score}/100</div>
                    </div>
                    <div class="plugin-status">
                        <span class="status-badge ${scoreClass}">${scoreText}</span>
                    </div>
                </div>
                
                <div class="plugin-details">
                    <div class="detail-item">
                        <div class="detail-label">Total Size</div>
                        <div class="detail-value">${this.formatNumber(data.total_size)} bytes (${(data.total_size / 1024).toFixed(1)} KB)</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Total Requests</div>
                        <div class="detail-value">${data.total_requests}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">CSS Files</div>
                        <div class="detail-value">${data.css_files.length} (${(data.css_size / 1024).toFixed(1)} KB)</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">JavaScript Files</div>
                        <div class="detail-value">${data.js_files.length} (${(data.js_size / 1024).toFixed(1)} KB)</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Blocking Resources</div>
                        <div class="detail-value">${data.blocking_resources}</div>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Generate recommendations list
        const recommendationsList = recommendations.map(rec => {
            return `
            <div class="recommendation-item ${rec.priority}">
                <div style="margin-bottom: 0.5rem;">
                    <strong>${rec.title}</strong>
                </div>
                <div style="margin-bottom: 0.5rem; color: #6b7280;">
                    ${rec.description}
                </div>
                <div style="margin-bottom: 0.25rem;">
                    <strong>Action:</strong> ${rec.action}
                </div>
                <div style="margin-bottom: 0.25rem;">
                    <strong>Impact:</strong> ${rec.impact}
                </div>
                <div>
                    <strong>Effort:</strong> ${rec.effort}
                </div>
            </div>`;
        }).join('');

        return `
        <section class="section">
            <h2 class="section-title">Performance Analysis</h2>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Page Load Time</div>
                        <div class="info-value">${mainTiming?.total_time?.toFixed(2) || 'Unknown'}s</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Page Size</div>
                        <div class="info-value">${this.formatNumber(mainTiming?.content_length || 0)} bytes</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Plugins Analyzed</div>
                        <div class="info-value">${Object.keys(pluginPerformance).length}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Recommendations</div>
                        <div class="info-value">${recommendations.length}</div>
                    </div>
                </div>

                ${recommendations.length > 0 ? `
                <div class="subsection-title">Actionable Recommendations</div>
                <div class="recommendations" style="margin-top: 0;">
                    ${recommendationsList}
                </div>` : ''}

                <div class="subsection-title">Plugin Performance Ranking (Worst First)</div>
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
            <p>This report analyzes publicly available information and does not access private data.</p>
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
