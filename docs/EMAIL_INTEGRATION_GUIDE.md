# Email Integration Guide

This guide explains how to set up and use the email functionality in the WordPress Site Analyzer to send PDF reports via email.

## Overview

The email integration allows you to:
- Send WordPress analysis reports directly to email addresses
- Generate PDF reports and attach them to emails
- Use professional email templates with analysis summaries
- Support multiple email providers (Gmail, Outlook, custom SMTP)

## Features

- **Professional Email Templates**: HTML and text email templates with analysis summaries
- **PDF Attachments**: Automatically attach generated PDF reports
- **Multiple Email Providers**: Support for Gmail, Outlook, and custom SMTP
- **Email Validation**: Built-in email address validation
- **Error Handling**: Comprehensive error handling and logging
- **Test Endpoints**: Dedicated endpoints for testing email functionality

## Setup

### 1. Install Dependencies

The email functionality requires additional dependencies that are automatically installed:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```bash
cp env.example .env
```

Edit the `.env` file with your email settings:

```env
# Server Configuration
PORT=3000

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=WordPress Analyzer <your-email@gmail.com>
```

### 3. Email Provider Setup

#### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → App passwords
   - Generate app password for "WordPress Analyzer"
   - Use the generated password in `SMTP_PASS`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=WordPress Analyzer <your-email@gmail.com>
```

#### Outlook/Hotmail Setup

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=WordPress Analyzer <your-email@outlook.com>
```

#### Custom SMTP Setup

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=WordPress Analyzer <your-email@yourdomain.com>
```

## Usage

### 1. API Endpoints

#### Send Analysis Report via Email

**POST** `/api/analyze/email`

Send a WordPress analysis report to an email address.

**Request Body:**
```json
{
    "url": "https://example.com",
    "email": "recipient@example.com",
    "format": "standard",
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

**Parameters:**
- `url` (required): Website URL to analyze
- `email` (required): Recipient email address
- `format` (optional): PDF format (`standard`, `print`, `landscape`)
- `options` (optional): PDF generation options

**Response:**
```json
{
    "success": true,
    "message": "Analysis report sent successfully",
    "data": {
        "recipient": "recipient@example.com",
        "siteUrl": "https://example.com",
        "messageId": "message-id-123",
        "filename": "wordpress-analysis-example-com-2024-01-15T10-30-00.pdf",
        "analysisSummary": {
            "isWordPress": true,
            "version": "6.4.1",
            "theme": "Twenty Twenty-Three",
            "pluginCount": 5,
            "outdatedPlugins": 2
        }
    }
}
```

#### Test Email Configuration

**GET** `/api/email/config`

Test if email service is properly configured.

**Response:**
```json
{
    "success": true,
    "message": "Email service is properly configured",
    "data": {
        "success": true,
        "message": "Email service is properly configured"
    }
}
```

#### Send Test Email

**POST** `/api/email/test`

Send a test email to verify email functionality.

**Request Body:**
```json
{
    "email": "test@example.com"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Test email sent successfully",
    "data": {
        "recipient": "test@example.com",
        "messageId": "message-id-456"
    }
}
```

### 2. Command Line Examples

#### Send Analysis Report

```bash
curl -X POST http://localhost:3000/api/analyze/email \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "email": "client@example.com",
    "format": "print"
  }'
```

#### Test Email Configuration

```bash
curl http://localhost:3000/api/email/config
```

#### Send Test Email

```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. JavaScript/Fetch Examples

#### Send Analysis Report

```javascript
const response = await fetch('http://localhost:3000/api/analyze/email', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        url: 'https://example.com',
        email: 'client@example.com',
        format: 'standard'
    })
});

const result = await response.json();
console.log('Email sent:', result.message);
```

#### Test Email Functionality

```javascript
// Test email configuration
const configResponse = await fetch('http://localhost:3000/api/email/config');
const config = await configResponse.json();
console.log('Email config:', config.message);

