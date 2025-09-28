// File: ./src/utils/puppeteer-config.js

const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';
const isServerless = isVercel || isProduction;

/**
 * Environment-aware Puppeteer configuration utility
 * Provides different configurations for local development vs serverless deployment
 */
class PuppeteerConfig {
    /**
     * Get the appropriate Puppeteer package based on environment
     * @returns {Object} Puppeteer package and configuration
     */
    static async getPuppeteerConfig() {
        if (isServerless) {
            return await this.getServerlessConfig();
        } else {
            return this.getLocalConfig();
        }
    }

    /**
     * Get serverless-optimized Puppeteer configuration
     * Uses puppeteer-core with self-hosted Chromium from GitHub CDN
     * @returns {Object} Serverless Puppeteer configuration
     */
    static async getServerlessConfig() {
        try {
            // Dynamic imports to avoid bundling issues
            const puppeteer = require('puppeteer-core');
            const chromium = require('@sparticuz/chromium-min');

            // Get Chromium version from @sparticuz/chromium-min
            const chromiumVersion = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar');

            return {
                puppeteer,
                launchOptions: {
                    args: [
                        ...chromium.args,
                        '--hide-scrollbars',
                        '--disable-web-security',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu',
                        '--disable-features=VizDisplayCompositor',
                        '--single-process', // Important for serverless
                        '--no-zygote',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding'
                    ],
                    defaultViewport: chromium.defaultViewport,
                    executablePath: chromiumVersion,
                    headless: chromium.headless,
                    ignoreHTTPSErrors: true,
                    timeout: 30000, // Reduced timeout for serverless
                    protocolTimeout: 30000
                },
                environment: 'serverless'
            };
        } catch (error) {
            console.error('Failed to initialize serverless Puppeteer config:', error);
            throw new Error(`Serverless Puppeteer configuration failed: ${error.message}`);
        }
    }

    /**
     * Get local development Puppeteer configuration
     * Uses standard puppeteer package with local Chromium
     * @returns {Object} Local Puppeteer configuration
     */
    static getLocalConfig() {
        try {
            const puppeteer = require('puppeteer');

            return {
                puppeteer,
                launchOptions: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu',
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor'
                    ],
                    timeout: 120000,
                    protocolTimeout: 120000
                },
                environment: 'local'
            };
        } catch (error) {
            console.error('Failed to initialize local Puppeteer config:', error);
            throw new Error(`Local Puppeteer configuration failed: ${error.message}`);
        }
    }

    /**
     * Get environment information for debugging
     * @returns {Object} Environment details
     */
    static getEnvironmentInfo() {
        return {
            isVercel,
            isProduction,
            isServerless,
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL,
            platform: process.platform,
            arch: process.arch
        };
    }

    /**
     * Get optimized page configuration based on environment
     * @returns {Object} Page configuration options
     */
    static getPageConfig() {
        if (isServerless) {
            return {
                timeout: 30000,
                navigationTimeout: 30000,
                viewport: {
                    width: 1200,
                    height: 800,
                    deviceScaleFactor: 1
                }
            };
        } else {
            return {
                timeout: 120000,
                navigationTimeout: 120000,
                viewport: {
                    width: 1200,
                    height: 800,
                    deviceScaleFactor: 1
                }
            };
        }
    }

    /**
     * Get optimized PDF generation options based on environment
     * @param {Object} baseOptions - Base PDF options
     * @returns {Object} Environment-optimized PDF options
     */
    static getOptimizedPdfOptions(baseOptions = {}) {
        const serverlessOptimizations = {
            preferCSSPageSize: true,
            printBackground: true,
            // Reduce quality slightly for serverless to save memory
            scale: 0.8
        };

        const localOptimizations = {
            preferCSSPageSize: false,
            printBackground: true,
            scale: 1.0
        };

        return {
            ...baseOptions,
            ...(isServerless ? serverlessOptimizations : localOptimizations)
        };
    }
}

module.exports = PuppeteerConfig;
