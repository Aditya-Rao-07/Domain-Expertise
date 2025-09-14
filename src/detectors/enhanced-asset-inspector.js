// File: ./src/detectors/enhanced-asset-inspector.js

const AssetInspector = require('./asset-inspector');

/**
 * EnhancedAssetInspector
 * Extends the base AssetInspector. Currently reuses all capabilities
 * and serves as an extensibility point for future enhancements.
 */
class EnhancedAssetInspector extends AssetInspector {
	constructor(httpClient) {
		super(httpClient);
	}

	/**
	 * Enhanced batch asset inspection placeholder to maintain compatibility
	 * Falls back to base implementation for now.
	 */
	async inspectAssetsEnhanced(assetUrls) {
		if (super.inspectAssetsOptimized) {
			return await super.inspectAssetsOptimized(assetUrls);
		}
		return await super.inspectAssets(assetUrls);
	}
}

module.exports = EnhancedAssetInspector;
