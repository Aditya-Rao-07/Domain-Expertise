// File: ./tests/api/test-api-endpoints.js

const axios = require('axios');

/**
 * Test script for API endpoints
 */

const serverUrl = 'http://localhost:3000';

async function testHealthEndpoint() {
    console.log('🔍 Testing health endpoint...');
    try {
        const response = await axios.get(`${serverUrl}/api/health`);
        console.log('✅ Health endpoint:', response.data.status);
        return true;
    } catch (error) {
        console.error('❌ Health endpoint failed:', error.message);
        return false;
    }
}

async function testAnalyzeEndpoint() {
    console.log('🔍 Testing analyze endpoint...');
    try {
        const response = await axios.post(`${serverUrl}/api/analyze`, {
            url: 'https://wordpress.org'
        }, { timeout: 60000 });
        
        console.log('✅ Analyze endpoint:', response.data.success ? 'Success' : 'Failed');
        return response.data.success;
    } catch (error) {
        console.error('❌ Analyze endpoint failed:', error.message);
        return false;
    }
}

async function testPdfEndpoint() {
    console.log('🔍 Testing PDF endpoint...');
    try {
        const response = await axios.post(`${serverUrl}/api/analyze/pdf`, {
            url: 'https://wordpress.org',
            format: 'standard'
        }, { 
            timeout: 120000,
            responseType: 'arraybuffer'
        });
        
        console.log('✅ PDF endpoint:', `Generated ${response.data.length} bytes`);
        return true;
    } catch (error) {
        console.error('❌ PDF endpoint failed:', error.message);
        return false;
    }
}

async function testEmailConfigEndpoint() {
    console.log('🔍 Testing email config endpoint...');
    try {
        const response = await axios.get(`${serverUrl}/api/email/config`);
        console.log('✅ Email config endpoint:', response.data.success ? 'Configured' : 'Not configured');
        return response.data.success;
    } catch (error) {
        console.error('❌ Email config endpoint failed:', error.message);
        return false;
    }
}

async function runAllApiTests() {
    console.log('🧪 Running API Endpoint Tests\n');
    
    const results = {
        health: await testHealthEndpoint(),
        analyze: await testAnalyzeEndpoint(),
        pdf: await testPdfEndpoint(),
        emailConfig: await testEmailConfigEndpoint()
    };
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All API tests passed!');
    } else {
        console.log('⚠️  Some API tests failed. Check server status and configuration.');
        process.exit(1);
    }
}

if (require.main === module) {
    runAllApiTests().catch(console.error);
}

module.exports = {
    testHealthEndpoint,
    testAnalyzeEndpoint,
    testPdfEndpoint,
    testEmailConfigEndpoint,
    runAllApiTests
};
