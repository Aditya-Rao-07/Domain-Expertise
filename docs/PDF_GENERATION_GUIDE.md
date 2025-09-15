# PDF Generation Guide

This guide explains how to use the PDF generation functionality in the WordPress Site Analyzer.

## Overview

The PDF generation feature allows you to convert HTML analysis reports into professional PDF documents using Puppeteer. This is perfect for creating client reports, documentation, or archival purposes.

## Features

- **High-Quality Output**: Uses Chrome's rendering engine for pixel-perfect PDFs
- **Full CSS Support**: Preserves all styling, fonts, and layouts from HTML reports
- **Multiple Formats**: Standard, print-optimized, and landscape orientations
- **Custom Options**: Configurable margins, page sizes, and headers/footers
- **API Integration**: RESTful endpoint for web applications

## Installation

The PDF functionality requires Puppeteer, which is automatically installed with the project:

```bash
npm install
```

## Usage

### 1. Direct Usage (Node.js)

```javascript
const WordPressAnalyzer = require('./src/wordpress-analyzer');

const analyzer = new WordPressAnalyzer({
    includePlugins: true,
    includeTheme: true,
    includeVersion: true,
    includePerformance: true
});

// Analyze a site
const results = await analyzer.analyzeSite('https://example.com');

// Generate standard PDF
const pdfBuffer = await analyzer.generatePdfReport(results);

// Save to file
const fs = require('fs');
fs.writeFileSync('report.pdf', pdfBuffer);
```

### 2. API Usage (HTTP)

#### Basic PDF Generation

```bash
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  --output report.pdf
```

#### PDF with Custom Options

```bash
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "format": "print",
    "options": {
      "margin": {
        "top": "2cm",
        "right": "1cm",
        "bottom": "2cm",
        "left": "1cm"
      }
    }
  }' \
  --output print-report.pdf
```

#### JavaScript/Fetch Example

```javascript
const response = await fetch('http://localhost:3000/api/analyze/pdf', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        url: 'https://example.com',
        format: 'landscape',
        filename: 'custom-report.pdf'
    })
});

const pdfBlob = await response.blob();
const url = window.URL.createObjectURL(pdfBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'report.pdf';
a.click();
```

## PDF Formats

### Standard Format
- A4 page size
- Portrait orientation
- Standard margins (1cm)
- Full styling preserved

```javascript
const pdf = await analyzer.generatePdfReport(results);
```

### Print-Optimized Format
- Optimized for printing
- Better page breaks
- Enhanced color preservation
- Print-specific CSS

```javascript
const pdf = await analyzer.generatePrintOptimizedPdfReport(results);
```

### Landscape Format
- A4 page size
- Landscape orientation
- Better for wide content

```javascript
const pdf = await analyzer.generateLandscapePdfReport(results);
```

### Custom Filename
- Generate PDF with specific filename
- Returns metadata along with buffer

```javascript
const result = await analyzer.generatePdfReportWithFilename(
    results, 
    'client-report.pdf'
);
console.log(result.filename); // 'client-report.pdf'
console.log(result.size);     // File size in bytes
```

## Configuration Options

### PDF Generation Options

```javascript
const options = {
    format: 'A4',                    // Page format: A4, A3, Letter, etc.
    landscape: false,                // Landscape orientation
    printBackground: true,           // Include background colors/images
    margin: {                        // Page margins
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
    },
    displayHeaderFooter: true,       // Show headers/footers
    headerTemplate: '<div>Header</div>',
    footerTemplate: '<div>Footer</div>',
    preferCSSPageSize: false,        // Use CSS page size
    scale: 1.0                       // Scale factor (0.1 to 2.0)
};

const pdf = await analyzer.generatePdfReport(results, options);
```

### API Request Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `url` | string | **Required** - URL to analyze | - |
| `format` | string | PDF format: `standard`, `print`, `landscape`, `with-filename` | `standard` |
| `filename` | string | Custom filename (when format is `with-filename`) | Auto-generated |
| `options` | object | PDF generation options | `{}` |

## API Endpoints

### POST `/api/analyze/pdf`

