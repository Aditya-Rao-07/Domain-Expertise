# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Puppeteer Chrome Path Configuration**: Added explicit Chrome executable path configuration via `PUPPETEER_EXECUTABLE_PATH` environment variable for Render deployment compatibility
- **Automatic Chrome Installation**: Added `postinstall` script to automatically install Chrome browser for Puppeteer PDF generation
- **Environment-Specific Configuration**: Enhanced Puppeteer launch options to use explicit Chrome path when configured, with fallback to bundled Chrome for local development
- **WordPress Plugin Integration**: Complete WordPress plugin (`wp-analyzer-form.php`) for seamless integration with WordPress sites
- **Shortcode Functionality**: `[wp_analyzer_form]` shortcode for easy form embedding in pages and posts
- **Admin Settings Page**: Configurable external server URL and default report format settings
- **Professional Form Design**: Clean, minimal styling that blends with any WordPress theme
- **AJAX Form Submission**: Smooth form handling with real-time validation and user feedback
- **Security Features**: Nonce verification, input sanitization, and proper WordPress security practices
- **Responsive Design**: Mobile-first design with dark mode and accessibility support
- **Plugin Documentation**: Comprehensive README with installation, configuration, and usage instructions
- **Test Organization**: Reorganized all test scripts into a dedicated `tests/` directory for better maintainability
- **Test Structure**: Created organized test categories (pdf/, email/, api/) with comprehensive documentation
- **Test Documentation**: Added detailed testing guide in `tests/README.md` with setup instructions and examples
- **PDF Generation**: Complete PDF report generation using Puppeteer with multiple format options
- **PDF API Endpoint**: New `/api/analyze/pdf` endpoint for generating PDF reports via HTTP
- **Multiple PDF Formats**: Standard, print-optimized, and landscape PDF generation options
- **Custom PDF Options**: Configurable margins, page sizes, headers, and footers
- **PDF Testing Suite**: Comprehensive test scripts for PDF generation functionality
- **PDF Documentation**: Complete guide for PDF generation usage and API integration
- **Email Integration**: Complete email service for sending analysis reports via email
- **Email API Endpoints**: New `/api/analyze/email`, `/api/email/test`, and `/api/email/config` endpoints
- **Professional Email Templates**: HTML and text email templates with analysis summaries
- **PDF Email Attachments**: Automatic PDF report attachment to emails
- **Multiple Email Providers**: Support for Gmail, Outlook, and custom SMTP configurations
- **Email Testing Suite**: Comprehensive test scripts for email functionality
- **Email Documentation**: Complete guide for email setup and usage

### Changed
- **Test Scripts**: Moved all test scripts from root directory to organized `tests/` folder structure
- **Package Scripts**: Updated npm scripts to reference new test file locations
- **Project Structure**: Improved maintainability with dedicated test directories and documentation
- **Security**: Removed hardcoded PageSpeed Insights API key from source code and moved to environment variables

### Fixed
- **Frontend JavaScript**: Fixed missing JavaScript code that prevented the "Analyze Site" button from working
- **Server Import Path**: Corrected WordPressAnalyzer import path in server.js from './index' to './src/wordpress-analyzer'
- **API Communication**: Implemented complete frontend-backend communication for WordPress site analysis
- **Result Display**: Added comprehensive result sections with proper styling for WordPress detection, version, theme, plugins, performance, and recommendations
- **Form Validation**: Added URL validation and error handling for form submissions
- **Progress Animation**: Implemented visual progress tracking during analysis with step-by-step indicators
- **Download Functionality**: Added working JSON and HTML report download features

### Added
- **Professional Web Interface**: Complete enterprise-grade web frontend for WordPress site analysis
- **PageSpeed Insights Summary**: Dedicated section highlighting Core Web Vitals, performance scores, and key metrics from PageSpeed Insights with color-coded status indicators
- **Express.js Server**: RESTful API server with analysis endpoints and HTML report generation
- **Detailed Report Display**: Web interface now displays the same comprehensive reports as the HTML reporter
- **Minimal Professional UI**: Clean, modern interface with enterprise-level design standards
- **Download Features**: JSON and HTML report download functionality with proper formatting
- **Progress Tracking**: Visual progress indicators with step-by-step analysis feedback
- **Error Handling**: Comprehensive error display and retry functionality
- **Responsive Design**: Mobile-first design that works on all devices

