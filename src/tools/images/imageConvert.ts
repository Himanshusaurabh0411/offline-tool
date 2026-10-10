import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageConvertPlugin: ToolPlugin = {
  id: 'image-convert',
  name: 'Convert Image Format',
  category: 'images',
  description: 'Convert between JPG, PNG, WebP, AVIF, GIF, and BMP formats 100% locally.',
  icon: 'RefreshCw',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'svg'],
  optionsSchema: [
    {
      id: 'targetFormat',
      label: 'Target Format',
      type: 'select',
      defaultValue: 'image/webp',
      options: [
        { label: 'WebP (Compact & High Quality)', value: 'image/webp' },
        { label: 'PNG (Lossless & Transparent)', value: 'image/png' },
        { label: 'JPEG (Standard Photo)', value: 'image/jpeg' },
      ],
    },
    {
      id: 'quality',
      label: 'Quality (1-100)',
      type: 'number',
      defaultValue: 90,
      min: 10,
      max: 100,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { targetFormat?: string; quality?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select at least one image file.');
    const targetFormat = options.targetFormat || 'image/webp';
    const quality = (options.quality || 90) / 100;
    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/webp' ? 'webp' : 'png';

    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(
        15 + Math.round((i / files.length) * 80),
        `Converting ${file.name} to ${ext.toUpperCase()}...`
      );

      // Create Image Bitmap
      const blob = new Blob([file.data as any], { type: file.type });
      const imgBitmap = await createImageBitmap(blob);

      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d')!;

      // If converting to JPEG, fill white background for transparent pixels
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(imgBitmap, 0, 0);

      const convertedBlob: Blob = await new Promise((res, rej) => {
        canvas.toBlob(
          (b) => {
            if (b) res(b);
            else rej(new Error('Conversion to blob failed'));
          },
          targetFormat,
          quality
        );
      });

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      outputs.push({
        name: `${baseName}.${ext}`,
        type: targetFormat,
        data: convertedBlob,
        downloadName: `${baseName}.${ext}`,
        metadata: {
          originalFormat: file.type,
          targetFormat,
          width: imgBitmap.width,
          height: imgBitmap.height,
        },
      });
    }

    return outputs;
  },
};
