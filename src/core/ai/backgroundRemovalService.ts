import { pipeline, env, RawImage } from '@huggingface/transformers';
import { removeOrReplaceBackground } from '../../tools/images/bgRemovalHelper';

// Configure transformers environment for optimal browser performance
env.allowLocalModels = false;
env.useBrowserCache = typeof globalThis !== 'undefined' && 'caches' in globalThis;

// Singleton pipeline instance to avoid duplicate model loads
let segmenterPipeline: any = null;
let pipelineLoadingPromise: Promise<any> | null = null;

export interface RemovalProgressCallback {
  (stage: 'downloading' | 'processing' | 'finishing', percent: number, detail?: string): void;
}

/**
 * Initializes or reuses the background-removal pipeline (Xenova/modnet)
 */
export async function getSegmenterPipeline(onProgress?: RemovalProgressCallback): Promise<any> {
  if (segmenterPipeline) {
    return segmenterPipeline;
  }

  if (pipelineLoadingPromise) {
    return pipelineLoadingPromise;
  }

  pipelineLoadingPromise = (async () => {
    try {
      const p = await pipeline('image-segmentation', 'Xenova/modnet', {
        progress_callback: (info: any) => {
          if (!onProgress) return;
          if (info.status === 'progress' && info.total) {
            const pct = Math.round((info.loaded / info.total) * 100);
            const file = info.file ? info.file.split('/').pop() : 'model weights';
            onProgress('downloading', Math.min(85, Math.max(5, pct)), `Downloading ${file} (${pct}%)...`);
          } else if (info.status === 'initiate') {
            onProgress('downloading', 10, 'Initializing model download...');
          } else if (info.status === 'ready') {
            onProgress('processing', 90, 'Model ready for inference.');
          }
        },
      });
      segmenterPipeline = p;
      return p;
    } finally {
      pipelineLoadingPromise = null;
    }
  })();

  return pipelineLoadingPromise;
}

/**
 * Executes AI background removal on an image blob using Xenova/modnet.
 * Automatically falls back to high-accuracy perceptual matting if offline/failed.
 */
export async function removeImageBackground(
  imageBlob: Blob,
  onProgress?: RemovalProgressCallback
): Promise<{ blob: Blob; engine: 'ai' | 'fallback' }> {
  try {
    if (onProgress) onProgress('downloading', 5, 'Preparing neural network pipeline...');

    const segmenter = await getSegmenterPipeline(onProgress);

    if (onProgress) onProgress('processing', 90, 'Executing neural matting inference...');

    // Load original image into RawImage and HTMLImageElement for exact dimensions
    const blobUrl = URL.createObjectURL(imageBlob);
    try {
      const [rawImg, htmlImg] = await Promise.all([
        RawImage.fromBlob(imageBlob),
        loadImage(blobUrl),
      ]);

      const origW = htmlImg.naturalWidth || htmlImg.width;
      const origH = htmlImg.naturalHeight || htmlImg.height;

      // Run inference
      const result = await segmenter(rawImg);
      const mask = result[0]?.mask;
      if (!mask) {
        throw new Error('Neural network returned empty segmentation mask');
      }

      if (onProgress) onProgress('finishing', 95, 'Refining alpha matte and preserving RGB detail...');

      // Convert mask to canvas and resample to original dimensions
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = origW;
      maskCanvas.height = origH;
      const maskCtx = maskCanvas.getContext('2d')!;
      maskCtx.imageSmoothingEnabled = true;
      maskCtx.imageSmoothingQuality = 'high';

      // Draw mask output onto resampled canvas
      const rawMaskCanvas = mask.toCanvas ? mask.toCanvas() : createMaskCanvasFromRaw(mask);
      maskCtx.drawImage(rawMaskCanvas, 0, 0, origW, origH);
      const maskData = maskCtx.getImageData(0, 0, origW, origH).data;

      // Draw original image to output canvas
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = origW;
      outputCanvas.height = origH;
      const outCtx = outputCanvas.getContext('2d')!;
      outCtx.drawImage(htmlImg, 0, 0);
      const outImgData = outCtx.getImageData(0, 0, origW, origH);
      const outData = outImgData.data;

      // Apply alpha channel from mask to original image, preserving 100% RGB fidelity
      for (let i = 0; i < outData.length; i += 4) {
        // mask is grayscale: maskData[i] is alpha intensity (0 to 255)
        const alpha = maskData[i];
        outData[i + 3] = Math.round((outData[i + 3] / 255) * alpha);
      }
      outCtx.putImageData(outImgData, 0, 0);

      const transparentBlob: Blob = await new Promise((res, rej) => {
        outputCanvas.toBlob((b) => (b ? res(b) : rej(new Error('Canvas export failed'))), 'image/png');
      });

      if (onProgress) onProgress('finishing', 100, 'Complete');
      return { blob: transparentBlob, engine: 'ai' };
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (err: any) {
    console.warn('AI neural network inference failed or offline, triggering perceptual matting fallback:', err);
    if (onProgress) onProgress('processing', 60, 'Applying offline perceptual matting fallback...');

    const fallbackBlob = await runBoundaryFallback(imageBlob);
    if (onProgress) onProgress('finishing', 100, 'Complete (perceptual boundary fallback)');
    return { blob: fallbackBlob, engine: 'fallback' };
  }
}

/** Helper to load an HTMLImageElement from a URL */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image from blob URL'));
    img.src = url;
  });
}

/** Fallback helper if mask.toCanvas() is unavailable */
function createMaskCanvasFromRaw(mask: any): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = mask.width;
  canvas.height = mask.height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(mask.width, mask.height);
  const data = imgData.data;
  const maskRaw = mask.data;

  for (let i = 0; i < maskRaw.length; i++) {
    const val = maskRaw[i];
    const p = i * 4;
    data[p] = val;
    data[p + 1] = val;
    data[p + 2] = val;
    data[p + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/** Local boundary matting with skin tone protection */
async function runBoundaryFallback(blob: Blob): Promise<Blob> {
  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  ctx.drawImage(img, 0, 0);
  removeOrReplaceBackground(ctx, canvas.width, canvas.height, {
    tolerance: 32,
    replaceBgColor: 'transparent',
    protectSkin: true,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to generate fallback blob'));
    }, 'image/png');
  });
}

/** Composites transparent cutout PNG onto a solid background color */
export async function compositeCutoutOnColor(cutoutBlob: Blob, bgColor: string): Promise<Blob> {
  if (bgColor === 'transparent') {
    return cutoutBlob;
  }

  const img = await createImageBitmap(cutoutBlob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;

  let fill = '#FFFFFF';
  if (bgColor === 'white') fill = '#FFFFFF';
  else if (bgColor === 'black') fill = '#000000';
  else if (bgColor === 'lightgrey') fill = '#F3F4F6';
  else if (bgColor === 'lightblue') fill = '#CAE8FF';
  else if (bgColor === 'blue') fill = '#2563EB';
  else if (bgColor === 'red') fill = '#DC2626';
  else if (bgColor.startsWith('#')) fill = bgColor;

  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  return new Promise((res, rej) => {
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('Failed to composite image'))), 'image/png');
  });
}
