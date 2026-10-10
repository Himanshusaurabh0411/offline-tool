import { AutoModel, AutoProcessor, RawImage, env, pipeline } from '@huggingface/transformers';
import { removeOrReplaceBackground } from '../../tools/images/bgRemovalHelper';

// Configure transformers environment for browser execution
env.allowLocalModels = false;
env.useBrowserCache = typeof globalThis !== 'undefined' && 'caches' in globalThis;

// Cache loaded model & processor instances
let rmbgModel: any = null;
let rmbgProcessor: any = null;
let modelLoadingPromise: Promise<void> | null = null;

let modnetPipeline: any = null;

export interface RemovalProgressCallback {
  (stage: 'downloading' | 'processing' | 'finishing', percent: number, detail?: string): void;
}

/**
 * Initializes the state-of-the-art RMBG-1.4 AI model (Bria AI)
 */
async function loadRmbgModel(onProgress?: RemovalProgressCallback): Promise<{ model: any; processor: any }> {
  if (rmbgModel && rmbgProcessor) {
    return { model: rmbgModel, processor: rmbgProcessor };
  }

  if (!modelLoadingPromise) {
    modelLoadingPromise = (async () => {
      const progressTracker = (item: any) => {
        if (!onProgress) return;
        if (item.status === 'progress' && item.total) {
          const pct = Math.round((item.loaded / item.total) * 100);
          const fname = item.file ? item.file.split('/').pop() : 'model weights';
          onProgress('downloading', Math.min(85, Math.max(10, pct)), `Downloading ${fname} (${pct}%)...`);
        } else if (item.status === 'initiate') {
          onProgress('downloading', 10, 'Connecting to AI model repository...');
        }
      };

      const [model, processor] = await Promise.all([
        AutoModel.from_pretrained('briaai/RMBG-1.4', { progress_callback: progressTracker }),
        AutoProcessor.from_pretrained('briaai/RMBG-1.4', { progress_callback: progressTracker }),
      ]);

      rmbgModel = model;
      rmbgProcessor = processor;
    })();
  }

  await modelLoadingPromise;
  return { model: rmbgModel, processor: rmbgProcessor };
}

/**
 * Fallback to Xenova/modnet pipeline if RMBG-1.4 fails or on constrained devices
 */
async function loadModnetPipeline(onProgress?: RemovalProgressCallback): Promise<any> {
  if (modnetPipeline) return modnetPipeline;

  modnetPipeline = await pipeline('image-segmentation', 'Xenova/modnet', {
    progress_callback: (item: any) => {
      if (!onProgress) return;
      if (item.status === 'progress' && item.total) {
        const pct = Math.round((item.loaded / item.total) * 100);
        onProgress('downloading', Math.min(85, Math.max(10, pct)), `Downloading MODNet (${pct}%)...`);
      }
    },
  });
  return modnetPipeline;
}

/**
 * Executes AI background removal on an image blob with high precision.
 * 1. Tries Bria AI RMBG-1.4 (1024x1024 studio precision for humans & objects)
 * 2. Falls back to Xenova/modnet (portrait matting)
 * 3. Falls back to offline perceptual boundary matting (zero network)
 */
