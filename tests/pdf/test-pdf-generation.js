// File: ./test-pdf-generation.js

const WordPressAnalyzer = require('../../src/wordpress-analyzer');
const fs = require('fs');
const path = require('path');

/**
 * Test script for PDF generation functionality
 */
async function testPdfGeneration() {
    console.log('🧪 Testing PDF Generation Functionality\n');
    
    // Initialize analyzer
    const analyzer = new WordPressAnalyzer({
        includePlugins: true,
        includeTheme: true,
        includeVersion: true,
        includePerformance: true
    });

    // Test URL
    const testUrl = 'https://calvin-ld.wisdmlabs.net';
    const outputDir = './test-pdf-output';
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    try {
        console.log(`🔍 Analyzing: ${testUrl}`);
        const results = await analyzer.analyzeSite(testUrl);
        console.log('✅ Analysis completed\n');

        // Test 1: Standard PDF generation
        console.log('📄 Generating standard PDF...');
        const standardPdf = await analyzer.generatePdfReport(results);
        const standardPath = path.join(outputDir, 'standard-report.pdf');
        fs.writeFileSync(standardPath, standardPdf);
        console.log(`✅ Standard PDF saved: ${standardPath} (${standardPdf.length} bytes)\n`);

        // Test 2: Print-optimized PDF
        console.log('📄 Generating print-optimized PDF...');
        const printPdf = await analyzer.generatePrintOptimizedPdfReport(results);
        const printPath = path.join(outputDir, 'print-optimized-report.pdf');
        fs.writeFileSync(printPath, printPdf);
        console.log(`✅ Print-optimized PDF saved: ${printPath} (${printPdf.length} bytes)\n`);

        // Test 3: Landscape PDF
        console.log('📄 Generating landscape PDF...');
        const landscapePdf = await analyzer.generateLandscapePdfReport(results);
        const landscapePath = path.join(outputDir, 'landscape-report.pdf');
        fs.writeFileSync(landscapePath, landscapePdf);
        console.log(`✅ Landscape PDF saved: ${landscapePath} (${landscapePdf.length} bytes)\n`);

        // Test 4: PDF with custom filename
        console.log('📄 Generating PDF with custom filename...');
        const customFilename = 'wordpress-org-analysis.pdf';
        const pdfWithFilename = await analyzer.generatePdfReportWithFilename(results, customFilename);
        const customPath = path.join(outputDir, pdfWithFilename.filename);
        fs.writeFileSync(customPath, pdfWithFilename.buffer);
        console.log(`✅ Custom filename PDF saved: ${customPath} (${pdfWithFilename.buffer.length} bytes)\n`);

        // Test 5: PDF with custom options
        console.log('📄 Generating PDF with custom options...');
        const customOptions = {
            format: 'A4',
            margin: {
                top: '2cm',
                right: '1.5cm',
                bottom: '2cm',
                left: '1.5cm'
            },
            printBackground: true
        };
        const customPdf = await analyzer.generatePdfReport(results, customOptions);
        const customOptionsPath = path.join(outputDir, 'custom-options-report.pdf');
        fs.writeFileSync(customOptionsPath, customPdf);
        console.log(`✅ Custom options PDF saved: ${customOptionsPath} (${customPdf.length} bytes)\n`);

        console.log('🎉 All PDF generation tests completed successfully!');
        console.log(`📁 Check the ${outputDir} directory for generated PDFs.`);

    } catch (error) {
        console.error('❌ PDF generation test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * Test API endpoint functionality
 */
async function testApiEndpoint() {
    console.log('\n🌐 Testing API Endpoint Functionality\n');
    
    const axios = require('axios');
    const FormData = require('form-data');
    
    const serverUrl = 'http://localhost:3000';
    const testUrl = 'https://wordpress.org';
    
    try {
        // Test if server is running
        console.log('🔍 Checking if server is running...');
        const healthResponse = await axios.get(`${serverUrl}/api/health`);
        console.log('✅ Server is running:', healthResponse.data.status);
        
        // Test PDF endpoint
        console.log('\n📄 Testing PDF endpoint...');
        const pdfResponse = await axios.post(`${serverUrl}/api/analyze/pdf`, {
            url: testUrl,
            format: 'standard'
        }, {
            responseType: 'arraybuffer',
            timeout: 60000 // 60 seconds timeout for PDF generation
        });
        
        if (pdfResponse.status === 200) {
            const outputPath = path.join('./test-pdf-output', 'api-generated-report.pdf');
            fs.writeFileSync(outputPath, pdfResponse.data);
            console.log(`✅ API PDF generated: ${outputPath} (${pdfResponse.data.length} bytes)`);
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('⚠️  Server is not running. Start it with: npm run web');
        } else {
            console.error('❌ API test failed:', error.message);
        }
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--api-only')) {
        await testApiEndpoint();
    } else if (args.includes('--direct-only')) {
        await testPdfGeneration();
    } else {
        await testPdfGeneration();
        await testApiEndpoint();
    }
}

// Run tests
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testPdfGeneration,
    testApiEndpoint
};
