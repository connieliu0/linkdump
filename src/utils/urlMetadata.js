/**
 * Extracts metadata from a URL including title and image source
 * @param {string} url - The URL to process
 * @returns {Promise<{title: string, imageUrl: string, sourceUrl: string}>}
 */
export async function extractMetadata(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Get page title
    const title = doc.querySelector('title')?.textContent || url;

    // Get main image if available
    const ogImage = doc.querySelector('meta[property="og:image"]')?.content;
    const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.content;
    const firstImage = doc.querySelector('img')?.src;
    
    const imageUrl = ogImage || twitterImage || firstImage || null;

    return {
      title,
      imageUrl,
      sourceUrl: url
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: url,
      imageUrl: null,
      sourceUrl: url
    };
  }
}

/**
 * Fetches metadata including title, description, and favicon
 * @param {string} url
 * @returns {Promise<{title: string, description: string|null, favicon: string|null, sourceUrl: string}>}
 */
export async function fetchMetadata(url) {
  try {
    // For localhost URLs, return basic metadata without fetching
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return {
        title: 'Local Development',
        description: 'Local development environment',
        favicon: null,
        sourceUrl: url
      };
    }

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    const title = doc.querySelector('title')?.textContent || 
                 doc.querySelector('meta[property="og:title"]')?.content ||
                 new URL(url).hostname;
                 
    const description = doc.querySelector('meta[name="description"]')?.content ||
                       doc.querySelector('meta[property="og:description"]')?.content;
                       
    const favicon = doc.querySelector('link[rel="icon"]')?.href ||
                   doc.querySelector('link[rel="shortcut icon"]')?.href ||
                   `${new URL(url).origin}/favicon.ico`;

    return { title, description, favicon, sourceUrl: url };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      title: new URL(url).hostname,
      description: null,
      favicon: null,
      sourceUrl: url
    };
  }
}

export function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function getBaseDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}
