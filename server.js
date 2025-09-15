// File: ./server.js

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const WordPressAnalyzer = require('./src/wordpress-analyzer');
const EmailService = require('./src/services/email-service');

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

// Initialize email service
const emailService = new EmailService();

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

// PDF report endpoint
app.post('/api/analyze/pdf', async (req, res) => {
    try {
        const { url, filename, format, options } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                error: 'URL is required',
                success: false 
            });
        }

        console.log(`🔍 Starting PDF analysis for: ${url}`);
        
        // Perform analysis
        const results = await analyzer.analyzeSite(url);
        
        console.log(`✅ Analysis completed for: ${url}`);
        console.log('📄 Generating PDF report...');
        
        try {
            let pdfData;
            const pdfOptions = options || {};
            
            // Generate PDF based on format parameter
            switch (format) {
                case 'print':
                    pdfData = await analyzer.generatePrintOptimizedPdfReport(results, pdfOptions);
                    break;
                case 'landscape':
                    pdfData = await analyzer.generateLandscapePdfReport(results, pdfOptions);
                    break;
                case 'with-filename':
                    const pdfWithFilename = await analyzer.generatePdfReportWithFilename(results, filename, pdfOptions);
                    pdfData = pdfWithFilename.buffer;
                    break;
                default:
                    pdfData = await analyzer.generatePdfReport(results, pdfOptions);
            }
            
            console.log(`✅ PDF report generated, size: ${pdfData.length} bytes`);
            
            // Set appropriate headers for PDF download
            const reportData = analyzer.generateJsonReport(results);
            const domain = new URL(url).hostname;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const defaultFilename = `wordpress-analysis-${domain}-${timestamp}.pdf`;
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename || defaultFilename}"`);
            res.setHeader('Content-Length', pdfData.length);
            res.setHeader('Cache-Control', 'no-cache');
            
            // Send PDF buffer
            res.send(pdfData);
            
        } catch (pdfError) {
            console.error('❌ PDF generation failed:', pdfError.message);
            return res.status(500).json({
                success: false,
                error: `PDF generation failed: ${pdfError.message}`,
                data: results
            });
        }
        
    } catch (error) {
        console.error('❌ PDF analysis failed:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            data: null
        });
    }
});

// Email report endpoint
app.post('/api/analyze/email', async (req, res) => {
    try {
        const { url, email, format, options } = req.body;
        
        // Validate required parameters
        if (!url) {
            return res.status(400).json({ 
                error: 'URL is required',
                success: false 
            });
        }
        
        if (!email) {
            return res.status(400).json({ 
                error: 'Email address is required',
                success: false 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email address format',
                success: false 
            });
        }

        console.log(`🔍 Starting email analysis for: ${url} → ${email}`);
        
        // Perform analysis
        const results = await analyzer.analyzeSite(url);
        
        console.log(`✅ Analysis completed for: ${url}`);
        console.log('📄 Generating PDF report...');
        
        try {
            // Generate PDF report
            const pdfOptions = options || {};
            let pdfBuffer;
            
            // Generate PDF based on format parameter
            switch (format) {
                case 'print':
                    pdfBuffer = await analyzer.generatePrintOptimizedPdfReport(results, pdfOptions);
                    break;
                case 'landscape':
                    pdfBuffer = await analyzer.generateLandscapePdfReport(results, pdfOptions);
                    break;
                default:
                    pdfBuffer = await analyzer.generatePdfReport(results, pdfOptions);
            }
            
            console.log(`✅ PDF report generated, size: ${pdfBuffer.length} bytes`);
            console.log('📧 Sending email...');
            
            // Send email with PDF attachment
            const emailResult = await emailService.sendAnalysisReport(
                email, 
                url, 
                pdfBuffer, 
                results, 
                { format: format || 'standard' }
            );
            
            console.log(`✅ Email sent successfully to ${email}`);
            
            res.json({
                success: true,
                message: 'Analysis report sent successfully',
                data: {
                    recipient: emailResult.recipient,
                    siteUrl: emailResult.siteUrl,
                    messageId: emailResult.messageId,
                    filename: emailResult.filename,
                    analysisSummary: {
                        isWordPress: results.wordpress?.isWordPress || false,
                        version: results.version?.version || null,
                        theme: results.theme?.displayName || results.theme?.name || null,
                        pluginCount: results.plugins?.length || 0,
                        outdatedPlugins: results.plugins?.filter(p => p.isOutdated === true).length || 0
                    }
                }
            });
            
        } catch (pdfError) {
            console.error('❌ PDF generation failed:', pdfError.message);
            return res.status(500).json({
                success: false,
                error: `PDF generation failed: ${pdfError.message}`,
                data: results
            });
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            return res.status(500).json({
                success: false,
                error: `Email sending failed: ${emailError.message}`,
                data: results
            });
        }
        
    } catch (error) {
        console.error('❌ Email analysis failed:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            data: null
        });
    }
});

// Email test endpoint
app.post('/api/email/test', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                error: 'Email address is required',
                success: false 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email address format',
                success: false 
            });
        }

        console.log(`📧 Sending test email to: ${email}`);
        
        // Send test email
        const result = await emailService.sendTestEmail(email);
        
        console.log(`✅ Test email sent successfully to ${email}`);
        
        res.json({
            success: true,
            message: 'Test email sent successfully',
            data: {
                recipient: result.recipient,
                messageId: result.messageId
            }
        });
        
    } catch (error) {
        console.error('❌ Test email failed:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            data: null
        });
    }
});

// Email configuration test endpoint
app.get('/api/email/config', async (req, res) => {
    try {
        const testResult = await emailService.testConnection();
        
        res.json({
            success: testResult.success,
            message: testResult.success ? 'Email service is properly configured' : 'Email service configuration issue',
            data: testResult
        });
        
    } catch (error) {
        console.error('❌ Email config test failed:', error.message);
        
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
    console.log(`📄 PDF endpoint: http://localhost:${PORT}/api/analyze/pdf`);
    console.log(`📧 Email endpoint: http://localhost:${PORT}/api/analyze/email`);
    console.log(`📧 Email test: http://localhost:${PORT}/api/email/test`);
    console.log(`📧 Email config: http://localhost:${PORT}/api/email/config`);
});

module.exports = app;