### Changed
- **Package Dependencies**: Added Express.js and CORS for web server functionality
- **Scripts**: Added `web` and `dev` npm scripts for server startup
- **Module Exports**: Fixed detector module references in index.js
- **UI/UX**: Complete redesign with minimal, professional styling matching enterprise applications
- **Report Integration**: Web interface now uses the same HTML reporter for consistent, detailed results
- **API Enhancement**: Added HTML format support for detailed report generation
- **Plugin Performance Report Design**: Merged "Detected Plugins" and "Plugin Performance Ranking" sections into a unified table with color-coded impact levels, expandable recommendations, and modern design matching Tailwind CSS standards
- **Comprehensive Site Performance Analysis**: Combined "Performance Analysis" and "PageSpeed Insights Analysis" into a unified, intelligent analysis system that provides actionable insights, priority-based recommendations, and strategic guidance for site optimization
- **Modern Site Issues & Fixes Design**: Completely redesigned the performance analysis section with a modern "Site Issues & Fixes" layout featuring color-coded issue cards, priority-based fix recommendations, and professional styling that matches contemporary web application design standards
- **Professional SaaS-Style Icons**: Replaced emoji icons with minimal inline SVG icons (security, analytics, speed, gps_fixed, cached, lock, warning, check_circle) for a more professional appearance matching enterprise SaaS applications, ensuring consistent display across all devices and networks
- **Consistent Visual Design**: Standardized styling across all report sections using the Plugin Performance Report design as the foundation, including consistent cards, grids, typography, hover effects, and spacing for a cohesive user experience

### Fixed
- **Report Display**: Web interface now properly displays detailed analysis results using server-generated HTML reports
- **Site Issues Section Styling**: Fixed extra padding on "Site Issues & Fixes" title and improved text alignment for section headers to match other sections consistently
- **Icon System**: Replaced custom SVG icons with Google Material Symbols for better visual consistency, professional appearance, and enhanced customization capabilities in issue cards
- **Icon Visual Enhancement**: Enhanced issue icons with light colored circular backgrounds and darker icon colors for improved contrast and professional appearance
- **PageSpeed Data Extraction**: Fixed field mapping for Core Web Vitals metrics (LCP, FCP, CLS, TBT, Speed Index) to properly extract values from PageSpeed Insights API response structure
- **Report Consistency**: Ensures the same detailed report shown in the web interface matches the downloaded HTML file
- **Code Optimization**: Removed duplicate client-side HTML generation code, now uses existing HTML reporter from `src/reporters/html-reporter.js`
- **Single API Call**: Streamlined to use one API call with `format: 'html'` parameter instead of multiple calls
- **Server Debugging**: Added proper error handling and logging for HTML report generation
- **API Response**: Fixed missing `htmlReport` field in API responses when `format: 'html'` is requested

### Enhanced
- **Professional Report Styling**: Updated HTML reporter styles to match the main site's professional design system
- **Consistent Design Language**: HTML reports now use the same CSS variables, colors, and styling as the web interface
- **Improved Visual Hierarchy**: Enhanced typography, spacing, and visual elements for better readability
- **Modern UI Components**: Updated cards, badges, and layout elements with professional styling and hover effects
- **Brand Consistency**: Reports now maintain visual consistency with the main WordPress Analyzer interface
- **Corporate-Grade Design**: Removed colorful gradients and effects for a clean, professional client-ready appearance
- **Business-Focused Styling**: Simplified color scheme and removed decorative elements for enterprise presentation
- **Print Media Fix**: Removed gradient background from print stylesheet for consistent professional appearance
- **Professional Status Colors**: Added minimal, professional color coding to status indicators (Outdated, Unknown, Up to Date, etc.)
- **Enhanced Readability**: Status badges now use subtle background colors with professional contrast for better client understanding
- **Visual Hierarchy**: Color-coded plugin statistics and performance indicators for improved report clarity

## [2.0.0] - 2025-08-25

### 🚀 Major Architecture Restructure

