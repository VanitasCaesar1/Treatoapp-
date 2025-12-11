/*
 * Image Optimization Utilities
 *
 * Users will upload 10MB photos from their phone.
 * Your server doesn't need that. Your bandwidth bill
 * definitely doesn't need that.
 *
 * These utilities compress and resize images before upload,
 * saving bandwidth and storage costs.
 */

export interface ImageCompressionOptions {
  /* Maximum width in pixels. Height scales proportionally. */
  maxWidth?: number;
  /* Maximum height in pixels. Width scales proportionally. */
  maxHeight?: number;
  /* JPEG quality (0-1). Lower = smaller file, worse quality. */
  quality?: number;
  /* Output format. 'jpeg' is smaller, 'png' keeps transparency. */
  format?: 'jpeg' | 'png' | 'webp';
  /* Maximum file size in bytes. Will reduce quality to meet this. */
  maxSizeBytes?: number;
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  format: 'jpeg',
  maxSizeBytes: 1024 * 1024, // 1MB
};

/*
 * compressImage - Compress and resize an image
 *
 * Takes a File or Blob and returns a compressed Blob.
 * Maintains aspect ratio when resizing.
 *
 * Example:
 *   const file = event.target.files[0];
 *   const compressed = await compressImage(file, { maxWidth: 800 });
 *   // compressed is typically 80-90% smaller
 */
export async function compressImage(
  file: File | Blob,
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      /*
       * Calculate new dimensions maintaining aspect ratio.
       * We scale down to fit within maxWidth x maxHeight box.
       */
      let { width, height } = img;

      if (width > opts.maxWidth) {
        height = (height * opts.maxWidth) / width;
        width = opts.maxWidth;
      }

      if (height > opts.maxHeight) {
        width = (width * opts.maxHeight) / height;
        height = opts.maxHeight;
      }

      /* Round to avoid subpixel rendering issues */
      width = Math.round(width);
      height = Math.round(height);

      canvas.width = width;
      canvas.height = height;

      /*
       * Use better quality scaling algorithm.
       * imageSmoothingQuality is not supported everywhere,
       * but it helps when available.
       */
      ctx.imageSmoothingEnabled = true;
      (ctx as any).imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, width, height);

      /*
       * Convert to blob with specified format and quality.
       * If maxSizeBytes is set, we may need to reduce quality.
       */
      const mimeType = `image/${opts.format}`;

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          /*
           * If blob is still too large, reduce quality iteratively.
           * This is a simple approach - could be optimized with binary search.
           */
          if (opts.maxSizeBytes && blob.size > opts.maxSizeBytes) {
            const reduced = await reduceQualityUntilSize(
              canvas,
              mimeType,
              opts.maxSizeBytes,
              opts.quality
            );
            resolve(reduced);
          } else {
            resolve(blob);
          }
        },
        mimeType,
        opts.quality
      );

      /* Clean up object URL */
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    /* Load image from file */
    img.src = URL.createObjectURL(file);
  });
}

/*
 * reduceQualityUntilSize - Iteratively reduce quality to meet size limit
 */
async function reduceQualityUntilSize(
  canvas: HTMLCanvasElement,
  mimeType: string,
  maxSize: number,
  startQuality: number
): Promise<Blob> {
  let quality = startQuality;
  const minQuality = 0.1;
  const step = 0.1;

  while (quality > minQuality) {
    const blob = await canvasToBlob(canvas, mimeType, quality);
    if (blob.size <= maxSize) {
      return blob;
    }
    quality -= step;
  }

  /* Return lowest quality if still too large */
  return canvasToBlob(canvas, mimeType, minQuality);
}

/*
 * canvasToBlob - Promise wrapper for canvas.toBlob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      mimeType,
      quality
    );
  });
}

/*
 * getImageDimensions - Get dimensions of an image file
 *
 * Useful for validation before upload.
 */
export async function getImageDimensions(
  file: File | Blob
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/*
 * isValidImageType - Check if file is a valid image type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/*
 * formatFileSize - Format bytes as human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/*
 * createThumbnail - Create a small thumbnail for preview
 *
 * Useful for showing previews before upload completes.
 */
export async function createThumbnail(
  file: File | Blob,
  size: number = 150
): Promise<string> {
  const blob = await compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.6,
    format: 'jpeg',
  });

  return URL.createObjectURL(blob);
}

/*
 * ImageUploadResult - Result of image preparation
 */
export interface ImageUploadResult {
  /* Compressed image blob */
  blob: Blob;
  /* Original filename */
  filename: string;
  /* Original size in bytes */
  originalSize: number;
  /* Compressed size in bytes */
  compressedSize: number;
  /* Compression ratio (0-1, lower is better) */
  compressionRatio: number;
  /* Final dimensions */
  width: number;
  height: number;
}

/*
 * prepareImageForUpload - Complete image preparation pipeline
 *
 * Validates, compresses, and returns metadata.
 * Use this as the main entry point for image uploads.
 *
 * Example:
 *   const result = await prepareImageForUpload(file);
 *   console.log(`Reduced from ${result.originalSize} to ${result.compressedSize}`);
 *   await uploadToServer(result.blob, result.filename);
 */
export async function prepareImageForUpload(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<ImageUploadResult> {
  /* Validate file type */
  if (!isValidImageType(file)) {
    throw new Error('Invalid image type. Allowed: JPEG, PNG, GIF, WebP');
  }

  /* Get original dimensions */
  const originalDimensions = await getImageDimensions(file);

  /* Compress image */
  const blob = await compressImage(file, options);

  /* Get final dimensions */
  const finalDimensions = await getImageDimensions(blob);

  return {
    blob,
    filename: file.name,
    originalSize: file.size,
    compressedSize: blob.size,
    compressionRatio: blob.size / file.size,
    width: finalDimensions.width,
    height: finalDimensions.height,
  };
}
