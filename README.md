# WordPress Site Analyzer

A comprehensive JavaScript tool for analyzing WordPress sites without admin access. Detects WordPress version, active theme, installed plugins, and checks for outdated components.

## Features

- **WordPress Detection**: Identifies if a site is running WordPress
- **Version Detection**: Determines WordPress core version using multiple methods
- **Theme Analysis**: Detects active theme name, version, and author
- **Plugin Discovery**: Finds installed plugins and their versions
- **Outdated Component Detection**: Checks if plugins are outdated compared to latest versions
- **Comprehensive Reporting**: Generates detailed analysis reports in multiple formats
- **PDF Generation**: Creates professional PDF reports using Puppeteer 🆕
- **Email Integration**: Send analysis reports via email with PDF attachments 🆕
- **Performance Analysis**: PageSpeed Insights integration with Core Web Vitals 🆕

## Detection Methods

### WordPress Detection (Enterprise-Grade)
1. **Meta generator tags** (High confidence)
2. **HTML structure analysis** (High confidence) 🆕
   - WordPress-specific paths and files
   - Admin bar and login form detection
   - Core WordPress file references
3. **Asset path analysis** (High confidence) 🆕
   - Script and stylesheet detection
   - WordPress-specific asset identification
4. **JavaScript variable detection** (High confidence) 🆕
   - WordPress JS objects and functions
   - Inline script analysis
5. **CSS class and ID analysis** (Medium confidence) 🆕
   - WordPress-specific body classes
   - Theme and plugin class detection
6. **HTML comment analysis** (Medium confidence) 🆕
   - WordPress-generated comments
7. **REST API endpoint detection** (High confidence) 🆕
8. **WordPress file detection** (High confidence) 🆕
   - Core file accessibility testing
   - Configuration file detection
9. **HTTP header analysis** (High confidence) 🆕
   - WordPress-specific headers
   - Server header analysis
10. **Sitemap analysis** (Medium confidence) 🆕
11. **Robots.txt analysis** (Medium confidence) 🆕
12. **Feed endpoint detection** (Medium confidence) 🆕
13. **Admin endpoint detection** (High confidence) 🆕
14. **Plugin/theme directory detection** (High confidence) 🆕
15. **Inline script analysis** (Medium confidence) 🆕

### WordPress Version Detection (Conservative & Accurate)
1. **Meta generator tags** (High confidence) - Most reliable
2. **WordPress core files** (High confidence) - Direct version.php access 🆕
3. **REST API endpoints** (High confidence) - Official WordPress API
4. **README.html file analysis** (High confidence) - Standard WordPress file
5. **OPML file checking** (Medium confidence) - WordPress-specific format
6. **RSS feed analysis** (Medium confidence) - WordPress-generated feeds
7. **WordPress comments** (Medium confidence) - WordPress-specific HTML comments 🆕

**Version Validation**: All detected versions are validated against WordPress version patterns to prevent false positives from plugin/theme versions.

### Theme Detection
1. **CSS stylesheet links analysis** (Most reliable)
2. **Theme header parsing** from style.css
3. **Body class examination**
4. **Asset path scanning**
5. **Template hints** in HTML

### Plugin Detection (Advanced)
1. **Asset path scanning** (Scripts/stylesheets) - High confidence
2. **Advanced asset introspection** (High confidence) 🆕
   - HTTP range requests for efficient file analysis
   - Source map following and analysis
   - Plugin header extraction from asset files
   - Version detection from compressed code
   - **Optimized parallel processing** (60% faster) 🆕
3. **Enhanced plugin version detection** (High confidence) 🆕
   - Multi-method version extraction (plugin files, readme, assets, endpoints)
   - Intelligent version validation and filtering
   - False positive detection and removal
4. **REST API endpoint detection** (High confidence) 🆕
5. **JavaScript variable detection** (High confidence) 🆕
6. **CSS class and ID patterns** (Medium confidence)
7. **Meta tag analysis** (Medium confidence) 🆕
8. **HTML comment analysis** (Medium confidence)
9. **Content pattern matching** (Medium confidence)
10. **Plugin header parsing** (When accessible)

