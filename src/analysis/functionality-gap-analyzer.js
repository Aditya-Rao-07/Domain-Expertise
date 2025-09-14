// File: ./src/analysis/functionality-gap-analyzer.js

const HttpClient = require('../utils/http-client');
const UrlHelper = require('../utils/url-helper');

/**
 * Functionality Gap Analyzer
 * Analyzes site functionality and suggests missing features with plugin recommendations
 */
class FunctionalityGapAnalyzer {
    constructor(httpClient) {
        this.httpClient = httpClient || new HttpClient();
        
        // Functionality detection patterns
        this.functionalityPatterns = this.initializeFunctionalityPatterns();
        
        // Plugin recommendations for missing functionality
        this.functionalityRecommendations = this.initializeFunctionalityRecommendations();
    }

    /**
     * Initialize functionality detection patterns
     * @returns {Object} Functionality patterns organized by category
     */
    initializeFunctionalityPatterns() {
        return {
            // Contact forms
            contactForms: {
                patterns: [
                    /contact.*form/i,
                    /wpcf7/i,
                    /wpforms/i,
                    /gravity.*forms/i,
                    /ninja.*forms/i,
                    /formidable/i,
                    /caldera/i,
                    /<form[^>]*>/i,
                    /action=["'][^"']*contact/i
                ],
                selectors: [
                    '.wpcf7',
                    '.wpforms-form',
                    '.gform_wrapper',
                    '.nf-form-wrap',
                    '.frm_form',
                    '.caldera-form',
                    'form[action*="contact"]',
                    'form[action*="mail"]'
                ],
                endpoints: [
                    '/contact/',
                    '/contact-us/',
                    '/get-in-touch/',
                    '/wp-json/contact-form-7/',
                    '/wp-json/wpforms/',
                    '/wp-json/gf/'
                ]
            },

            // E-commerce functionality
            ecommerce: {
                patterns: [
                    /woocommerce/i,
                    /shop/i,
                    /cart/i,
                    /checkout/i,
                    /product/i,
                    /add.*to.*cart/i,
                    /buy.*now/i,
                    /price/i,
                    /currency/i
                ],
                selectors: [
                    '.woocommerce',
                    '.shop',
                    '.cart',
                    '.checkout',
                    '.product',
                    '.add-to-cart',
                    '.price',
                    '.currency',
                    '[data-product-id]',
                    '[data-price]'
                ],
                endpoints: [
                    '/shop/',
                    '/cart/',
                    '/checkout/',
                    '/product/',
                    '/wp-json/wc/',
                    '/wp-json/woocommerce/'
                ]
            },

            // SEO functionality
            seo: {
                patterns: [
                    /yoast/i,
                    /rank.*math/i,
                    /all.*in.*one.*seo/i,
                    /seo.*framework/i,
                    /meta.*description/i,
                    /meta.*keywords/i,
                    /canonical/i,
                    /sitemap/i,
                    /robots\.txt/i
                ],
                selectors: [
                    '.yoast',
                    '.rank-math',
                    '.aioseo',
                    '.seoframework',
                    'meta[name="description"]',
                    'meta[name="keywords"]',
                    'link[rel="canonical"]',
                    'link[rel="sitemap"]'
                ],
                endpoints: [
                    '/sitemap.xml',
                    '/sitemap_index.xml',
                    '/robots.txt',
                    '/wp-json/yoast/',
                    '/wp-json/rankmath/',
                    '/wp-json/aioseo/'
                ]
            },

            // Security features
            security: {
                patterns: [
                    /wordfence/i,
                    /sucuri/i,
                    /ithemes.*security/i,
                    /security.*ninja/i,
                    /login.*security/i,
                    /two.*factor/i,
                    /2fa/i,
                    /ssl/i,
                    /https/i,
                    /firewall/i
                ],
                selectors: [
                    '.wordfence',
                    '.sucuri',
                    '.ithemes-security',
                    '.security-ninja',
                    '.login-security',
                    '.two-factor',
                    '.ssl-indicator'
                ],
                endpoints: [
                    '/wp-json/wordfence/',
                    '/wp-json/sucuri/',
                    '/wp-json/ithemes-security/',
                    '/wp-json/security-ninja/'
                ]
            },

            // Backup functionality
            backup: {
                patterns: [
                    /backup/i,
                    /updraft/i,
                    /backwpup/i,
                    /duplicator/i,
                    /all.*in.*one.*wp.*migration/i,
                    /backupbuddy/i,
                    /vaultpress/i
                ],
                selectors: [
                    '.backup',
                    '.updraft',
                    '.backwpup',
                    '.duplicator',
                    '.ai1wm',
                    '.backupbuddy',
                    '.vaultpress'
                ],
                endpoints: [
                    '/wp-json/updraftplus/',
                    '/wp-json/backwpup/',
                    '/wp-json/duplicator/',
                    '/wp-json/ai1wm/'
                ]
            },

            // Analytics and tracking
            analytics: {
                patterns: [
                    /google.*analytics/i,
                    /gtag/i,
                    /ga\(/i,
                    /google.*tag.*manager/i,
                    /gtm/i,
                    /facebook.*pixel/i,
                    /fbq\(/i,
                    /hotjar/i,
                    /mixpanel/i,
                    /amplitude/i
                ],
                selectors: [
                    'script[src*="google-analytics"]',
                    'script[src*="googletagmanager"]',
                    'script[src*="gtag"]',
                    'script[src*="facebook"]',
                    'script[src*="hotjar"]',
                    'script[src*="mixpanel"]'
                ],
                endpoints: [
                    '/wp-json/google-analytics/',
                    '/wp-json/gtm/',
                    '/wp-json/facebook-pixel/'
                ]
            },

            // Social media integration
            socialMedia: {
                patterns: [
                    /social.*share/i,
                    /facebook/i,
                    /twitter/i,
                    /instagram/i,
                    /linkedin/i,
                    /pinterest/i,
                    /youtube/i,
                    /social.*media/i,
                    /share.*button/i
                ],
                selectors: [
                    '.social-share',
                    '.facebook',
                    '.twitter',
                    '.instagram',
                    '.linkedin',
                    '.pinterest',
                    '.youtube',
                    '.social-media',
                    '.share-button',
                    '[data-share]'
                ],
                endpoints: [
                    '/wp-json/social-share/',
                    '/wp-json/facebook/',
                    '/wp-json/twitter/'
                ]
            },

            // Newsletter/Email marketing
            emailMarketing: {
                patterns: [
                    /newsletter/i,
                    /mailchimp/i,
                    /constant.*contact/i,
                    /aweber/i,
                    /getresponse/i,
                    /convertkit/i,
                    /email.*marketing/i,
                    /subscribe/i,
                    /opt.*in/i
                ],
                selectors: [
                    '.newsletter',
                    '.mailchimp',
                    '.constant-contact',
                    '.aweber',
                    '.getresponse',
                    '.convertkit',
                    '.email-marketing',
                    '.subscribe',
                    '.opt-in',
                    'form[action*="mailchimp"]',
                    'form[action*="constant-contact"]'
                ],
                endpoints: [
                    '/wp-json/mailchimp/',
                    '/wp-json/constant-contact/',
                    '/wp-json/aweber/',
                    '/wp-json/newsletter/'
                ]
            },

            // Search functionality
            search: {
                patterns: [
                    /search/i,
                    /wp.*search/i,
                    /relevanssi/i,
                    /search.*wp/i,
                    /ajax.*search/i,
                    /live.*search/i
                ],
                selectors: [
                    '.search',
                    '.wp-search',
                    '.relevanssi',
                    '.search-wp',
                    '.ajax-search',
                    '.live-search',
                    'input[type="search"]',
                    'form[role="search"]'
                ],
                endpoints: [
                    '/search/',
                    '/wp-json/search/',
                    '/wp-json/relevanssi/'
                ]
            },

            // Membership/User management
            membership: {
                patterns: [
                    /membership/i,
                    /member/i,
                    /user.*role/i,
                    /restrict.*content/i,
                    /paid.*content/i,
                    /subscription/i,
                    /login/i,
                    /register/i,
                    /profile/i
                ],
                selectors: [
                    '.membership',
                    '.member',
                    '.user-role',
                    '.restrict-content',
                    '.paid-content',
                    '.subscription',
                    '.login',
                    '.register',
                    '.profile',
                    '.user-profile'
                ],
                endpoints: [
                    '/wp-json/membership/',
                    '/wp-json/member/',
                    '/wp-json/user-role/',
                    '/wp-json/restrict-content/'
                ]
            },

            // Performance optimization
            performance: {
                patterns: [
                    /cache/i,
                    /optimize/i,
                    /minify/i,
                    /compress/i,
                    /lazy.*load/i,
                    /cdn/i,
                    /speed/i,
                    /performance/i
                ],
                selectors: [
                    '.cache',
                    '.optimize',
                    '.minify',
                    '.compress',
                    '.lazy-load',
                    '.cdn',
                    '.speed',
                    '.performance'
                ],
                endpoints: [
                    '/wp-json/cache/',
                    '/wp-json/optimize/',
                    '/wp-json/minify/'
                ]
            }
        };
    }

    /**
     * Initialize functionality recommendations
     * @returns {Object} Plugin recommendations for missing functionality
     */
    initializeFunctionalityRecommendations() {
        return {
            contactForms: {
                high: [
                    {
                        plugin: 'contact-form-7',
                        name: 'Contact Form 7',
                        category: 'contact-forms',
                        priority: 'high',
                        description: 'Simple and flexible contact form plugin',
                        features: ['Multiple form types', 'Spam protection', 'Email notifications', 'Custom styling'],
                        cost: 'free',
                        alternatives: ['wpforms-lite', 'gravityforms', 'ninja-forms']
                    },
                    {
                        plugin: 'wpforms-lite',
                        name: 'WPForms Lite',
                        category: 'contact-forms',
                        priority: 'high',
                        description: 'User-friendly drag-and-drop form builder',
                        features: ['Drag-and-drop builder', 'Pre-built templates', 'Spam protection', 'Email notifications'],
                        cost: 'freemium',
                        alternatives: ['contact-form-7', 'gravityforms', 'ninja-forms']
                    }
                ],
                medium: [
                    {
                        plugin: 'ninja-forms',
                        name: 'Ninja Forms',
                        category: 'contact-forms',
                        priority: 'medium',
                        description: 'Flexible form builder with advanced features',
                        features: ['Visual form builder', 'Conditional logic', 'Multi-step forms', 'Integrations'],
                        cost: 'freemium',
                        alternatives: ['contact-form-7', 'wpforms-lite', 'gravityforms']
                    }
                ]
            },

            ecommerce: {
                high: [
                    {
                        plugin: 'woocommerce',
                        name: 'WooCommerce',
                        category: 'ecommerce',
                        priority: 'high',
                        description: 'Complete e-commerce solution for WordPress',
                        features: ['Product management', 'Shopping cart', 'Payment processing', 'Order management', 'Inventory tracking'],
                        cost: 'free',
                        alternatives: ['easy-digital-downloads', 'wp-ecommerce', 'jigoshop']
                    }
                ]
            },

            seo: {
                high: [
                    {
                        plugin: 'wordpress-seo',
                        name: 'Yoast SEO',
                        category: 'seo',
                        priority: 'high',
                        description: 'Complete SEO solution for WordPress',
                        features: ['On-page SEO', 'XML sitemaps', 'Social media integration', 'Readability analysis', 'Schema markup'],
                        cost: 'freemium',
                        alternatives: ['seo-by-rank-math', 'all-in-one-seo', 'seo-framework']
                    },
                    {
                        plugin: 'seo-by-rank-math',
                        name: 'Rank Math SEO',
                        category: 'seo',
                        priority: 'high',
                        description: 'Advanced SEO plugin with AI-powered features',
                        features: ['AI-powered SEO', 'Schema markup', 'Local SEO', 'WooCommerce SEO', '404 monitoring'],
                        cost: 'freemium',
                        alternatives: ['wordpress-seo', 'all-in-one-seo', 'seo-framework']
                    }
                ]
            },

            security: {
                high: [
                    {
                        plugin: 'wordfence',
                        name: 'Wordfence Security',
                        category: 'security',
                        priority: 'high',
                        description: 'Comprehensive security plugin with firewall and malware scanning',
                        features: ['Web application firewall', 'Malware scanning', 'Login security', 'Two-factor authentication', 'Real-time monitoring'],
                        cost: 'freemium',
                        alternatives: ['sucuri', 'ithemes-security', 'security-ninja']
                    },
                    {
                        plugin: 'ithemes-security',
                        name: 'iThemes Security',
                        category: 'security',
                        priority: 'high',
                        description: 'Security plugin with 30+ security features',
                        features: ['Brute force protection', 'Two-factor authentication', 'File change detection', 'Database backups', 'SSL enforcement'],
                        cost: 'freemium',
                        alternatives: ['wordfence', 'sucuri', 'security-ninja']
                    }
                ]
            },

            backup: {
                high: [
                    {
                        plugin: 'updraftplus',
                        name: 'UpdraftPlus',
                        category: 'backup',
                        priority: 'high',
                        description: 'Most popular backup plugin for WordPress',
                        features: ['Automated backups', 'Cloud storage integration', 'One-click restore', 'Database backups', 'File backups'],
                        cost: 'freemium',
                        alternatives: ['backwpup', 'duplicator', 'all-in-one-wp-migration']
                    },
                    {
                        plugin: 'backwpup',
                        name: 'BackWPup',
                        category: 'backup',
                        priority: 'high',
                        description: 'Free backup plugin with cloud storage support',
                        features: ['Automated backups', 'Cloud storage', 'Database optimization', 'File compression', 'Email notifications'],
                        cost: 'free',
                        alternatives: ['updraftplus', 'duplicator', 'all-in-one-wp-migration']
                    }
                ]
            },

            analytics: {
                medium: [
                    {
                        plugin: 'google-analytics-dashboard-for-wp',
                        name: 'Google Analytics Dashboard for WP',
                        category: 'analytics',
                        priority: 'medium',
                        description: 'Google Analytics integration with dashboard widgets',
                        features: ['Google Analytics integration', 'Dashboard widgets', 'Real-time statistics', 'Custom reports', 'E-commerce tracking'],
                        cost: 'free',
                        alternatives: ['monsterinsights', 'google-analytics-for-wordpress', 'ga-google-analytics']
                    },
                    {
                        plugin: 'monsterinsights',
                        name: 'MonsterInsights',
                        category: 'analytics',
                        priority: 'medium',
                        description: 'Google Analytics made easy for WordPress',
                        features: ['Google Analytics integration', 'Enhanced e-commerce tracking', 'Custom dimensions', 'Performance reports', 'Real-time stats'],
                        cost: 'freemium',
                        alternatives: ['google-analytics-dashboard-for-wp', 'google-analytics-for-wordpress']
                    }
                ]
            },

            socialMedia: {
                medium: [
                    {
                        plugin: 'social-warfare',
                        name: 'Social Warfare',
                        category: 'social-media',
                        priority: 'medium',
                        description: 'Social media sharing plugin with analytics',
                        features: ['Social sharing buttons', 'Click tracking', 'Custom share messages', 'Social proof', 'Recovery tool'],
                        cost: 'freemium',
                        alternatives: ['addthis', 'sharethis', 'social-share-buttons']
                    },
                    {
                        plugin: 'addthis',
                        name: 'AddThis',
                        category: 'social-media',
                        priority: 'medium',
                        description: 'Social sharing and follow buttons',
                        features: ['Social sharing', 'Follow buttons', 'Analytics', 'Customization', 'Mobile optimization'],
                        cost: 'free',
                        alternatives: ['social-warfare', 'sharethis', 'social-share-buttons']
                    }
                ]
            },

            emailMarketing: {
                medium: [
                    {
                        plugin: 'mailchimp-for-wp',
                        name: 'Mailchimp for WordPress',
                        category: 'email-marketing',
                        priority: 'medium',
                        description: 'Mailchimp integration for WordPress',
                        features: ['Mailchimp integration', 'Form builder', 'List management', 'Automation', 'Analytics'],
                        cost: 'free',
                        alternatives: ['constant-contact-forms', 'aweber', 'getresponse']
                    },
                    {
                        plugin: 'constant-contact-forms',
                        name: 'Constant Contact Forms',
                        category: 'email-marketing',
                        priority: 'medium',
                        description: 'Constant Contact integration for WordPress',
                        features: ['Constant Contact integration', 'Form builder', 'List management', 'Automation', 'Analytics'],
                        cost: 'free',
                        alternatives: ['mailchimp-for-wp', 'aweber', 'getresponse']
                    }
                ]
            },

            search: {
                low: [
                    {
                        plugin: 'relevanssi',
                        name: 'Relevanssi',
                        category: 'search',
                        priority: 'low',
                        description: 'Better search for WordPress',
                        features: ['Improved search results', 'Search analytics', 'Custom fields search', 'Taxonomy search', 'Search highlighting'],
                        cost: 'freemium',
                        alternatives: ['search-wp', 'ajax-search-lite', 'wp-search-suggest']
                    }
                ]
            },

            membership: {
                medium: [
                    {
                        plugin: 'memberpress',
                        name: 'MemberPress',
                        category: 'membership',
                        priority: 'medium',
                        description: 'Complete membership plugin for WordPress',
                        features: ['Content protection', 'Payment processing', 'User management', 'Subscription management', 'Access control'],
                        cost: 'premium',
                        alternatives: ['restrict-content-pro', 'paid-memberships-pro', 'ultimate-member']
                    },
                    {
                        plugin: 'ultimate-member',
                        name: 'Ultimate Member',
                        category: 'membership',
                        priority: 'medium',
                        description: 'User profile and membership plugin',
                        features: ['User profiles', 'Registration forms', 'Login forms', 'User roles', 'Content restriction'],
                        cost: 'freemium',
                        alternatives: ['memberpress', 'restrict-content-pro', 'paid-memberships-pro']
                    }
                ]
            }
        };
    }

    /**
     * Analyze site functionality and identify gaps
     * @param {string} baseUrl - Base URL of the site
     * @param {Object} $ - Cheerio instance
     * @param {string} html - Raw HTML content
     * @param {Array} plugins - Detected plugins
     * @returns {Object} Functionality analysis results
     */
    async analyzeFunctionality(baseUrl, $, html, plugins) {
        console.log('🔍 Analyzing site functionality...');
        
        const analysis = {
            detected: {},
            missing: {},
            recommendations: [],
            score: 0,
            summary: ''
        };

        // Apply an overall time budget to avoid long processing
        const startedAtMs = Date.now();
        const overallBudgetMs = 8000; // 8s budget for functionality analysis

        // Analyze each functionality category
        for (const [category, patterns] of Object.entries(this.functionalityPatterns)) {
            // Stop if we exceeded overall budget
            if (Date.now() - startedAtMs > overallBudgetMs) {
                console.warn(`⏱️ Functionality analysis time budget exceeded. Skipping remaining categories.`);
                break;
            }

            const detection = await this.detectFunctionality(category, patterns, baseUrl, $, html, plugins);
            analysis.detected[category] = detection;
            
            // If functionality is missing, add recommendations
            if (!detection.present) {
                analysis.missing[category] = detection;
                const categoryRecommendations = this.getRecommendationsForCategory(category, detection);
                analysis.recommendations.push(...categoryRecommendations);
            }
        }

        // Calculate functionality score
        analysis.score = this.calculateFunctionalityScore(analysis.detected);
        
        // Generate summary
        analysis.summary = this.generateFunctionalitySummary(analysis);

        console.log(`✅ Functionality analysis complete: ${Object.keys(analysis.missing).length} gaps identified`);
        return analysis;
    }

    /**
     * Detect specific functionality
     * @param {string} category - Functionality category
     * @param {Object} patterns - Detection patterns
     * @param {string} baseUrl - Base URL
     * @param {Object} $ - Cheerio instance
     * @param {string} html - HTML content
     * @param {Array} plugins - Detected plugins
     * @returns {Object} Detection result
     */
    async detectFunctionality(category, patterns, baseUrl, $, html, plugins) {
        const detection = {
            present: false,
            confidence: 'low',
            methods: [],
            evidence: []
        };

        // Check HTML patterns
        for (const pattern of patterns.patterns) {
            if (pattern.test(html)) {
                detection.present = true;
                detection.confidence = 'high';
                detection.methods.push('html_pattern');
                detection.evidence.push(`Pattern match: ${pattern.toString()}`);
            }
        }

        // Check CSS selectors
        for (const selector of patterns.selectors) {
            if ($(selector).length > 0) {
                detection.present = true;
                detection.confidence = 'high';
                detection.methods.push('css_selector');
                detection.evidence.push(`Selector found: ${selector}`);
            }
        }

        // If already confidently detected via HTML or selectors, skip network calls
        if (!detection.present) {
            // Check API endpoints with short timeouts and in parallel
            const endpointUrls = (patterns.endpoints || []).map(ep => {
                try {
                    return new URL(ep, baseUrl).toString();
                } catch (_) {
                    return baseUrl.replace(/\/$/, '') + '/' + ep.replace(/^\//, '');
                }
            });

            const requests = endpointUrls.map((url, index) => this.httpClient.fetchPage(url, { timeout: 2500 }));
            const results = await Promise.allSettled(requests);

            results.forEach((res, idx) => {
                if (res.status === 'fulfilled' && res.value && res.value.status === 200) {
                    detection.present = true;
                    detection.confidence = 'high';
                    detection.methods.push('api_endpoint');
                    const endpointPath = (patterns.endpoints || [])[idx] || endpointUrls[idx];
                    detection.evidence.push(`Endpoint accessible: ${endpointPath}`);
                }
            });
        }

        // Check for related plugins
        const relatedPlugins = this.getRelatedPlugins(category);
        const hasRelatedPlugin = plugins.some(plugin => 
            relatedPlugins.includes(plugin.slug) || 
            relatedPlugins.some(related => plugin.name && plugin.name.toLowerCase().includes(related))
        );

        if (hasRelatedPlugin) {
            detection.present = true;
            detection.confidence = 'high';
            detection.methods.push('plugin_detection');
            detection.evidence.push('Related plugin detected');
        }

        return detection;
    }

    /**
     * Get related plugins for a functionality category
     * @param {string} category - Functionality category
     * @returns {Array} Related plugin slugs
     */
    getRelatedPlugins(category) {
        const relatedPlugins = {
            contactForms: ['contact-form-7', 'wpforms-lite', 'gravityforms', 'ninja-forms', 'formidable', 'caldera'],
            ecommerce: ['woocommerce', 'easy-digital-downloads', 'wp-ecommerce', 'jigoshop'],
            seo: ['wordpress-seo', 'seo-by-rank-math', 'all-in-one-seo', 'seo-framework'],
            security: ['wordfence', 'sucuri', 'ithemes-security', 'security-ninja'],
            backup: ['updraftplus', 'backwpup', 'duplicator', 'all-in-one-wp-migration', 'backupbuddy'],
            analytics: ['google-analytics-dashboard-for-wp', 'monsterinsights', 'google-analytics-for-wordpress'],
            socialMedia: ['social-warfare', 'addthis', 'sharethis', 'social-share-buttons'],
            emailMarketing: ['mailchimp-for-wp', 'constant-contact-forms', 'aweber', 'getresponse'],
            search: ['relevanssi', 'search-wp', 'ajax-search-lite'],
            membership: ['memberpress', 'restrict-content-pro', 'paid-memberships-pro', 'ultimate-member'],
            performance: ['wp-rocket', 'w3-total-cache', 'autoptimize', 'wp-super-cache']
        };

        return relatedPlugins[category] || [];
    }

    /**
     * Get recommendations for a missing functionality category
     * @param {string} category - Functionality category
     * @param {Object} detection - Detection result
     * @returns {Array} Plugin recommendations
     */
    getRecommendationsForCategory(category, detection) {
        const recommendations = this.functionalityRecommendations[category];
        if (!recommendations) return [];

        const categoryRecommendations = [];
        
        // Add high priority recommendations
        if (recommendations.high) {
            categoryRecommendations.push(...recommendations.high.map(rec => ({
                ...rec,
                reason: `Missing ${category} functionality detected`,
                gap_analysis: detection
            })));
        }

        // Add medium priority recommendations if no high priority ones
        if (categoryRecommendations.length === 0 && recommendations.medium) {
            categoryRecommendations.push(...recommendations.medium.map(rec => ({
                ...rec,
                reason: `Missing ${category} functionality detected`,
                gap_analysis: detection
            })));
        }

        // Add low priority recommendations if no others
        if (categoryRecommendations.length === 0 && recommendations.low) {
            categoryRecommendations.push(...recommendations.low.map(rec => ({
                ...rec,
                reason: `Missing ${category} functionality detected`,
                gap_analysis: detection
            })));
        }

        return categoryRecommendations;
    }

    /**
     * Calculate functionality score
     * @param {Object} detected - Detected functionality
     * @returns {number} Functionality score (0-100)
     */
    calculateFunctionalityScore(detected) {
        const categories = Object.keys(this.functionalityPatterns);
        const presentCount = Object.values(detected).filter(d => d.present).length;
        
        return Math.round((presentCount / categories.length) * 100);
    }

    /**
     * Generate functionality summary
     * @param {Object} analysis - Functionality analysis
     * @returns {string} Summary text
     */
    generateFunctionalitySummary(analysis) {
        const totalCategories = Object.keys(this.functionalityPatterns).length;
        const presentCategories = Object.keys(analysis.detected).filter(cat => analysis.detected[cat].present).length;
        const missingCategories = Object.keys(analysis.missing).length;
        const score = analysis.score;

        if (score >= 80) {
            return `Excellent functionality coverage! ${presentCategories}/${totalCategories} categories present. Only ${missingCategories} minor gaps identified.`;
        } else if (score >= 60) {
            return `Good functionality coverage. ${presentCategories}/${totalCategories} categories present. ${missingCategories} gaps identified with recommendations available.`;
        } else if (score >= 40) {
            return `Moderate functionality coverage. ${presentCategories}/${totalCategories} categories present. ${missingCategories} significant gaps identified.`;
        } else {
            return `Limited functionality coverage. ${presentCategories}/${totalCategories} categories present. ${missingCategories} major gaps identified requiring attention.`;
        }
    }

    /**
     * Get priority recommendations based on site type
     * @param {Object} analysis - Functionality analysis
     * @param {string} siteType - Type of site (blog, business, ecommerce, etc.)
     * @returns {Array} Priority recommendations
     */
    getPriorityRecommendations(analysis, siteType = 'general') {
        const priorityMap = {
            blog: ['seo', 'analytics', 'socialMedia', 'emailMarketing'],
            business: ['contactForms', 'seo', 'analytics', 'security', 'backup'],
            ecommerce: ['ecommerce', 'security', 'backup', 'analytics', 'seo'],
            portfolio: ['seo', 'analytics', 'socialMedia'],
            membership: ['membership', 'security', 'backup', 'analytics']
        };

        const priorities = priorityMap[siteType] || priorityMap.business;
        const priorityRecommendations = [];

        for (const category of priorities) {
            const categoryRecs = analysis.recommendations.filter(rec => rec.category === category);
            if (categoryRecs.length > 0) {
                priorityRecommendations.push(...categoryRecs.slice(0, 2)); // Top 2 per category
            }
        }

        return priorityRecommendations;
    }

    /**
     * Estimate implementation effort
     * @param {Object} recommendation - Plugin recommendation
     * @returns {Object} Implementation effort estimate
     */
    estimateImplementationEffort(recommendation) {
        const effortMap = {
            'contact-form-7': { time: '30 minutes', difficulty: 'easy', setup: 'basic' },
            'wpforms-lite': { time: '1 hour', difficulty: 'easy', setup: 'basic' },
            'woocommerce': { time: '2-4 hours', difficulty: 'medium', setup: 'advanced' },
            'wordpress-seo': { time: '1-2 hours', difficulty: 'medium', setup: 'intermediate' },
            'wordfence': { time: '30 minutes', difficulty: 'easy', setup: 'basic' },
            'updraftplus': { time: '30 minutes', difficulty: 'easy', setup: 'basic' }
        };

        return effortMap[recommendation.plugin] || { time: '1-2 hours', difficulty: 'medium', setup: 'intermediate' };
    }
}

module.exports = FunctionalityGapAnalyzer;