Generates a PDF report for the specified URL.

**Request Body:**
```json
{
    "url": "https://example.com",
    "format": "standard",
    "filename": "custom-report.pdf",
    "options": {
        "margin": {
            "top": "2cm",
            "right": "1cm",
            "bottom": "2cm",
            "left": "1cm"
        }
    }
}
```

**Response:**
- **Success**: PDF file with appropriate headers
- **Error**: JSON error response

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="report.pdf"
Content-Length: 1234567
Cache-Control: no-cache
```

## Testing

### Run PDF Tests

```bash
# Test all PDF functionality
npm run test-pdf

# Test only direct PDF generation
npm run test-pdf-direct

# Test only API endpoint
npm run test-pdf-api
```

### Manual Testing

1. Start the server:
   ```bash
   npm run web
   ```

2. Test the API endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/analyze/pdf \
     -H "Content-Type: application/json" \
     -d '{"url": "https://wordpress.org"}' \
     --output test-report.pdf
   ```

3. Check the generated PDF file.

## Troubleshooting

### Common Issues

#### 1. Puppeteer Installation Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. Memory Issues
If you encounter memory issues with large reports:

```javascript
const options = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--memory-pressure-off'
    ]
};
```

#### 3. Font Loading Issues
Ensure Google Fonts are accessible or use system fonts:

```javascript
// The HTML reporter already includes font fallbacks
// If issues persist, check network connectivity
```

#### 4. Timeout Issues
For large sites, increase timeout:

```javascript
// In API calls, increase timeout
const response = await fetch(url, {
    timeout: 120000 // 2 minutes
});
```

### Performance Tips

1. **Use Print-Optimized Format**: For better performance with large reports
2. **Limit Concurrent Requests**: Don't generate multiple PDFs simultaneously
3. **Cache Results**: Store analysis results to avoid re-analyzing
4. **Optimize Images**: Ensure images in reports are optimized

## File Structure

```
src/
├── reporters/
│   ├── html-reporter.js      # HTML report generation
│   ├── pdf-reporter.js       # PDF report generation
│   ├── json-reporter.js      # JSON report generation
│   └── console-reporter.js   # Console output
├── wordpress-analyzer.js     # Main analyzer with PDF methods
└── ...

server.js                     # Express server with PDF endpoint
test-pdf-generation.js        # PDF testing script
```

## Examples

### Complete Example

```javascript
const WordPressAnalyzer = require('./src/wordpress-analyzer');
const fs = require('fs');

async function generateClientReport(url, clientName) {
    const analyzer = new WordPressAnalyzer({
        includePlugins: true,
        includeTheme: true,
        includeVersion: true,
        includePerformance: true
    });

    try {
        // Analyze the site
        console.log(`Analyzing ${url}...`);
        const results = await analyzer.analyzeSite(url);

        // Generate professional PDF report
        const pdfOptions = {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '2cm',
                right: '1.5cm',
                bottom: '2cm',
                left: '1.5cm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 10px; text-align: center; color: #666;">
                    WordPress Analysis Report - ${clientName}
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; text-align: center; color: #666;">
                    Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                </div>
            `
        };

        const pdfBuffer = await analyzer.generatePdfReport(results, pdfOptions);
        
        // Save with client-specific filename
        const filename = `${clientName}-wordpress-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
        fs.writeFileSync(filename, pdfBuffer);
        
        console.log(`✅ Report generated: ${filename} (${pdfBuffer.length} bytes)`);
        return filename;

    } catch (error) {
        console.error('❌ Report generation failed:', error.message);
        throw error;
    }
}

// Usage
generateClientReport('https://example.com', 'Acme Corp')
    .then(filename => console.log(`Report saved as: ${filename}`))
    .catch(console.error);
```

## Support

For issues or questions about PDF generation:

1. Check the troubleshooting section above
2. Review the test scripts for examples
3. Check server logs for detailed error messages
4. Ensure all dependencies are properly installed

## Changelog

- **v2.0.0**: Initial PDF generation implementation
- Added Puppeteer integration
- Added multiple PDF formats
- Added API endpoint
- Added comprehensive testing