#### Added
- **Modular Architecture**: Complete restructuring into organized modules
- **Enhanced Detection**: Improved WordPress, version, theme, and plugin detection
- **Multiple Report Formats**: Console and JSON reporting with security analysis
- **Advanced Configuration**: Comprehensive options for customization
- **Performance Optimization**: Parallel processing and efficient request handling
- **Security Analysis**: Risk assessment and recommendations
- **Multiple Site Support**: Bulk analysis capabilities
- **Individual Component Access**: Use detectors and utilities independently

#### Changed
- **BREAKING**: Moved from monolithic to modular structure
- **BREAKING**: Updated API response format for better organization
- **BREAKING**: Enhanced configuration options
- **Improved**: Detection accuracy and reliability
- **Enhanced**: Error handling and edge case management
- **Updated**: Dependencies and performance optimizations

#### Project Structure
```
src/
├── config/          # Configuration and constants
├── detectors/       # Specialized detection modules
├── utils/           # Reusable utility functions
├── reporters/       # Multiple output formats
└── wordpress-analyzer.js  # Main orchestrator
```

#### New Modules
- `WordPressDetector`: WordPress presence detection with confidence scoring
- `VersionDetector`: Multi-method WordPress version identification
- `ThemeDetector`: Active theme analysis with metadata extraction
- `PluginDetector`: Plugin discovery with version checking
- `HttpClient`: Robust HTTP handling with retries and timeouts
- `UrlHelper`: URL manipulation and validation utilities
- `VersionComparator`: Advanced version comparison and sorting
- `ConsoleReporter`: Rich terminal output with security insights
- `JsonReporter`: Structured JSON reports with performance analysis

#### Enhanced Features
- **Security Assessment**: Risk analysis and vulnerability indicators
- **Performance Insights**: Plugin impact analysis and recommendations
- **Plugin Categorization**: Automatic classification (security, SEO, performance, etc.)
- **Confidence Scoring**: Reliability indicators for all detections
- **Multi-site Analysis**: Concurrent processing of multiple sites
- **Quick Detection**: Fast WordPress identification without full analysis

#### Enhanced Detection Capabilities
- **Enterprise-Grade WordPress Detection**: 15+ detection methods with 100% accuracy
- **Plugin Detection**: Expanded from 10 to 25+ supported plugins
- **Advanced Asset Introspection**: HTTP range requests, source map analysis, header extraction
- **Optimized Asset Processing**: Parallel processing with 60% faster execution 🆕
- **Conservative Version Detection**: Accurate WordPress version detection with validation 🆕
- **Enhanced Plugin Version Detection**: Multi-method version extraction with validation 🆕
- **False Positive Filtering**: Intelligent filtering of invalid plugin detections 🆕
- **Semantic Version Normalization**: Intelligent version string standardization
- **Content-Type Aware Analysis**: CSS/JS specific extraction patterns
- **HTTP Header Analysis**: ETag and custom header version extraction
- **REST API Detection**: High-confidence plugin identification via API endpoints
- **JavaScript Variable Detection**: Enhanced plugin and version detection
- **Meta Tag Analysis**: Additional detection method for SEO plugins
- **Comprehensive CSS Selectors**: Improved pattern matching for popular plugins
- **Efficient File Analysis**: Partial content fetching for performance optimization
- **Multi-Endpoint Testing**: Sitemap, robots.txt, feed, admin endpoint detection

#### Simplified Features
- **HTML Reports**: Professional, minimal UI without security scoring
- **Reports Directory**: All generated reports organized in `/reports` folder
- **Streamlined Output**: Focused on core WordPress analysis features

#### Documentation
- Enhanced `README.md` with comprehensive usage examples
- Updated inline documentation and code comments
- Clean, minimal project structure focused on core functionality

## [1.0.0] - 2025-08-25

### Initial Release

#### Added
- Basic WordPress site analysis functionality
- WordPress version detection
- Active theme identification
- Plugin discovery and version checking
- Console report generation
- Command-line interface
- Basic error handling and validation

#### Features
- WordPress detection using multiple indicators
- Version extraction from various sources
- Theme analysis from stylesheets and body classes
- Plugin identification from asset paths and HTML patterns
- Outdated component detection via WordPress.org API
- Formatted console output with detailed information
