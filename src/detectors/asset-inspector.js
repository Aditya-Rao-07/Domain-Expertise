// File: ./src/detectors/asset-inspector.js

const HttpRangeClient = require('../utils/http-range');
const UrlHelper = require('../utils/url-helper');

/**
 * Advanced asset inspection for WordPress plugins and themes
 * Based on sophisticated source analysis techniques
 */
class AssetInspector {
    constructor(httpClient) {
        this.rangeClient = new HttpRangeClient();
        this.httpClient = httpClient;
    }

    /**
     * Extract source map URL from JavaScript content
     * @param {Buffer} buffer - File content buffer
     * @returns {string|null} Source map URL or null
     */
    extractSourceMapUrl(buffer) {
        const text = buffer.toString('utf8');
        const match = text.match(/[#@]\s*sourceMappingURL=([^\s*]+)\s*$/m);
        return match ? match[1].trim() : null;
    }

    /**
     * Extract plugin/theme slug from comment banners with enhanced patterns
     * @param {Buffer} buffer - File content buffer
     * @returns {Object|null} Plugin info or null
     */
    extractPluginInfoFromComments(buffer) {
        const text = buffer.toString('utf8');
        
        // Look for wp-content paths
        const pathMatch = text.match(/wp-content\/(plugins|themes)\/([a-zA-Z0-9_-]+)/);
        if (pathMatch) {
            return {
                type: pathMatch[1].slice(0, -1), // 'plugin' or 'theme'
                slug: pathMatch[2],
                source: 'path_comment'
            };
        }

        // Enhanced plugin header patterns
        const pluginHeaderPatterns = [
            // Standard WordPress plugin header
            {
                namePattern: /Plugin Name:\s*(.+?)(?:\n|\r\n?)/i,
                versionPattern: /Version:\s*([0-9][0-9a-zA-Z.-]*?)(?:\n|\r\n?|\s)/i,
                authorPattern: /Author:\s*(.+?)(?:\n|\r\n?)/i
            },
            // Alternative plugin header format
            {
                namePattern: /\/\*\s*@plugin\s+([^\n\r*]+)/i,
                versionPattern: /@version\s+([^\n\r*]+)/i,
                authorPattern: /@author\s+([^\n\r*]+)/i
            },
            // JavaScript comment format
            {
                namePattern: /\/\/\s*Plugin:\s*([^\n\r]+)/i,
                versionPattern: /\/\/\s*Version:\s*([^\n\r]+)/i,
                authorPattern: /\/\/\s*Author:\s*([^\n\r]+)/i
            }
        ];

        for (const pattern of pluginHeaderPatterns) {
            const nameMatch = text.match(pattern.namePattern);
            if (nameMatch) {
                const pluginName = nameMatch[1].trim();
                
                // Extract version
                let version = null;
                if (pattern.versionPattern) {
                    const versionMatch = text.match(pattern.versionPattern);
                    if (versionMatch) {
                        version = versionMatch[1].trim();
                    }
                }
                
                // Extract author
                let author = null;
                if (pattern.authorPattern) {
                    const authorMatch = text.match(pattern.authorPattern);
                    if (authorMatch) {
                        author = authorMatch[1].trim();
                    }
                }
                
                return {
                    type: 'plugin',
                    name: pluginName,
                    version: version,
                    author: author,
                    source: 'plugin_header'
                };
            }
        }

        // Look for theme headers
        const themeHeaderMatch = text.match(/Theme Name:\s*(.+?)(?:\n|\r\n?)/i);
        if (themeHeaderMatch) {
            const versionMatch = text.match(/Version:\s*([0-9][0-9a-zA-Z.-]*?)(?:\n|\r\n?|\s)/i);
            const authorMatch = text.match(/Author:\s*(.+?)(?:\n|\r\n?)/i);
            
            return {
                type: 'theme',
                name: themeHeaderMatch[1].trim(),
                version: versionMatch ? versionMatch[1].trim() : null,
                author: authorMatch ? authorMatch[1].trim() : null,
                source: 'theme_header'
            };
        }



        // First, try plugin-specific patterns
        const pluginSpecificPatterns = [
            /plugin_version["\s]*[:=]["\s]*([0-9][0-9a-zA-Z.-]+)/gi,
            /["\']plugin_version["\']\s*:\s*["\']([0-9][0-9a-zA-Z.-]+)["\']/gi,
            /const\s+PLUGIN_VERSION\s*=\s*["\']([0-9][0-9a-zA-Z.-]+)["\']/gi,
            /define\s*\(\s*["\']PLUGIN_VERSION["\']\s*,\s*["\']([0-9][0-9a-zA-Z.-]+)["\']/gi
        ];
        
        for (const pattern of pluginSpecificPatterns) {
            const matches = [...text.matchAll(pattern)];
            if (matches.length > 0) {
                const versions = matches.map(m => m[1]).filter(v => v.length >= 3);
                if (versions.length > 0) {
                    // Try to extract plugin name from the content
                    const pluginNameMatch = text.match(/(?:plugin|package)\s*[:=]\s*["\']([^"\']+)["\']/i);
                    const pluginName = pluginNameMatch ? pluginNameMatch[1].trim() : null;
                    
                    const version = versions.sort((a, b) => b.length - a.length)[0];
                    console.log(`🔍 Asset inspector found plugin version: ${version} from pattern: ${pattern}`);
                    
                    return {
                        type: pluginName ? 'plugin' : 'plugin',
                        name: pluginName,
                        version: version,
                        source: 'plugin_version_pattern'
                    };
                }
            }
        }
        
        // Then try theme-specific patterns
        const themeSpecificPatterns = [
            /theme_version["\s]*[:=]["\s]*([0-9][0-9a-zA-Z.-]+)/gi,
            /["\']theme_version["\']\s*:\s*["\']([0-9][0-9a-zA-Z.-]+)["\']/gi
        ];
        
        for (const pattern of themeSpecificPatterns) {
            const matches = [...text.matchAll(pattern)];
            if (matches.length > 0) {
                const versions = matches.map(m => m[1]).filter(v => v.length >= 3);
                if (versions.length > 0) {
                    const themeNameMatch = text.match(/(?:theme|package)\s*[:=]\s*["\']([^"\']+)["\']/i);
                    const themeName = themeNameMatch ? themeNameMatch[1].trim() : null;
                    
                    return {
                        type: themeName ? 'theme' : 'theme',
                        name: themeName,
                        version: versions.sort((a, b) => b.length - a.length)[0],
                        source: 'theme_version_pattern'
                    };
                }
            }
        }
        
        // Finally, try more specific patterns (avoid generic ones)
        const specificPatterns = [
            /_version["\s]*[:=]["\s]*([0-9][0-9a-zA-Z.-]+)/gi,
            /["\']version["\']\s*:\s*["\']([0-9][0-9a-zA-Z.-]+)["\']/gi
        ];
        
        for (const pattern of specificPatterns) {
            const matches = [...text.matchAll(pattern)];
            if (matches.length > 0) {
                const versions = matches.map(m => m[1]).filter(v => v.length >= 3);
                if (versions.length > 0) {
                    // Try to extract name from the content
                    const nameMatch = text.match(/(?:plugin|theme|package)\s*[:=]\s*["\']([^"\']+)["\']/i);
                    const name = nameMatch ? nameMatch[1].trim() : null;
                    
                    return {
                        type: name ? 'unknown' : 'unknown',
                        name: name,
                        version: versions.sort((a, b) => b.length - a.length)[0],
                        source: 'specific_version_pattern'
                    };
                }
            }
        }
        
        // Only use generic patterns as a last resort, and only if we have a clear plugin context
        const genericPatterns = [
            /version["\s]*[:=]["\s]*([0-9][0-9a-zA-Z.-]+)/gi,
            /v\s*[:=]\s*["\']([0-9][0-9a-zA-Z.-]+)["\']/gi,
            /["\']ver["\']\s*:\s*["\']([0-9][0-9a-zA-Z.-]+)["\']/gi
        ];
        
        // Only use generic patterns if we have a clear plugin context
        const hasPluginContext = text.includes('plugin') || text.includes('Plugin') || text.includes('PLUGIN');
        
        if (hasPluginContext) {
            for (const pattern of genericPatterns) {
                const matches = [...text.matchAll(pattern)];
                if (matches.length > 0) {
                    const versions = matches.map(m => m[1]).filter(v => v.length >= 3);
                    if (versions.length > 0) {
                        // Try to extract name from the content
                        const nameMatch = text.match(/(?:plugin|theme|package)\s*[:=]\s*["\']([^"\']+)["\']/i);
                        const name = nameMatch ? nameMatch[1].trim() : null;
                        
                        return {
                            type: name ? 'unknown' : 'unknown',
                            name: name,
                            version: versions.sort((a, b) => b.length - a.length)[0],
                            source: 'generic_version_pattern_with_context'
                        };
                    }
                }
            }
        }

        return null;
    }

    /**
     * Resolve relative URL to absolute
     * @param {string} baseUrl - Base asset URL
     * @param {string} relativeUrl - Relative URL
     * @returns {string|null} Absolute URL or null
     */
    resolveRelativeUrl(baseUrl, relativeUrl) {
        try {
            return new URL(relativeUrl, baseUrl).toString();
        } catch (error) {
            return null;
        }
    }

    /**
     * Inspect an asset URL for plugin/theme information
     * @param {string} assetUrl - URL of the asset to inspect
     * @returns {Object|null} Asset inspection result or null
     */
    async inspectAsset(assetUrl) {
        try {
            // First, try to get plugin info from the URL path itself
            const urlInfo = this.extractInfoFromUrl(assetUrl);
            if (urlInfo) {
                return { ...urlInfo, confidence: 'medium', method: 'url_path' };
            }

            // Fetch the head of the file (first 4KB)
            const headChunk = await this.rangeClient.fetchHead(assetUrl, 4096);
            if (headChunk) {
                const headInfo = this.extractPluginInfoFromComments(headChunk);
                if (headInfo) {
                    return { ...headInfo, confidence: 'high', method: 'asset_header' };
                }
            }

            // For JavaScript files, try the tail (minified files often have info at the end)
            if (assetUrl.includes('.js')) {
                const tailChunk = await this.rangeClient.fetchTail(assetUrl, 4096);
                if (tailChunk) {
                    const tailInfo = this.extractPluginInfoFromComments(tailChunk);
                    if (tailInfo) {
                        return { ...tailInfo, confidence: 'high', method: 'asset_tail' };
                    }

                    // Try source map analysis
                    const sourceMapUrl = this.extractSourceMapUrl(tailChunk);
                    if (sourceMapUrl) {
                        const mapInfo = await this.inspectSourceMap(assetUrl, sourceMapUrl);
                        if (mapInfo) {
                            return { ...mapInfo, confidence: 'high', method: 'source_map' };
                        }
                    }
                }
            }

            return null;
        } catch (error) {
            console.warn(`Asset inspection failed for ${assetUrl}:`, error.message);
            return null;
        }
    }

    /**
     * Extract plugin/theme info from asset URL path
     * @param {string} assetUrl - Asset URL
     * @returns {Object|null} Plugin info or null
     */
    extractInfoFromUrl(assetUrl) {
        // Extract from wp-content paths
        const pathMatch = assetUrl.match(/wp-content\/(plugins|themes)\/([a-zA-Z0-9_-]+)/);
        if (pathMatch) {
            return {
                type: pathMatch[1].slice(0, -1), // 'plugin' or 'theme'
                slug: pathMatch[2],
                source: 'url_path'
            };
        }

        // Check for version parameters in URL
        const versionParamMatch = assetUrl.match(/[?&](?:ver|version)=([0-9][0-9a-zA-Z.-]+)/i);
        if (versionParamMatch) {
            return {
                type: 'unknown',
                version: versionParamMatch[1],
                source: 'url_version_param'
            };
        }

        return null;
    }

    /**
     * Inspect source map for additional information
     * @param {string} assetUrl - Original asset URL
     * @param {string} sourceMapUrl - Source map URL (relative or absolute)
     * @returns {Object|null} Source map inspection result or null
     */
    async inspectSourceMap(assetUrl, sourceMapUrl) {
        try {
            const absoluteMapUrl = this.resolveRelativeUrl(assetUrl, sourceMapUrl);
            if (!absoluteMapUrl) return null;

            const mapChunk = await this.rangeClient.fetchHead(absoluteMapUrl, 65535); // 64KB should cover most source maps
            if (!mapChunk) return null;

            const mapText = mapChunk.toString('utf8');
            
            // Try to parse as JSON to get sources
            try {
                const sourceMap = JSON.parse(mapText);
                if (sourceMap.sources && Array.isArray(sourceMap.sources)) {
                    // Look for wp-content paths in sources
                    for (const source of sourceMap.sources) {
                        const pathMatch = source.match(/wp-content\/(plugins|themes)\/([a-zA-Z0-9_-]+)/);
                        if (pathMatch) {
                            return {
                                type: pathMatch[1].slice(0, -1),
                                slug: pathMatch[2],
                                source: 'source_map_sources'
                            };
                        }
                    }
                }
            } catch (jsonError) {
                // Not valid JSON, try regex approach
                const pathMatch = mapText.match(/wp-content\/(plugins|themes)\/([a-zA-Z0-9_-]+)/);
                if (pathMatch) {
                    return {
                        type: pathMatch[1].slice(0, -1),
                        slug: pathMatch[2],
                        source: 'source_map_text'
                    };
                }
            }

            return null;
        } catch (error) {
            console.warn(`Source map inspection failed:`, error.message);
            return null;
        }
    }

    /**
     * Batch inspect multiple assets
     * @param {Array<string>} assetUrls - Array of asset URLs
     * @returns {Array<Object>} Array of inspection results
     */
    async inspectAssets(assetUrls) {
        const results = [];
        
        // Process in batches to avoid overwhelming the server
        const batchSize = 5;
        for (let i = 0; i < assetUrls.length; i += batchSize) {
            const batch = assetUrls.slice(i, i + batchSize);
            const batchPromises = batch.map(url => this.inspectAsset(url));
            const batchResults = await Promise.allSettled(batchPromises);
            
            batchResults.forEach((result, index) => {
                const url = batch[index];
                if (result.status === 'fulfilled' && result.value) {
                    results.push({ url, ...result.value });
                }
            });

            // Small delay between batches
            if (i + batchSize < assetUrls.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    /**
     * Optimized batch inspection with parallel processing and smart timeouts
     * @param {Array<string>} assetUrls - Array of asset URLs
     * @returns {Array<Object>} Array of inspection results
     */
    async inspectAssetsOptimized(assetUrls) {
        const results = [];
        
        // Process all assets in parallel with individual timeouts
        const inspectionPromises = assetUrls.map(async (url) => {
            try {
                // Set a shorter timeout for faster processing
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), 3000); // 3 second timeout
                });
                
                const inspectionPromise = this.inspectAssetOptimized(url);
                
                const result = await Promise.race([inspectionPromise, timeoutPromise]);
                return { url, ...result };
            } catch (error) {
                // Silently fail and continue
                return null;
            }
        });

        const allResults = await Promise.allSettled(inspectionPromises);
        
        allResults.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                results.push(result.value);
            }
        });

        return results;
    }

    /**
     * Optimized asset inspection with faster processing
     * @param {string} assetUrl - URL of the asset to inspect
     * @returns {Object|null} Asset inspection result or null
     */
    async inspectAssetOptimized(assetUrl) {
        try {
            // First, try to get plugin info from the URL path itself (fastest)
            const urlInfo = this.extractInfoFromUrl(assetUrl);
            if (urlInfo && urlInfo.type === 'plugin') {
                return { ...urlInfo, confidence: 'medium', method: 'url_path' };
            }

            // For JavaScript files, try a quick head fetch with smaller chunk
            if (assetUrl.includes('.js')) {
                const headChunk = await this.rangeClient.fetchHeadFast(assetUrl, 2048); // Use faster method
                if (headChunk) {
                    const headInfo = this.extractPluginInfoFromComments(headChunk);
                    if (headInfo) {
                        return { ...headInfo, confidence: 'high', method: 'asset_header' };
                    }
                }
            }

            // For CSS files, try a quick head fetch
            if (assetUrl.includes('.css')) {
                const headChunk = await this.rangeClient.fetchHeadFast(assetUrl, 1024); // Use faster method
                if (headChunk) {
                    const headInfo = this.extractPluginInfoFromComments(headChunk);
                    if (headInfo) {
                        return { ...headInfo, confidence: 'high', method: 'asset_header' };
                    }
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }
}

module.exports = AssetInspector;
