# Tests Directory

This directory contains all test scripts for the WordPress Site Analyzer project, organized by functionality for better maintainability and clarity.

## 📁 Directory Structure

```
tests/
├── README.md                    # This file
├── pdf/                        # PDF generation tests
│   └── test-pdf-generation.js  # PDF functionality tests
├── email/                      # Email integration tests
│   └── test-email-functionality.js # Email service tests
└── api/                        # API endpoint tests (future)
```

## 🧪 Test Categories

### PDF Generation Tests (`tests/pdf/`)

Tests for PDF report generation functionality:

- **Direct PDF Generation**: Tests the `PdfReporter` class directly
- **API Endpoint Tests**: Tests the `/api/analyze/pdf` endpoint
- **Multiple Formats**: Tests standard, print-optimized, and landscape formats
- **Custom Options**: Tests various PDF generation options

**Run PDF Tests:**
```bash
npm run test-pdf              # Run all PDF tests
npm run test-pdf-direct       # Direct PDF generation only
npm run test-pdf-api          # API endpoint tests only
```

### Email Integration Tests (`tests/email/`)

Tests for email functionality and integration:

- **Email Service Tests**: Direct testing of `EmailService` class
- **SMTP Configuration**: Tests email configuration and connection
- **Email API Tests**: Tests email-related API endpoints
- **End-to-End Workflow**: Complete analysis → PDF → email workflow

**Run Email Tests:**
```bash
npm run test-email            # Run all email tests
npm run test-email-service    # Email service tests only
npm run test-email-api        # Email API tests only
npm run test-email-workflow   # End-to-end workflow test
npm run email-setup           # Display setup instructions
```

## 🔧 Prerequisites

### For PDF Tests:
- Server running (`npm run web`)
- Puppeteer dependencies installed

### For Email Tests:
- `.env` file configured with SMTP settings
- Valid email credentials
- Server running for API tests

## 📋 Test Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMTP_FROM="WordPress Analyzer <your-email@example.com>"

# Test Configuration
TEST_EMAIL=test@example.com
```

### Test URLs

Default test URLs can be modified in the test files:
- **PDF Tests**: `https://wordpress.org`
- **Email Tests**: `https://wordpress.org`

## 🚀 Running Tests

### Individual Test Categories

```bash
# PDF Generation Tests
npm run test-pdf
npm run test-pdf-direct
npm run test-pdf-api

# Email Integration Tests
npm run test-email
npm run test-email-service
npm run test-email-api
npm run test-email-workflow
```

### All Tests

```bash
# Run all tests (requires server to be running)
npm run test-pdf && npm run test-email
```

## 📊 Test Output

Tests provide detailed console output including:
- ✅ Success indicators
- ❌ Error messages
- 📊 Performance metrics
- 📧 Email delivery confirmations
- 📄 PDF generation details

## 🐛 Troubleshooting

### Common Issues

1. **Server Not Running**
   ```
   Error: ECONNREFUSED
   Solution: Start server with `npm run web`
   ```

2. **Email Configuration Issues**
   ```
   Error: SMTP connection failed
   Solution: Check .env file and SMTP credentials
   ```

3. **PDF Generation Fails**
   ```
   Error: Puppeteer launch failed
   Solution: Ensure Puppeteer dependencies are installed
   ```

### Debug Mode

Add `--verbose` flag to test scripts for detailed output:
```bash
node tests/pdf/test-pdf-generation.js --verbose
node tests/email/test-email-functionality.js --verbose
```

## 📝 Adding New Tests

### Test File Structure

```javascript
// File: tests/[category]/test-[feature].js

const FeatureClass = require('../../src/feature-class');
const fs = require('fs');
const path = require('path');

/**
 * Test script for [feature] functionality
 */

async function testFeature() {
    console.log('🧪 Testing [Feature] Functionality\n');
    
    try {
        // Test implementation
        console.log('✅ Test completed successfully');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    testFeature().catch(console.error);
}

module.exports = { testFeature };
```

### Adding to package.json

```json
{
  "scripts": {
    "test-[feature]": "node tests/[category]/test-[feature].js"
  }
}
```

## 🔄 Continuous Integration

These tests are designed to be run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run test-pdf
    npm run test-email
```

## 📚 Related Documentation

- [PDF Generation Guide](../docs/PDF_GENERATION_GUIDE.md)
- [Email Integration Guide](../docs/EMAIL_INTEGRATION_GUIDE.md)
- [Main README](../README.md)

---

**Note**: Always ensure the server is running before executing API tests. Use `npm run web` to start the development server.
