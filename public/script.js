// File: ./public/script.js

class WordPressAnalyzer {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.currentResults = null;
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('analysisForm');
        this.urlInput = document.getElementById('websiteUrl');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        
        // Sections
        this.analysisSection = document.getElementById('analysisSection');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorSection = document.getElementById('errorSection');
        
        // Results elements
        this.resultsContent = document.getElementById('resultsContent');
        this.analysisUrl = document.getElementById('analysisUrl');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Action buttons
        this.downloadJsonBtn = document.getElementById('downloadJson');
        this.downloadHtmlBtn = document.getElementById('downloadHtml');
        this.newAnalysisBtn = document.getElementById('newAnalysis');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Progress steps
        this.steps = {
            step1: document.getElementById('step1'),
            step2: document.getElementById('step2'),
            step3: document.getElementById('step3'),
            step4: document.getElementById('step4')
        };
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.downloadJsonBtn.addEventListener('click', () => this.downloadResults('json'));
        this.downloadHtmlBtn.addEventListener('click', () => this.downloadResults('html'));
        this.newAnalysisBtn.addEventListener('click', () => this.resetToForm());
        this.retryBtn.addEventListener('click', () => this.resetToForm());
        
        // Auto-format URL input
        this.urlInput.addEventListener('blur', () => this.formatUrl());
    }

    formatUrl() {
        let url = this.urlInput.value.trim();
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            this.urlInput.value = url;
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const url = this.urlInput.value.trim();
        if (!url) {
            this.showError('Please enter a valid URL');
            return;
        }

        this.showLoading();
        this.resetProgressSteps();
        
        try {
            // Get the analysis results with HTML report in one call
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, format: 'html' })
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentResults = data.data;
                
                if (data.htmlReport) {
                    this.showResults(data.data, data.htmlReport);
                } else {
                    this.showError('Failed to generate HTML report');
                }
            } else {
                this.showError(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Network error. Please check your connection and try again.');
        }
    }

    showLoading() {
        this.hideAllSections();
        this.loadingSection.classList.remove('hidden');
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.innerHTML = `
            <span class="btn-text">Analyzing...</span>
            <span class="btn-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </span>
        `;
    }

    showResults(results, htmlReport = null) {
        this.hideAllSections();
        this.resultsSection.classList.remove('hidden');
        this.analyzeBtn.disabled = false;
        this.analyzeBtn.innerHTML = `
            <span class="btn-text">Analyze Site</span>
            <span class="btn-icon">
                <i class="fas fa-search"></i>
            </span>
        `;
        
        this.analysisUrl.textContent = results.url;
        
        if (htmlReport) {
            this.renderServerHtmlReport(htmlReport);
        } else {
            this.renderDetailedResults(results);
        }
    }

    showError(message) {
        this.hideAllSections();
        this.errorSection.classList.remove('hidden');
        this.errorMessage.textContent = message;
        this.analyzeBtn.disabled = false;
        this.analyzeBtn.innerHTML = `
            <span class="btn-text">Analyze Site</span>
            <span class="btn-icon">
                <i class="fas fa-search"></i>
            </span>
        `;
    }

    hideAllSections() {
        this.analysisSection.classList.add('hidden');
        this.loadingSection.classList.add('hidden');
        this.resultsSection.classList.add('hidden');
        this.errorSection.classList.add('hidden');
    }

    resetToForm() {
        this.hideAllSections();
        this.analysisSection.classList.remove('hidden');
        this.urlInput.focus();
    }

    resetProgressSteps() {
        Object.values(this.steps).forEach(step => {
            step.classList.remove('active', 'completed');
        });
        this.steps.step1.classList.add('active');
    }

    updateProgressStep(stepNumber) {
        // Mark previous steps as completed
        for (let i = 1; i < stepNumber; i++) {
            this.steps[`step${i}`].classList.remove('active');
            this.steps[`step${i}`].classList.add('completed');
        }
        
        // Mark current step as active
        this.steps[`step${stepNumber}`].classList.add('active');
    }

    renderServerHtmlReport(htmlReport) {
        console.log('Rendering HTML report, length:', htmlReport.length);
        
        // Extract the body content from the HTML report
        const bodyMatch = htmlReport.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            const bodyContent = bodyMatch[1];
            
            // Extract styles from the HTML report
            const styleMatch = htmlReport.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
            let styles = '';
            if (styleMatch) {
                styles = `<style>${styleMatch[1]}</style>`;
            }
            
            // Create a scoped container for the report
            this.resultsContent.innerHTML = `
                <div class="html-report-container">
                    ${styles}
                    <div class="report-content">
                        ${bodyContent}
                    </div>
                </div>
            `;
            
            console.log('HTML report displayed with scoped styles');
        } else {
            // Fallback: display the entire HTML report
            this.resultsContent.innerHTML = htmlReport;
            console.log('HTML report displayed as fallback');
        }
    }

    renderDetailedResults(results) {
        // Fallback to simple results display if server HTML report is not available
        this.renderSimpleResults(results);
    }

    renderSimpleResults(results) {
        // Simple fallback display if server HTML report is not available
        this.resultsContent.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #6b7280;">
                <h3>Analysis Results</h3>
                <p>WordPress: ${results.wordpress?.isWordPress ? 'Detected' : 'Not detected'}</p>
                <p>Version: ${results.version?.version || 'Unknown'}</p>
                <p>Theme: ${results.theme?.name || 'Unknown'}</p>
                <p>Plugins: ${results.plugins?.length || 0}</p>
                <p style="margin-top: 1rem; font-size: 0.875rem;">
                    For detailed results, please download the HTML report.
                </p>
            </div>
        `;
    }


    downloadResults(format) {
        if (!this.currentResults) {
            alert('No results to download');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `wordpress-analysis-${timestamp}`;

        if (format === 'json') {
            const dataStr = JSON.stringify(this.currentResults, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            this.downloadBlob(dataBlob, `${filename}.json`);
        } else if (format === 'html') {
            // Generate HTML report using the server's HTML reporter
            fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url: this.currentResults.url,
                    format: 'html'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.htmlReport) {
                    const dataBlob = new Blob([data.htmlReport], { type: 'text/html' });
                    this.downloadBlob(dataBlob, `${filename}.html`);
                } else {
                    alert('Failed to generate HTML report');
                }
            })
            .catch(error => {
                console.error('Error generating HTML report:', error);
                alert('Failed to generate HTML report');
            });
        }
    }

    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WordPressAnalyzer();
});
