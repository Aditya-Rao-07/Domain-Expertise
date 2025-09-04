// File: ./server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const WordPressAnalyzer = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize analyzer
const analyzer = new WordPressAnalyzer({
    includePlugins: true,
    includeTheme: true,
    includeVersion: true,
    includePerformance: true
});

// API endpoint for analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { url, format } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                error: 'URL is required',
                success: false 
            });
        }

        console.log(`🔍 Starting analysis for: ${url}`);
        
        // Perform analysis
        const results = await analyzer.analyzeSite(url);
        
        console.log(`✅ Analysis completed for: ${url}`);
        
        // If HTML format is requested, generate HTML report
        if (format === 'html') {
            console.log('🔧 Generating HTML report...');
            try {
                const htmlReport = analyzer.generateHtmlReport(results);
                console.log(`✅ HTML report generated, length: ${htmlReport.length}`);
                return res.json({
                    success: true,
                    data: results,
                    htmlReport: htmlReport
                });
            } catch (error) {
                console.error('❌ HTML report generation failed:', error.message);
                return res.status(500).json({
                    success: false,
                    error: `HTML report generation failed: ${error.message}`,
                    data: results
                });
            }
        }
        
        res.json({
            success: true,
            data: results
        });
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            data: null
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WordPress Analyzer Web Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 API endpoint: http://localhost:${PORT}/api/analyze`);
});

module.exports = app;
