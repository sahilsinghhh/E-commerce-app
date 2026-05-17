const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024;

export const getPrimaryImage = (product) => {
  const primary = product?.images?.find((image) => image.isPrimary) || product?.images?.[0];
  return primary?.url || product?.image || 'https://via.placeholder.com/900';
};

export const getProductImages = (product) => {
  if (product?.images?.length) return product.images;
  if (product?.image) {
    return [{ url: product.image, key: product.image, alt: product.name, isPrimary: true }];
  }
  return [];
};

export const readFileSignature = async (file) => {
  const buffer = await file.slice(0, 12).arrayBuffer();
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const validateBrowserImage = async (file) => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WEBP images are allowed.');
  }

  if (file.size > maxFileSize) {
    throw new Error('Each image must be 5MB or smaller.');
  }

  const signature = await readFileSignature(file);
  const checks = {
    'image/jpeg': signature.startsWith('ffd8ff'),
    'image/png': signature.startsWith('89504e470d0a1a0a'),
    'image/webp': signature.startsWith('52494646'),
  };

  if (!checks[file.type]) {
    throw new Error('Image signature does not match its file type.');
  }

  return signature;
};

export const optimizeImage = async (file, maxSize = 1200, quality = 0.86) => {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/webp', quality);
  });

  if (!blob) throw new Error('Failed to optimize image.');

  return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
    type: 'image/webp',
    lastModified: Date.now(),
  });
};
