const URL_PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

function getRuntimeBaseUrl() {
	if (typeof document !== 'undefined' && typeof document.baseURI === 'string' && document.baseURI.length > 0) {
		return document.baseURI;
	}

	if (typeof window !== 'undefined' && typeof window.location?.href === 'string' && window.location.href.length > 0) {
		return window.location.href;
	}

	return '/';
}

export function resolveAssetUrl(assetPath, label = 'Flight sim') {
	if (typeof assetPath !== 'string' || assetPath.length === 0) {
		console.warn(`${label} asset path is missing.`, assetPath);
		return getRuntimeBaseUrl();
	}

	if (URL_PROTOCOL_PATTERN.test(assetPath) || assetPath.startsWith('//')) {
		return assetPath;
	}

	if (assetPath.startsWith('/')) {
		return assetPath;
	}

	return new URL(assetPath.replace(/^\/+/, ''), getRuntimeBaseUrl()).toString();
}