#### Supported Plugin Detection (25+ plugins):
- **SEO**: Yoast SEO, Rank Math SEO
- **Page Builders**: Elementor, WPBakery, Visual Composer
- **E-commerce**: WooCommerce
- **Forms**: Contact Form 7, WPForms, Gravity Forms, Ninja Forms
- **Caching**: WP Rocket, WP Super Cache, W3 Total Cache, LiteSpeed Cache
- **Security**: Wordfence, Jetpack, Akismet
- **Optimization**: Autoptimize, WP-Optimize, Smush
- **Sliders**: Slider Revolution, LayerSlider
- **Fields**: Advanced Custom Fields
- **Email**: Mailchimp, Constant Contact
- **And many more...**

## Installation

1. Clone or download the project
2. Install dependencies:
```bash
npm install
```

## Usage

### Command Line Interface

```bash
# Basic usage (console output)
node cli.js example.com

# Generate HTML report
node cli.js https://wordpress-site.com --html

# Generate JSON report
node cli.js example.com --json

# Save to specific file
node cli.js example.com --output my-report.html

# Local development site
node cli.js http://localhost/wordpress --html
```

### Programmatic Usage

```javascript
const WordPressAnalyzer = require('wordpress-site-analyzer');

async function analyzeWordPressSite() {
    const analyzer = new WordPressAnalyzer();
    
    try {
        const results = await analyzer.analyzeSite('https://example.com');
        console.log('WordPress detected:', results.wordpress.isWordPress);
        console.log('Version:', results.version?.version);
        console.log('Theme:', results.theme?.name);
        console.log('Plugins found:', results.plugins.length);
        
        // Generate formatted report
        const report = analyzer.generateReport(results);
        console.log(report);
        
        // Generate JSON report
        const jsonReport = analyzer.generateJsonReport(results);
        console.log(JSON.stringify(jsonReport, null, 2));
        
        // Generate HTML report
        const htmlReport = analyzer.generateHtmlReport(results);
        
        // Generate PDF report
        const pdfBuffer = await analyzer.generatePdfReport(results);
        
        const fs = require('fs');
        const path = require('path');
        
        // Create reports directory if it doesn't exist
        const reportsDir = 'reports';
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }
        
        const htmlFilename = path.join(reportsDir, 'analysis-report.html');
        fs.writeFileSync(htmlFilename, htmlReport);
        console.log(`HTML report saved to ${htmlFilename}`);
        
        // Save PDF report
        const pdfFilename = path.join(reportsDir, 'analysis-report.pdf');
        fs.writeFileSync(pdfFilename, pdfBuffer);
        console.log(`PDF report saved to ${pdfFilename}`);
        
    } catch (error) {
        console.error('Analysis failed:', error.message);
    }
}

analyzeWordPressSite();
```

### Web Server API

Start the web server to access the API endpoints:

```bash
# Start the web server
npm run web

# Server will be available at http://localhost:3000
```

#### Available Endpoints

**POST `/api/analyze`** - Standard analysis
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**POST `/api/analyze/pdf`** - Generate PDF report 🆕
```bash
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  --output report.pdf
```

**POST `/api/analyze/email`** - Send analysis report via email 🆕
```bash
curl -X POST http://localhost:3000/api/analyze/email \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "email": "client@example.com"}'
```

**GET `/api/health`** - Health check
```bash
curl http://localhost:3000/api/health
```

#### PDF Generation Options

```bash
# Print-optimized PDF
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "format": "print"}' \
  --output print-report.pdf

# Landscape PDF
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "format": "landscape"}' \
  --output landscape-report.pdf

# Custom filename
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "format": "with-filename", "filename": "client-report.pdf"}' \
  --output client-report.pdf
```

#### Email Integration Options