// Send test email
const testResponse = await fetch('http://localhost:3000/api/email/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
});
const testResult = await testResponse.json();
console.log('Test email:', testResult.message);
```

## Testing

### 1. Test Email Service

```bash
# Test email service configuration
npm run test-email-service

# Test email API endpoints
npm run test-email-api

# Test complete email workflow
npm run test-email-workflow

# Test all email functionality
npm run test-email

# Display setup instructions
npm run email-setup
```

### 2. Manual Testing

1. **Start the server:**
   ```bash
   npm run web
   ```

2. **Test email configuration:**
   ```bash
   curl http://localhost:3000/api/email/config
   ```

3. **Send test email:**
   ```bash
   curl -X POST http://localhost:3000/api/email/test \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@example.com"}'
   ```

4. **Send analysis report:**
   ```bash
   curl -X POST http://localhost:3000/api/analyze/email \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://wordpress.org",
       "email": "your-email@example.com"
     }'
   ```

### 3. Environment Variables for Testing

Set the `TEST_EMAIL` environment variable for automated testing:

```bash
export TEST_EMAIL=your-email@example.com
npm run test-email
```

## Email Templates

### HTML Email Template

The email service generates professional HTML emails with:

- **Header**: WordPress Site Analyzer branding
- **Summary Section**: Key analysis results in a grid layout
- **Report Information**: Details about the attached PDF
- **Action Alerts**: Warnings for outdated plugins or security issues
- **Footer**: Generator information and links

### Text Email Template

Plain text version includes:

- Analysis summary
- Key findings
- Action items
- Report details

### PDF Attachment

The email includes a PDF attachment with:

- Complete WordPress analysis report
- Professional formatting
- All analysis data and recommendations
- Configurable format (standard, print-optimized, landscape)

## Error Handling

### Common Issues

#### 1. Email Configuration Issues

**Error**: "Email service not configured"
**Solution**: Check your `.env` file and ensure all SMTP settings are correct

#### 2. Authentication Failures

**Error**: "Authentication failed"
**Solution**: 
- For Gmail: Use App Passwords, not regular password
- For Outlook: Enable "Less secure app access"
- For custom SMTP: Verify credentials

#### 3. Connection Timeouts

**Error**: "Connection timeout"
**Solution**: Check SMTP host and port settings

#### 4. Invalid Email Address

**Error**: "Invalid email address format"
**Solution**: Ensure email address follows proper format

### Error Response Format

```json
{
    "success": false,
    "error": "Error description",
    "data": null
}
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate credentials regularly

### 2. Email Security

- Use App Passwords for Gmail
- Enable 2-Factor Authentication
- Use secure SMTP connections (TLS/SSL)

### 3. Rate Limiting

- Implement rate limiting for email endpoints
- Monitor email sending frequency
- Respect email provider limits

## Production Deployment

### 1. Environment Variables

Set environment variables in your production environment:

```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=your-production-email@gmail.com
export SMTP_PASS=your-production-app-password
export SMTP_FROM=WordPress Analyzer <your-production-email@gmail.com>
```

### 2. Email Provider Limits

- **Gmail**: 500 emails/day (free), 2000/day (paid)
- **Outlook**: 300 emails/day
- **Custom SMTP**: Check provider limits

### 3. Monitoring

- Monitor email delivery rates
- Set up alerts for email failures
- Log email sending activities

## Troubleshooting

### 1. Email Not Sending

1. Check email configuration: `GET /api/email/config`
2. Verify SMTP credentials
3. Check email provider settings
4. Review server logs

### 2. PDF Generation Issues

1. Ensure Puppeteer is properly installed
2. Check available memory
3. Verify PDF generation permissions

### 3. Email Delivery Issues

1. Check spam folders
2. Verify email address format
3. Test with different email providers
4. Check email provider reputation

## Support

For issues with email functionality:

1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Test email configuration with the test endpoints
4. Verify environment variables are set correctly

## Changelog

- **v2.0.0**: Initial email integration implementation
- Added Nodemailer integration
- Added email service class
- Added email API endpoints
- Added comprehensive testing suite
- Added email templates and PDF attachments