export async function removeImageBackground(
  imageBlob: Blob,
  onProgress?: RemovalProgressCallback
): Promise<{ blob: Blob; engine: 'rmbg' | 'modnet' | 'fallback' }> {
  try {
    const [rawImg, imgBitmap] = await Promise.all([
      RawImage.fromBlob(imageBlob),
      createImageBitmap(imageBlob),
    ]);

    const origW = imgBitmap.width;
    const origH = imgBitmap.height;

    // ── Attempt 1: State-of-the-art RMBG-1.4 ──────────────────────────────────
    try {
      if (onProgress) onProgress('downloading', 10, 'Initializing RMBG-1.4 neural network...');
      const { model, processor } = await loadRmbgModel(onProgress);

      if (onProgress) onProgress('processing', 88, 'Executing deep neural matting at 1024×1024...');
      const { pixel_values } = await processor(rawImg);
      const { output } = await model({ input: pixel_values });

      if (onProgress) onProgress('finishing', 95, 'Refining alpha matte and preserving original RGB colors...');

      const maskFloatData = output.data;
      const maskUint8 = new Uint8ClampedArray(1024 * 1024);
      for (let i = 0; i < maskFloatData.length; i++) {
        maskUint8[i] = Math.round(Math.max(0, Math.min(1, maskFloatData[i])) * 255);
      }

      // 1024x1024 canvas for model output
      const modelCanvas = document.createElement('canvas');
      modelCanvas.width = 1024;
      modelCanvas.height = 1024;
      const mCtx = modelCanvas.getContext('2d');
      const mImgData = mCtx && mCtx.createImageData
        ? mCtx.createImageData(1024, 1024)
        : (typeof ImageData !== 'undefined'
            ? new ImageData(1024, 1024)
            : ({ data: new Uint8ClampedArray(1024 * 1024 * 4) } as any));
      const mData = mImgData.data;

      for (let i = 0; i < maskUint8.length; i++) {
        const val = maskUint8[i];
        const p = i * 4;
        mData[p] = val;
        mData[p + 1] = val;
        mData[p + 2] = val;
        mData[p + 3] = 255;
      }
      if (mCtx) {
        mCtx.putImageData(mImgData, 0, 0);
      }

      // Resample mask to original dimensions
      const resampledMask = resampleMaskToSize(modelCanvas, origW, origH);

      // Apply alpha mask to original image
      const transparentBlob = applyMaskToOriginal(imgBitmap, resampledMask, origW, origH);
      if (onProgress) onProgress('finishing', 100, 'Complete (RMBG-1.4)');

      return { blob: await transparentBlob, engine: 'rmbg' };
    } catch (rmbgErr) {
      console.warn('RMBG-1.4 inference error, attempting MODNet fallback:', rmbgErr);
    }

    // ── Attempt 2: Xenova/modnet fallback ─────────────────────────────────────
    try {
      if (onProgress) onProgress('downloading', 20, 'Loading MODNet neural network...');
      const segmenter = await loadModnetPipeline(onProgress);

      if (onProgress) onProgress('processing', 90, 'Executing MODNet portrait matting...');
      const result = await segmenter(rawImg);
      const mask = result[0]?.mask;
      if (!mask) throw new Error('MODNet empty mask');

      let rawMaskCanvas: HTMLCanvasElement;
      try {
        rawMaskCanvas = mask.toCanvas ? mask.toCanvas() : createMaskCanvasFromRaw(mask);
      } catch {
        rawMaskCanvas = createMaskCanvasFromRaw(mask);
      }
      const resampledMask = resampleMaskToSize(rawMaskCanvas, origW, origH);
      const transparentBlob = applyMaskToOriginal(imgBitmap, resampledMask, origW, origH);

      if (onProgress) onProgress('finishing', 100, 'Complete (MODNet)');
      return { blob: await transparentBlob, engine: 'modnet' };
    } catch (modnetErr) {
      console.warn('MODNet inference error, falling back to perceptual boundary matting:', modnetErr);
    }

    // ── Attempt 3: High-accuracy offline boundary matting fallback ────────────
    if (onProgress) onProgress('processing', 60, 'Applying offline perceptual matting fallback...');
    const fallbackBlob = await runBoundaryFallback(imageBlob);
    if (onProgress) onProgress('finishing', 100, 'Complete (perceptual boundary fallback)');
    return { blob: fallbackBlob, engine: 'fallback' };

  } catch (err: any) {
    console.error('removeImageBackground unexpected error:', err);
    const fallbackBlob = await runBoundaryFallback(imageBlob);
    return { blob: fallbackBlob, engine: 'fallback' };
  }
}

/** Resamples a canvas mask to target dimensions with high-quality smoothing */
function resampleMaskToSize(sourceCanvas: HTMLCanvasElement, targetW: number, targetH: number): Uint8ClampedArray {
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = targetW;
  maskCanvas.height = targetH;
  const maskCtx = maskCanvas.getContext('2d')!;
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = 'high';
  maskCtx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
  return maskCtx.getImageData(0, 0, targetW, targetH).data;
}

/** Blends resampled mask alpha into original image while preserving 100% RGB fidelity */
function applyMaskToOriginal(
  imgSource: CanvasImageSource,
  resampledMaskData: Uint8ClampedArray,
  width: number,
  height: number
): Promise<Blob> {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outCtx = outputCanvas.getContext('2d')!;
  outCtx.drawImage(imgSource, 0, 0);

  const outImgData = outCtx.getImageData(0, 0, width, height);
  const outData = outImgData.data;

  for (let i = 0; i < outData.length; i += 4) {
    const maskVal = resampledMaskData[i]; // red channel represents intensity 0-255
    // Blend with existing alpha channel to support transparent source PNGs
    outData[i + 3] = Math.round((outData[i + 3] / 255) * maskVal);
  }
  outCtx.putImageData(outImgData, 0, 0);

  return new Promise((res, rej) => {
    outputCanvas.toBlob((b) => (b ? res(b) : rej(new Error('Export failed'))), 'image/png');
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