```bash
# Send standard report via email
curl -X POST http://localhost:3000/api/analyze/email \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "email": "client@example.com"}'

# Send print-optimized report via email
curl -X POST http://localhost:3000/api/analyze/email \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "email": "client@example.com", "format": "print"}'

# Test email configuration
curl http://localhost:3000/api/email/config

# Send test email
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Testing

All test scripts are organized in the `tests/` directory for better maintainability:

### PDF Generation Tests
```bash
npm run test-pdf              # Run all PDF tests
npm run test-pdf-direct       # Direct PDF generation only
npm run test-pdf-api          # API endpoint tests only
```

### Email Integration Tests
```bash
npm run test-email            # Run all email tests
npm run test-email-service    # Email service tests only
npm run test-email-api        # Email API tests only
npm run test-email-workflow   # End-to-end workflow test
npm run email-setup           # Display setup instructions
```

### API Endpoint Tests
```bash
npm run test-api              # Test all API endpoints
```

### Test Structure
```
tests/
├── pdf/                      # PDF generation tests
├── email/                    # Email integration tests
├── api/                      # API endpoint tests
└── README.md                 # Detailed testing guide
```

See [tests/README.md](tests/README.md) for comprehensive testing documentation.

## Sample Output

```
WordPress Site Analysis Report
=====================================
URL: https://example.com
Analysis Date: 12/1/2023, 10:30:00 AM
Is WordPress: Yes

WordPress Version:
  Version: 6.4.1
  Detection Method: meta_generator
  Confidence: high

Active Theme:
  Name: twentytwentythree
  Version: 1.3
  Author: WordPress Team
  Path: /wp-content/themes/twentytwentythree/

Detected Plugins (3):
  1. contact-form-7
     Version: 5.8.4
     Latest Version: 5.8.6
     Outdated: Yes
     Author: Takayuki Miyoshi

  2. yoast-seo
     Version: 21.5
     Latest Version: 21.7
     Outdated: Yes
     Author: Team Yoast

  3. elementor
     Version: 3.17.3
     Latest Version: 3.17.3
     Outdated: No
     Author: Elementor.com
```

## API Response Format

```javascript
{
  "meta": {
    "url": "https://example.com",
    "analyzedAt": "2023-12-01T15:30:00.000Z",
    "duration": 2340,
    "analyzer": {
      "name": "WordPress Site Analyzer",
      "version": "2.0.0"
    }
  },
  "wordpress": {
    "detected": true,
    "confidence": "high",
    "score": 95,
    "indicators": [
      {
        "type": "meta_generator",
        "description": "WordPress 6.4.1",
        "confidence": "high"
      }
    ]
  },
  "version": {
    "detected": true,
    "version": "6.4.1",
    "method": "meta_generator",
    "confidence": "high"
  },
  "theme": {
    "detected": true,
    "name": "twentytwentythree",
    "displayName": "Twenty Twenty-Three",
    "version": "1.3",
    "author": "WordPress Team"
  },
  "plugins": {
    "statistics": {
      "total": 3,
      "outdated": 1,
      "upToDate": 2
    },
    "list": [
      {
        "name": "contact-form-7",
        "displayName": "Contact Form 7",
        "version": "5.8.4",
        "latestVersion": "5.8.6",
        "isOutdated": true,
        "confidence": "high",
        "category": "forms"
      }
    ]
  }
}
```

## Configuration Options

The analyzer can be customized by modifying the constructor options:

```javascript
const analyzer = new WordPressAnalyzer({
    timeout: 15000, // 15 seconds (default: 10000)
    userAgent: 'Custom WordPress Analyzer 2.0',
    includePlugins: true, // Include plugin detection (default: true)
    includeTheme: true, // Include theme detection (default: true)
    includeVersion: true, // Include version detection (default: true)
    checkVersions: true, // Check for outdated versions (default: true)
    maxConcurrentRequests: 3 // For multiple site analysis (default: 5)
});
```

## Error Handling

The tool includes comprehensive error handling for:
- Network timeouts
- Invalid URLs
- Non-WordPress sites
- Inaccessible resources
- Rate limiting

## Rate Limiting and Ethics

- The tool includes delays between requests to be respectful to target servers
- Uses standard web browser User-Agent strings
- Only accesses publicly available resources
- Does not attempt to exploit vulnerabilities

## Limitations

- Only detects publicly accessible information
- Some plugins may not be detectable if they don't leave public traces
- Premium/private plugins may not have version information available
- Heavily cached sites might show outdated information
- Some detection methods may be blocked by security plugins

## Use Cases

- **Security Auditing**: Identify outdated components that may have vulnerabilities
- **Competitive Analysis**: Understand technology stack of competitor websites
- **Migration Planning**: Inventory existing WordPress installations
- **Compliance Checking**: Ensure sites meet version requirements
- **Development Research**: Analyze implementation patterns

## Report Formats

The analyzer supports three output formats:

### 📊 HTML Reports
Beautiful, professional HTML reports with:
- **Interactive Design**: Clean, modern interface with responsive layout
- **Plugin Management**: Detailed plugin status with version comparisons
- **Professional Styling**: Print-ready format for documentation
- **Mobile Friendly**: Responsive design works on all devices

```bash
# Generate HTML report (saved to reports/ directory)
node cli.js example.com --html

