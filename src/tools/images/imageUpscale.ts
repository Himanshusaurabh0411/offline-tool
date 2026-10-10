import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageUpscalePlugin: ToolPlugin = {
  id: 'image-upscale',
  name: 'Smart Image Upscaler (2x / 4x)',
  category: 'images',
  description: 'Enhance and upscale photos to 2x or 4x resolution using client-side edge-preserving sharpening algorithms.',
  icon: 'Sparkles',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'scale',
      label: 'Upscale Factor',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: '2x Ultra Resolution', value: '2' },
        { label: '4x Maximum Upscale', value: '4' },
      ],
    },
    {
      id: 'sharpen',
      label: 'Apply Edge Sharpening',
      type: 'boolean',
      defaultValue: true,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { scale?: string; sharpen?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file to upscale.');
    const factor = parseInt(options.scale || '2', 10);
    const shouldSharpen = options.sharpen !== false;
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Upscaling ${file.name} (${factor}x)...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      const targetWidth = img.width * factor;
      const targetHeight = img.height * factor;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Edge sharpening convolution filter
      if (shouldSharpen) {
        context.reportProgress(75, 'Applying unsharp mask edge enhancement...');
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const d = imgData.data;
        const copy = new Uint8ClampedArray(d);

        // 3x3 Sharpen Kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
        const w = targetWidth;
        const h = targetHeight;
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const val =
                5 * copy[idx + c] -
                copy[((y - 1) * w + x) * 4 + c] -
                copy[((y + 1) * w + x) * 4 + c] -
                copy[(y * w + (x - 1)) * 4 + c] -
                copy[(y * w + (x + 1)) * 4 + c];
              d[idx + c] = Math.min(255, Math.max(0, val));
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      const upscaledBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-${factor}x-upscaled.png`,
        type: 'image/png',
        data: upscaledBlob,
        downloadName: `${baseName}-${factor}x-upscaled.png`,
        metadata: {
          originalWidth: img.width,
          originalHeight: img.height,
          upscaledWidth: targetWidth,
          upscaledHeight: targetHeight,
        },
      });
    }

    return outputs;
  },
};
