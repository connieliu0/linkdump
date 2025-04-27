export const isValidUrl = (text) => {
  return text.startsWith('http://') || text.startsWith('https://');
};

export const extractSourceFromHtml = (html) => {
  if (!html) return null;
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const img = tempDiv.querySelector('img');
    if (img) return img.src || img.getAttribute('data-source');
    
    const link = tempDiv.querySelector('a');
    if (link) return link.href;
    
    return null;
  } catch (error) {
    console.error('Error extracting source from HTML:', error);
    return null;
  }
};

export const detectImageSource = async (clipboardData) => {
  const plainText = clipboardData.getData('text/plain');
  const htmlText = clipboardData.getData('text/html');
  
  const isValidUrl = plainText && (plainText.startsWith('http://') || plainText.startsWith('https://'));
  
  const source = 
    (isValidUrl ? plainText : null) || 
    extractSourceFromHtml(htmlText) ||  
    ''; 
    
  if (source.includes('localhost') || source.includes('127.0.0.1')) {
    return '';
  }
  
  return source;
}; 