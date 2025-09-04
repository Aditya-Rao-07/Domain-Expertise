#!/usr/bin/env node
// File: ./cli.js

const WordPressAnalyzer = require('./src/wordpress-analyzer');

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
WordPress Site Analyzer
=======================

Usage: node cli.js <website-url> [options]

Examples:
  node cli.js example.com
  node cli.js https://wordpress-site.com --html
  node cli.js http://localhost/wordpress --json
  node cli.js example.com --output report.html

Options:
  --html          Generate HTML report (saved to reports/ directory)
  --json          Generate JSON report (saved to reports/ directory)
  --performance   Include plugin performance analysis
  --output <file> Save report to file (auto-detects format from extension)

Features:
- Detects WordPress version
- Identifies active theme and version
- Lists installed plugins with versions
- Checks if plugins are outdated
- Analyzes plugin performance impact
- Generates comprehensive reports (console, JSON, HTML)
- Organizes all reports in dedicated reports/ folder
        `);
        process.exit(1);
    }

    // Parse arguments
    const url = args[0];
    const isHtml = args.includes('--html');
    const isJson = args.includes('--json');
    const includePerformance = args.includes('--performance');
    const outputIndex = args.indexOf('--output');
    const outputFile = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : null;
    
    console.log('Starting WordPress analysis...\n');

    try {
        const analyzer = new WordPressAnalyzer({
            includePerformance: includePerformance
        });
        const results = await analyzer.analyzeSite(url);
        
        const fs = require('fs');
        const path = require('path');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Ensure reports directory exists
        const reportsDir = path.join(process.cwd(), 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Determine output format
        let format = 'console';
        let filename = null;
        
        if (outputFile) {
            const ext = path.extname(outputFile).toLowerCase();
            if (ext === '.html') format = 'html';
            else if (ext === '.json') format = 'json';
            // If outputFile is just a filename, put it in reports directory
            if (!path.isAbsolute(outputFile) && !outputFile.includes('/') && !outputFile.includes('\\')) {
                filename = path.join(reportsDir, outputFile);
            } else {
                filename = outputFile;
            }
        } else if (isHtml) {
            format = 'html';
            filename = path.join(reportsDir, `wordpress-report-${timestamp}.html`);
        } else if (isJson) {
            format = 'json';
            filename = path.join(reportsDir, `wordpress-analysis-${timestamp}.json`);
        }

        // Import reporters
        const ConsoleReporter = require('./src/reporters/console-reporter');
        const JsonReporter = require('./src/reporters/json-reporter');
        const HtmlReporter = require('./src/reporters/html-reporter');

        // Generate and display/save report
        switch (format) {
            case 'html':
                const htmlReport = HtmlReporter.generate(results);
                if (filename) {
                    fs.writeFileSync(filename, htmlReport);
                    console.log(`\n📄 HTML report saved to: ${filename}`);
                    console.log(`🌐 Open in browser: file://${path.resolve(filename)}`);
                } else {
                    console.log(htmlReport);
                }
                
                // Still show console summary
                console.log('\n' + '='.repeat(60));
                console.log('QUICK SUMMARY');
                console.log('='.repeat(60));
                console.log(ConsoleReporter.generate(results));
                break;
                
            case 'json':
                const jsonReport = JsonReporter.generate(results);
                if (filename) {
                    fs.writeFileSync(filename, JSON.stringify(jsonReport, null, 2));
                    console.log(`\n📄 JSON report saved to: ${filename}`);
                } else {
                    console.log(JSON.stringify(jsonReport, null, 2));
                }
                break;
                
            default:
                // Console output
                const consoleReport = ConsoleReporter.generate(results);
                console.log(consoleReport);
                
                // Also save JSON for detailed analysis
                const jsonFilename = path.join(reportsDir, `wordpress-analysis-${timestamp}.json`);
                fs.writeFileSync(jsonFilename, JSON.stringify(results, null, 2));
                console.log(`\n📄 Detailed results saved to: ${jsonFilename}`);
        }

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
