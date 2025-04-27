export const MAX_WIDTH = 300; // Maximum width for images
export const COMPRESSION_QUALITY = 0.7; // 0 = max compression, 1 = max quality

export const processImage = (originalDataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_WIDTH) {
        const ratio = MAX_WIDTH / width;
        width = MAX_WIDTH;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const resizedDataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
      resolve(resizedDataUrl);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = originalDataUrl;
  });
};

export const handleImageFile = async (file, onSuccess, onError) => {
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const resizedDataUrl = await processImage(reader.result);
        onSuccess(resizedDataUrl);
      } catch (err) {
        onError('Failed to process image file.');
      }
    };
    reader.onerror = () => {
      onError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  } else if (file) {
    onError('Please select a valid image file.');
  }
};

export const extractImageFromClipboard = (clipboardData) => {
  return [...clipboardData.items].find(
    item => item.type.indexOf('image') !== -1
  );
}; 