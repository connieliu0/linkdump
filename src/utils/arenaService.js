// src/utils/arenaService.js - Updated version

const ARENA_API_BASE_URL = 'https://api.are.na/v2';

/**
 * Fetches all blocks from an Are.na channel
 * @param {string} channelSlug - The slug/ID of the channel
 * @returns {Promise<Array>} - Array of blocks from the channel
 */
const fetchChannelBlocks = async (channelSlug) => {
  if (!channelSlug) throw new Error('Channel slug is required');
  
  // Clean the slug - remove any trailing slashes or spaces
  const cleanSlug = channelSlug.trim().replace(/\/$/, '');
  
  try {
    // First fetch the channel to verify it exists
    const channelResponse = await fetch(`${ARENA_API_BASE_URL}/channels/${cleanSlug}`);
    
    if (!channelResponse.ok) {
      if (channelResponse.status === 404) {
        throw new Error('Channel not found. Please check the URL or slug.');
      }
      throw new Error(`Are.na API Error: ${channelResponse.statusText}`);
    }
    
    const channelData = await channelResponse.json();
    console.log('Channel data:', channelData);
    
    // Now fetch the channel contents with pagination
    let allBlocks = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const url = `${ARENA_API_BASE_URL}/channels/${cleanSlug}/contents?page=${page}&per=100`;
      console.log('Fetching page:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching channel contents: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Add this page's blocks to our collection
      if (data.contents && data.contents.length > 0) {
        allBlocks = [...allBlocks, ...data.contents];
      }
      
      // Check if there are more pages to fetch
      page++;
      hasMorePages = data.contents && data.contents.length === 100; 
    }
    
    return allBlocks;
    
  } catch (error) {
    console.error('Error in fetchChannelBlocks:', error);
    throw error;
  }
};

/**
 * Extracts channel slug from an Are.na URL or returns the input if it's already a slug
 * @param {string} input - URL or slug
 * @returns {string} - Extracted slug
 */
const extractChannelSlug = (input) => {
  if (!input) return '';
  
  // Clean the input
  const cleaned = input.trim();
  
  // If it looks like a URL, extract the slug
  if (cleaned.includes('are.na') || cleaned.includes('/')) {
    try {
      // Handle cases where the input might not be a complete URL
      let url;
      if (cleaned.startsWith('http')) {
        url = new URL(cleaned);
      } else {
        url = new URL(`https://${cleaned}`);
      }
      
      // Get the path segments and find the channel slug
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length >= 2 && pathSegments[0] === 'channels') {
        return pathSegments[1]; // Return the slug part
      }
      if (pathSegments.length >= 1) {
        return pathSegments[pathSegments.length - 1]; // Try last segment
      }
    } catch (e) {
      console.log('URL parsing failed, treating as direct slug');
      // Extract last part if there are slashes
      if (cleaned.includes('/')) {
        return cleaned.split('/').filter(Boolean).pop();
      }
    }
  }
  
  // If not a URL or URL parsing failed, assume it's a slug directly
  return cleaned;
};

/**
 * Converts Are.na blocks to the app's internal format
 * @param {Array} blocks - Array of Are.na blocks
 * @returns {Array} - Converted blocks compatible with the app
 */
const convertBlocksToCanvasItems = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return [];
  
  let uniqueId = 1;
  
  return blocks.map(block => {    
    // Ensure we have a valid ID
    const blockId = block?.id || `arena-${uniqueId++}`;
    
    // Common properties for all block types
    const baseItem = {
      id: `arena-${blockId}`,
      position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
      originalData: block,
      metadata: {
        title: block.title || block.generated_title || 'Untitled',
        description: block.description || 'Untitled'
      }
    };
    
    // Validate that we have required content before creating the item
    if (!block) {
      console.warn('Skipping invalid block:', block);
      return null;
    }
    
    // Handle different block types
    let convertedItem;
    switch (block.class) {
      case 'Image':
        const imageUrl = block.image?.display?.url || 
                        block.image?.large?.url || 
                        block.image?.original?.url ||
                        block.attachment?.url;
        if (!imageUrl) {
          console.warn('Skipping image block without URL:', block);
          return null;
        }
        convertedItem = {
          ...baseItem,
          type: 'image',
          content: imageUrl, // This becomes the 'src' prop in ImageCard
          sourceUrl: block.title + block.description // This becomes the 'sourceUrl' prop in ImageCard
        };
        break;
      
      case 'Link':
        const linkUrl = block.source?.url || block.source || block.attachment?.url;
        if (!linkUrl) {
          console.warn('Skipping link block without URL:', block);
          return null;
        }
        convertedItem = {
          ...baseItem,
          type: 'link',
          content: linkUrl
        };
        break;
      
      case 'Text':
      case 'Attachment':
      case 'Media':
        const textContent = block.content || block.title || block.description || 'No content available';
        convertedItem = {
          ...baseItem,
          type: 'newText',
          content: textContent +" -" +block.title
        };
        break;
      
      default:
        const defaultContent = block.title || block.content || block.description || 'No content available';
        convertedItem = {
          ...baseItem,
          type: 'text',
          content: defaultContent
        };
    }
    
    // Final validation of the converted item
    if (!convertedItem?.id || !convertedItem?.content) {
      console.warn('Skipping invalid converted item:', convertedItem);
      return null;
    }
    
    
    return convertedItem;
  }).filter(Boolean); // Remove any null items
};

export { fetchChannelBlocks, convertBlocksToCanvasItems, extractChannelSlug };