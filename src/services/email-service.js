// File: ./src/services/email-service.js

const nodemailer = require('nodemailer');
const path = require('path');

/**
 * Email service for sending WordPress analysis reports
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter based on environment variables
     */
    initializeTransporter() {
        const emailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };

        // Validate required email configuration
        if (!emailConfig.auth.user || !emailConfig.auth.pass) {
            console.warn('⚠️  Email configuration incomplete. Email functionality will be disabled.');
            console.warn('Please set SMTP_USER and SMTP_PASS environment variables.');
            return;
        }

        try {
            this.transporter = nodemailer.createTransport(emailConfig);
            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
        }
    }

    /**
     * Send WordPress analysis report via email
     * @param {string} toEmail - Recipient email address
     * @param {string} siteUrl - Analyzed website URL
     * @param {Buffer} pdfBuffer - PDF report buffer
     * @param {Object} analysisData - Analysis results data
     * @param {Object} options - Email options
     * @returns {Promise<Object>} Email sending result
     */
    async sendAnalysisReport(toEmail, siteUrl, pdfBuffer, analysisData, options = {}) {
        if (!this.transporter) {
            throw new Error('Email service not configured. Please set up SMTP credentials.');
        }

        // Validate email address
        if (!this.isValidEmail(toEmail)) {
            throw new Error('Invalid email address format');
        }

        const domain = new URL(siteUrl).hostname;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `wordpress-analysis-${domain}-${timestamp}.pdf`;

        // Generate email content
        const emailContent = this.generateEmailContent(siteUrl, analysisData, options);

        const mailOptions = {
            from: {
                name: 'WordPress Site Analyzer',
                address: process.env.SMTP_FROM || process.env.SMTP_USER
            },
            to: toEmail,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            attachments: [
                {
                    filename: filename,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Analysis report sent to ${toEmail} for ${siteUrl}`);
            return {
                success: true,
                messageId: result.messageId,
                recipient: toEmail,
                siteUrl: siteUrl,
                filename: filename
            };
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            throw new Error(`Email sending failed: ${error.message}`);
        }
    }

    /**
     * Generate email content based on analysis data
     * @param {string} siteUrl - Analyzed website URL
     * @param {Object} analysisData - Analysis results
     * @param {Object} options - Email options
     * @returns {Object} Email content (subject, html, text)
     */
    generateEmailContent(siteUrl, analysisData, options = {}) {
        const domain = new URL(siteUrl).hostname;
        const isWordPress = analysisData.wordpress?.isWordPress || false;
        const wpVersion = analysisData.version?.version || 'Unknown';
        const themeName = analysisData.theme?.displayName || analysisData.theme?.name || 'Unknown';
        const pluginCount = analysisData.plugins?.length || 0;
        const outdatedPlugins = analysisData.plugins?.filter(p => p.isOutdated === true).length || 0;

        // Generate subject line
        const subject = `WordPress Analysis Report - ${domain}`;

        // Generate HTML content
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordPress Analysis Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007cba;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007cba;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
        }
        .summary {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .summary h2 {
            color: #333;
            margin-top: 0;
            font-size: 18px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e1e5e9;
        }
        .summary-item .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .summary-item .value {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-danger { color: #dc3545; }
        .status-info { color: #17a2b8; }
        .report-info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
        }
        .report-info h3 {
            margin-top: 0;
            color: #1976d2;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e1e5e9;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: #007cba;
            text-decoration: none;
        }
        .cta-button {
            display: inline-block;
            background: #007cba;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
        }
        .cta-button:hover {
            background: #005a87;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WordPress Analysis Report</h1>
            <p>Comprehensive site analysis and recommendations</p>
        </div>

        <div class="summary">
            <h2>Analysis Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">Website</div>
                    <div class="value">${domain}</div>
                </div>
                <div class="summary-item">
                    <div class="label">WordPress</div>
                    <div class="value ${isWordPress ? 'status-good' : 'status-danger'}">
                        ${isWordPress ? '✓ Detected' : '✗ Not WordPress'}
                    </div>
                </div>
                ${isWordPress ? `
                <div class="summary-item">
                    <div class="label">Version</div>
                    <div class="value status-info">${wpVersion}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Theme</div>
                    <div class="value">${themeName}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Plugins</div>
                    <div class="value">${pluginCount}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Outdated</div>
                    <div class="value ${outdatedPlugins > 0 ? 'status-warning' : 'status-good'}">
                        ${outdatedPlugins}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="report-info">
            <h3>📄 Detailed Report Attached</h3>
            <p>Your comprehensive WordPress analysis report is attached as a PDF file. The report includes:</p>
            <ul>
                <li>Detailed WordPress detection results</li>
                <li>Version and security analysis</li>
                <li>Theme and plugin inventory</li>
                <li>Performance metrics and recommendations</li>
                <li>Actionable improvement suggestions</li>
            </ul>
        </div>

        ${isWordPress && outdatedPlugins > 0 ? `
        <div class="report-info" style="background: #fff3cd; border-left-color: #ffc107;">
            <h3 style="color: #856404;">⚠️ Action Required</h3>
            <p style="color: #856404;">
                ${outdatedPlugins} plugin${outdatedPlugins > 1 ? 's' : ''} ${outdatedPlugins > 1 ? 'are' : 'is'} outdated and may pose security risks. 
                Please review the detailed report for specific recommendations.
            </p>
        </div>
        ` : ''}

        <div class="footer">
            <p>
                This report was generated by <strong>WordPress Site Analyzer v2.0.0</strong><br>
                Analysis completed on ${new Date().toLocaleString()}
            </p>
            <p>
                <a href="${siteUrl}" target="_blank">Visit ${domain}</a> | 
                <a href="https://github.com/yourusername/wordpress-site-analyzer" target="_blank">About this tool</a>
            </p>
        </div>
    </div>
</body>
</html>`;

        // Generate plain text content
        const text = `
WordPress Analysis Report
========================

Website: ${domain}
Analysis Date: ${new Date().toLocaleString()}

SUMMARY:
--------
WordPress Detected: ${isWordPress ? 'Yes' : 'No'}
${isWordPress ? `
WordPress Version: ${wpVersion}
Active Theme: ${themeName}
Total Plugins: ${pluginCount}
Outdated Plugins: ${outdatedPlugins}
` : ''}

DETAILED REPORT:
---------------
A comprehensive PDF report is attached to this email containing:
- Detailed WordPress detection results
- Version and security analysis  
- Theme and plugin inventory
- Performance metrics and recommendations
- Actionable improvement suggestions

${isWordPress && outdatedPlugins > 0 ? `
ACTION REQUIRED:
---------------
${outdatedPlugins} plugin${outdatedPlugins > 1 ? 's' : ''} ${outdatedPlugins > 1 ? 'are' : 'is'} outdated and may pose security risks.
Please review the detailed report for specific recommendations.
` : ''}

---
Generated by WordPress Site Analyzer v2.0.0
Visit: ${siteUrl}
`;

        return { subject, html, text };
    }

    /**
     * Validate email address format
     * @param {string} email - Email address to validate
     * @returns {boolean} True if valid email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Test email configuration
     * @returns {Promise<Object>} Test result
     */
    async testConnection() {
        if (!this.transporter) {
            return {
                success: false,
                error: 'Email service not configured'
            };
        }

        try {
            await this.transporter.verify();
            return {
                success: true,
                message: 'Email service is properly configured'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send test email
     * @param {string} toEmail - Recipient email address
     * @returns {Promise<Object>} Test email result
     */
    async sendTestEmail(toEmail) {
        if (!this.transporter) {
            throw new Error('Email service not configured');
        }

        const testContent = {
            subject: 'WordPress Site Analyzer - Test Email',
            html: `
                <h2>Test Email</h2>
                <p>This is a test email from WordPress Site Analyzer.</p>
                <p>If you received this email, your email configuration is working correctly!</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            `,
            text: `
Test Email

This is a test email from WordPress Site Analyzer.

If you received this email, your email configuration is working correctly!

Timestamp: ${new Date().toLocaleString()}
            `
        };

        const mailOptions = {
            from: {
                name: 'WordPress Site Analyzer',
                address: process.env.SMTP_FROM || process.env.SMTP_USER
            },
            to: toEmail,
            subject: testContent.subject,
            html: testContent.html,
            text: testContent.text
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: result.messageId,
                recipient: toEmail
            };
        } catch (error) {
            throw new Error(`Test email failed: ${error.message}`);
        }
    }
}

module.exports = EmailService;
