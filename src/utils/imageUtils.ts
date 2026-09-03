/**
 * Utility functions for client-side image compression, conversion and camera helpers.
 */

export interface ProcessedImage {
  id: string;
  dataUrl: string;
  fileName: string;
  fileSizeKb: number;
  timestamp: string;
}

/**
 * Compresses and scales an image File or Blob to a maximum dimension and quality,
 * returning a lightweight Base64 JPEG data URL.
 */
export async function compressImageFile(
  file: File | Blob,
  maxDimension = 1280,
  quality = 0.82
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const name = (file as File).name || `photo_${Date.now()}.jpg`;
        const approxSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          id: `img-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          dataUrl,
          fileName: name,
          fileSizeKb: approxSizeKb,
          timestamp: new Date().toISOString(),
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for processing'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}
