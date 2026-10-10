import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageCompressPlugin: ToolPlugin = {
  id: 'image-compress',
  name: 'Compress Image',
  category: 'images',
  description: 'Reduce image file size dramatically using intelligent canvas quantization and WebP compression.',
  icon: 'Minimize',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'quality',
      label: 'Quality Level (1-100)',
      type: 'range',
      defaultValue: 75,
      min: 10,
      max: 100,
    },
    {
      id: 'scale',
      label: 'Resolution Scale (%)',
      type: 'range',
      defaultValue: 100,
      min: 25,
      max: 100,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { quality?: number; scale?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file to compress.');
    const quality = (options.quality || 75) / 100;
    const scale = (options.scale || 100) / 100;

    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Compressing ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      const targetWidth = Math.max(1, Math.round(img.width * scale));
      const targetHeight = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // WebP provides highest compression efficiency
      const compressedBlob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b!), 'image/webp', quality)
      );

      const originalSize = file.size;
      const newSize = compressedBlob.size;
      const reduction = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      outputs.push({
        name: `${baseName}-compressed.webp`,
        type: 'image/webp',
        data: compressedBlob,
        downloadName: `${baseName}-compressed.webp`,
        metadata: {
          originalSize,
          newSize,
          savings: `${reduction}%`,
        },
      });
    }

    return outputs;
  },
};
