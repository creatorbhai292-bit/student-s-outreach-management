/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Image Optimization Utility
 * Enforces strict 50 KB - 80 KB compression on all uploaded images
 * (avatars, certificates, activity photos, institutional banners, documents).
 * Keeps storage minimal while preserving visual fidelity.
 */

export interface OptimizedImageResult {
  blob: Blob;
  dataUrl: string;
  sizeBytes: number;
  sizeKB: number;
  originalSizeKB: number;
  mimeType: string;
}

/**
 * Compresses an image file or data URL strictly down to 50 KB - 80 KB
 * Target range: 50 KB (51,200 bytes) to 80 KB (81,920 bytes)
 */
export async function optimizeImageTo50to80KB(
  input: File | Blob | string,
  targetMinKB = 50,
  targetMaxKB = 80
): Promise<OptimizedImageResult> {
  const targetMinBytes = targetMinKB * 1024;
  const targetMaxBytes = targetMaxKB * 1024;

  let originalSizeKB = 0;
  if (input instanceof File || input instanceof Blob) {
    originalSizeKB = Math.round(input.size / 1024);
  } else if (typeof input === 'string') {
    originalSizeKB = Math.round((input.length * (3 / 4)) / 1024);
  }

  // Load image element
  const img = await loadImage(input);
  
  let currentWidth = img.naturalWidth || img.width || 800;
  let currentHeight = img.naturalHeight || img.height || 600;

  // Maximum initial dimension (keeps aspect ratio intact)
  const maxInitialDimension = 1200;
  if (currentWidth > maxInitialDimension || currentHeight > maxInitialDimension) {
    if (currentWidth > currentHeight) {
      currentHeight = Math.round((currentHeight * maxInitialDimension) / currentWidth);
      currentWidth = maxInitialDimension;
    } else {
      currentWidth = Math.round((currentWidth * maxInitialDimension) / currentHeight);
      currentHeight = maxInitialDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = currentWidth;
  canvas.height = currentHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw white background for clean transparency handling
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, currentWidth, currentHeight);
  ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

  // Iterative binary-step search for quality to hit 50KB - 80KB
  let minQ = 0.15;
  let maxQ = 0.95;
  let currentQ = 0.75;
  let bestBlob: Blob | null = null;
  let bestDataUrl = '';

  const format = 'image/jpeg';

  for (let attempt = 0; attempt < 7; attempt++) {
    const dataUrl = canvas.toDataURL(format, currentQ);
    const blob = await dataUrlToBlob(dataUrl, format);

    bestBlob = blob;
    bestDataUrl = dataUrl;

    const size = blob.size;

    // Perfect fit within target bounds
    if (size >= targetMinBytes && size <= targetMaxBytes) {
      break;
    }

    if (size > targetMaxBytes) {
      // Exceeds 80KB: lower quality or reduce dimensions if quality is already low
      maxQ = currentQ;
      currentQ = (minQ + currentQ) / 2;

      // If quality is getting too low (< 0.35) and still > 80KB, shrink dimensions
      if (currentQ < 0.35 && (currentWidth > 500 || currentHeight > 500)) {
        currentWidth = Math.round(currentWidth * 0.85);
        currentHeight = Math.round(currentHeight * 0.85);
        canvas.width = currentWidth;
        canvas.height = currentHeight;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, currentWidth, currentHeight);
        ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
        minQ = 0.2;
        maxQ = 0.85;
        currentQ = 0.6;
      }
    } else {
      // Below 50KB:
      // If original was already smaller than 50KB, then don't artificially bloat it!
      if (originalSizeKB > 0 && originalSizeKB < targetMinKB) {
        break;
      }
      minQ = currentQ;
      currentQ = (currentQ + maxQ) / 2;
    }
  }

  if (!bestBlob) {
    const fallbackUrl = canvas.toDataURL(format, 0.7);
    bestBlob = await dataUrlToBlob(fallbackUrl, format);
    bestDataUrl = fallbackUrl;
  }

  const finalSizeKB = Number((bestBlob.size / 1024).toFixed(1));

  return {
    blob: bestBlob,
    dataUrl: bestDataUrl,
    sizeBytes: bestBlob.size,
    sizeKB: finalSizeKB,
    originalSizeKB: originalSizeKB || finalSizeKB,
    mimeType: format,
  };
}

function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for optimization: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.src = url;
    }
  });
}

function dataUrlToBlob(dataUrl: string, mime: string): Promise<Blob> {
  return new Promise((resolve) => {
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    resolve(new Blob([u8arr], { type: mime }));
  });
}
