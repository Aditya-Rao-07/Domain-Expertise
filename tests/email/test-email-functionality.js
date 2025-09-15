// File: ./test-email-functionality.js

const EmailService = require('../../src/services/email-service');
const WordPressAnalyzer = require('../../src/wordpress-analyzer');
const axios = require('axios');

/**
 * Test script for email functionality
 */
async function testEmailService() {
    console.log('🧪 Testing Email Service Functionality\n');
    
    const emailService = new EmailService();
    
    try {
        // Test 1: Email configuration test
        console.log('📧 Testing email configuration...');
        const configTest = await emailService.testConnection();
        
        if (configTest.success) {
            console.log('✅ Email service is properly configured');
        } else {
            console.log('❌ Email service configuration issue:', configTest.error);
            console.log('Please check your .env file and SMTP settings');
            return;
        }
        
        // Test 2: Send test email (if email provided)
        const testEmail = process.env.TEST_EMAIL;
        if (testEmail) {
            console.log(`\n📧 Sending test email to: ${testEmail}`);
            const testResult = await emailService.sendTestEmail(testEmail);
            console.log(`✅ Test email sent successfully: ${testResult.messageId}`);
        } else {
            console.log('\n⚠️  No TEST_EMAIL environment variable set. Skipping test email.');
            console.log('Set TEST_EMAIL=your-email@example.com to test email sending');
        }
        
    } catch (error) {
        console.error('❌ Email service test failed:', error.message);
        throw error;
    }
}

/**
 * Test email endpoint via API
 */
async function testEmailEndpoint() {
    console.log('\n🌐 Testing Email API Endpoints\n');
    
    const serverUrl = 'http://localhost:3000';
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testUrl = 'https://calvin-ld.wisdmlabs.net';
    
    try {
        // Test if server is running
        console.log('🔍 Checking if server is running...');
        const healthResponse = await axios.get(`${serverUrl}/api/health`);
        console.log('✅ Server is running:', healthResponse.data.status);
        
        // Test email configuration endpoint
        console.log('\n📧 Testing email configuration endpoint...');
        const configResponse = await axios.get(`${serverUrl}/api/email/config`);
        console.log('✅ Email config test:', configResponse.data.message);
        
        // Test email test endpoint
        console.log('\n📧 Testing email test endpoint...');
        const testResponse = await axios.post(`${serverUrl}/api/email/test`, {
            email: testEmail
        });
        console.log('✅ Email test endpoint:', testResponse.data.message);
        
        // Test full email analysis endpoint
        console.log('\n📧 Testing email analysis endpoint...');
        const analysisResponse = await axios.post(`${serverUrl}/api/analyze/email`, {
            url: testUrl,
            email: testEmail,
            format: 'standard'
        }, {
            timeout: 120000 // 2 minutes timeout for full analysis
        });
        
        console.log('✅ Email analysis completed:', analysisResponse.data.message);
        console.log('📊 Analysis summary:', analysisResponse.data.data.analysisSummary);
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('⚠️  Server is not running. Start it with: npm run web');
        } else if (error.response) {
            console.error('❌ API test failed:', error.response.data.error || error.response.data.message);
        } else {
            console.error('❌ API test failed:', error.message);
        }
    }
}

/**
 * Test complete email workflow
 */
async function testCompleteEmailWorkflow() {
    console.log('\n🔄 Testing Complete Email Workflow\n');
    
    const analyzer = new WordPressAnalyzer({
        includePlugins: true,
        includeTheme: true,
        includeVersion: true,
        includePerformance: true
    });
    
    const emailService = new EmailService();
    const testUrl = 'https://wordpress.org';
    const testEmail = process.env.TEST_EMAIL;
    
    if (!testEmail) {
        console.log('⚠️  No TEST_EMAIL environment variable set. Skipping complete workflow test.');
        console.log('Set TEST_EMAIL=your-email@example.com to test complete workflow');
        return;
    }
    
    try {
        console.log(`🔍 Analyzing: ${testUrl}`);
        const results = await analyzer.analyzeSite(testUrl);
        console.log('✅ Analysis completed');
        
        console.log('📄 Generating PDF report...');
        const pdfBuffer = await analyzer.generatePdfReport(results);
        console.log(`✅ PDF generated (${pdfBuffer.length} bytes)`);
        
        console.log(`📧 Sending email to: ${testEmail}`);
        const emailResult = await emailService.sendAnalysisReport(
            testEmail,
            testUrl,
            pdfBuffer,
            results
        );
        
        console.log('✅ Email sent successfully!');
        console.log('📊 Email result:', {
            recipient: emailResult.recipient,
            siteUrl: emailResult.siteUrl,
            messageId: emailResult.messageId,
            filename: emailResult.filename
        });
        
    } catch (error) {
        console.error('❌ Complete workflow test failed:', error.message);
        throw error;
    }
}

/**
 * Display setup instructions
 */
function displaySetupInstructions() {
    console.log('\n📋 Email Setup Instructions\n');
    console.log('1. Copy env.example to .env:');
    console.log('   cp env.example .env\n');
    
    console.log('2. Edit .env file with your email settings:');
    console.log('   - For Gmail: Use App Passwords (not regular password)');
    console.log('   - For Outlook: May need "Less secure app access"');
    console.log('   - For custom SMTP: Use your provider settings\n');
    
    console.log('3. Set TEST_EMAIL environment variable (optional):');
    console.log('   export TEST_EMAIL=your-email@example.com\n');
    
    console.log('4. Start the server:');
    console.log('   npm run web\n');
    
    console.log('5. Test email functionality:');
    console.log('   npm run test-email\n');
    
    console.log('📧 Gmail App Password Setup:');
    console.log('1. Enable 2-Factor Authentication');
    console.log('2. Go to Google Account settings');
    console.log('3. Security → App passwords');
    console.log('4. Generate app password for "WordPress Analyzer"');
    console.log('5. Use the generated password in SMTP_PASS\n');
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--setup')) {
        displaySetupInstructions();
        return;
    }
    
    if (args.includes('--service-only')) {
        await testEmailService();
    } else if (args.includes('--api-only')) {
        await testEmailEndpoint();
    } else if (args.includes('--workflow-only')) {
        await testCompleteEmailWorkflow();
    } else {
        await testEmailService();
        await testEmailEndpoint();
        await testCompleteEmailWorkflow();
    }
}

// Run tests
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testEmailService,
    testEmailEndpoint,
    testCompleteEmailWorkflow,
    displaySetupInstructions
};