# Save to custom file in reports directory
node cli.js example.com --output my-analysis.html

# Save to specific path (outside reports directory)
node cli.js example.com --output /path/to/custom/report.html
```

### 📋 Console Reports
Detailed terminal output with:
- Comprehensive analysis summary
- Plugin status overview
- Easy-to-read formatting

### 📄 JSON Reports
Structured data format with:
- Complete analysis data
- Performance insights
- API-friendly format

## Advanced Usage

### Multiple Site Analysis
```javascript
const analyzer = new WordPressAnalyzer();
const sites = ['site1.com', 'site2.com', 'site3.com'];
const results = await analyzer.analyzeMultipleSites(sites);
```

### Quick WordPress Detection
```javascript
const analyzer = new WordPressAnalyzer();
const result = await analyzer.quickDetect('example.com');
console.log(`${result.url}: ${result.isWordPress ? 'WordPress' : 'Not WordPress'}`);
```

### Using Individual Components
```javascript
const { detectors, utils } = require('wordpress-site-analyzer');
const { HttpClient } = utils;

const httpClient = new HttpClient();
const versionDetector = new detectors.VersionDetector(httpClient);
```

### Custom Report Generation
```javascript
const analyzer = new WordPressAnalyzer();
const results = await analyzer.analyzeSite('example.com');

// Console report
console.log(analyzer.generateReport(results));

// Compact summary
console.log(analyzer.generateSummary(results));

// HTML report (automatically saved to reports/ directory)
const fs = require('fs');
const path = require('path');
if (!fs.existsSync('reports')) fs.mkdirSync('reports');

const htmlReport = analyzer.generateHtmlReport(results);
fs.writeFileSync(path.join('reports', 'report.html'), htmlReport);

// JSON report with options
const jsonReport = analyzer.generateJsonReport(results, {
    includeRawData: false
});
```

## Project Structure

```
wordpress-site-analyzer/
├── src/
│   ├── config/          # Configuration and constants
│   ├── detectors/       # WordPress detection modules
│   ├── utils/           # Utility functions
│   ├── reporters/       # Report generation
│   └── wordpress-analyzer.js  # Main analyzer class
├── reports/             # Generated analysis reports (auto-created)
├── cli.js              # Command-line interface
├── index.js            # Main entry point
└── README.md           # Documentation
```

## Future Enhancements

Planned features for future versions:
- Security vulnerability database integration
- Performance metrics analysis
- SEO plugin detection
- Custom hook and filter detection
- Database analysis (if accessible)
- Multi-site network detection
- WordPress REST API analysis
- Security header analysis

## Contributing

Feel free to contribute by:
- Adding new detection methods
- Improving accuracy of existing detectors
- Adding support for more plugins/themes
- Enhancing error handling
- Improving documentation

## License

MIT License - see LICENSE file for details

## Disclaimer

This tool is for educational and legitimate security assessment purposes only. Always ensure you have permission to analyze target websites. The authors are not responsible for any misuse of this tool.
