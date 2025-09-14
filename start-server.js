// File: ./start-server.js

const express = require('express');
const path = require('path');
const WordPressAnalyzer = require('./src/wordpress-analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize analyzer
const analyzer = new WordPressAnalyzer({
    includePerformance: true,
    includeRecommendations: true,
    verbose: true
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Main analysis endpoint
app.post('/analyze', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                error: 'URL is required',
                message: 'Please provide a URL in the request body'
            });
        }

        console.log(`🔍 Analyzing URL: ${url}`);
        
        // Perform analysis
        const results = await analyzer.analyzeSite(url);
        
        // Return results
        res.json({
            success: true,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Analysis error:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test endpoint for performance analyzer
app.post('/test-performance', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                error: 'URL is required'
            });
        }

        console.log(`🧪 Testing performance analyzer with: ${url}`);
        
        // Test performance analyzer directly
        const PerformanceAnalyzer = require('./src/detectors/performance-analyzer');
        const perfAnalyzer = new PerformanceAnalyzer(url);
        
        const results = await perfAnalyzer.analyze();
        
        res.json({
            success: true,
            performanceData: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Performance test error:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 WordPress Analyzer Server Started');
    console.log('=' .repeat(50));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Access the web interface at: http://localhost:${PORT}`);
    console.log(`🔍 API endpoint: http://localhost:${PORT}/analyze`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test-performance`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log('=' .repeat(50));
    console.log('✅ Server is ready to accept requests!');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});

module.exports = app;


