import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageResizePlugin: ToolPlugin = {
  id: 'image-resize',
  name: 'Resize Image',
  category: 'images',
  description: 'Change image dimensions by custom width, height, or scaling percentage with smooth interpolation.',
  icon: 'Maximize',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
  optionsSchema: [
    {
      id: 'scalePercent',
      label: 'Scale by Percentage (%)',
      type: 'number',
      defaultValue: 50,
      min: 5,
      max: 400,
      step: 5,
    },
    {
      id: 'maintainAspect',
      label: 'Maintain Aspect Ratio',
      type: 'boolean',
      defaultValue: true,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { scalePercent?: number; maintainAspect?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file.');
    const scaleFactor = (options.scalePercent || 50) / 100;
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Resizing ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      const targetWidth = Math.max(1, Math.round(img.width * scaleFactor));
      const targetHeight = Math.max(1, Math.round(img.height * scaleFactor));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const format = file.type || 'image/png';
      const resizedBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), format, 0.9));

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      outputs.push({
        name: `${baseName}-resized.png`,
        type: format,
        data: resizedBlob,
        downloadName: `${baseName}-${targetWidth}x${targetHeight}.png`,
        metadata: {
          originalWidth: img.width,
          originalHeight: img.height,
          newWidth: targetWidth,
          newHeight: targetHeight,
        },
      });
    }

    return outputs;
  },
};
