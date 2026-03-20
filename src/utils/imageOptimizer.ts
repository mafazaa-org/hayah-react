/**
 * Client-side image optimization utility.
 *
 * Resizes and compresses images using Canvas before upload,
 * reducing bandwidth and improving upload speed.
 */

export interface ImageOptimizeOptions {
  /** Maximum width in pixels (default: 1920) */
  maxWidth?: number;
  /** Maximum height in pixels (default: 1080) */
  maxHeight?: number;
  /** JPEG/WebP quality 0–1 (default: 0.8) */
  quality?: number;
  /** Output MIME type (default: 'image/webp', fallback 'image/jpeg') */
  outputType?: string;
}

const DEFAULTS: Required<ImageOptimizeOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  outputType: 'image/webp',
};

/**
 * Optimize an image file for upload.
 *
 * @param file    The original image File / Blob
 * @param options Resize & quality settings
 * @returns       A Promise resolving to the optimized Blob
 */
export async function optimizeImage(
  file: File | Blob,
  options: ImageOptimizeOptions = {}
): Promise<Blob> {
  const { maxWidth, maxHeight, quality, outputType } = { ...DEFAULTS, ...options };

  // Load the image into an HTMLImageElement
  const bitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = bitmap;

  // Calculate the scale factor to fit within max dimensions
  let scale = 1;
  if (origW > maxWidth || origH > maxHeight) {
    scale = Math.min(maxWidth / origW, maxHeight / origH);
  }

  const targetW = Math.round(origW * scale);
  const targetH = Math.round(origH * scale);

  // If already small and quality is lossless-ish, return original
  if (scale >= 1 && quality >= 0.95) {
    bitmap.close();
    return file instanceof Blob ? file : new Blob([file]);
  }

  // Draw to an OffscreenCanvas if available, else fall back to regular Canvas
  let blob: Blob;

  if (typeof OffscreenCanvas !== 'undefined') {
    const offscreen = new OffscreenCanvas(targetW, targetH);
    const ctx = offscreen.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    blob = await offscreen.convertToBlob({ type: outputType, quality });
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        outputType,
        quality
      );
    });
  }

  bitmap.close();
  return blob;
}

/**
 * Convenience: optimize for avatar uploads (smaller dimensions).
 */
export function optimizeAvatar(file: File | Blob): Promise<Blob> {
  return optimizeImage(file, { maxWidth: 256, maxHeight: 256, quality: 0.85 });
}
