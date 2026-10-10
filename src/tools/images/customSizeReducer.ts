import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const customSizeReducerPlugin: ToolPlugin = {
  id: 'custom-size-reducer',
  name: 'Custom Target Size Reducer',
  category: 'images',
  description: 'Compress any image to an exact target file size (e.g. Under 50 KB for government forms, Under 100 KB, or Under 200 KB) with precision binary search.',
  icon: 'Gauge',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'targetKb',
      label: 'Target File Size Limit (KB)',
      type: 'select',
      defaultValue: '50',
      options: [
        { label: 'Under 20 KB (Strict Govt / Signature Portals)', value: '20' },
        { label: 'Under 50 KB (SSC, UPSC, State Board Forms)', value: '50' },
        { label: 'Under 100 KB (Bank Exams, Passport Portals)', value: '100' },
        { label: 'Under 200 KB (General Job & University Portals)', value: '200' },
        { label: 'Under 500 KB (Email & Fast Web Delivery)', value: '500' },
        { label: 'Under 1024 KB (1 MB High-Res Limit)', value: '1024' },
      ],
    },
    {
      id: 'format',
      label: 'Output Image Format',
      type: 'select',
      defaultValue: 'image/jpeg',
      options: [
        { label: 'JPEG (Best compatibility for all online forms)', value: 'image/jpeg' },
        { label: 'WebP (Maximum quality at smallest size)', value: 'image/webp' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { targetKb?: string; format?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file to reduce.');

    const targetBytes = (parseInt(options.targetKb || '50', 10)) * 1024;
    const outputFormat = options.format || 'image/jpeg';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Operation cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Targeting <= ${options.targetKb || 50} KB for ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      let currentWidth = img.width;
      let currentHeight = img.height;
      let quality = 0.9;
      let resultBlob: Blob | null = null;

      // Iterative binary-step search to match target size
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        attempts++;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(50, Math.round(currentWidth));
        canvas.height = Math.max(50, Math.round(currentHeight));
        const ctx = canvas.getContext('2d')!;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill white backing if converting transparent PNG to JPEG
        if (outputFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resultBlob = await new Promise<Blob>((res) =>
          canvas.toBlob((b) => res(b!), outputFormat, quality)
        );

        // Check if within target
        if (resultBlob.size <= targetBytes) {
          // If close enough or low quality, stop
          if (resultBlob.size >= targetBytes * 0.7 || attempts >= 6) {
            break;
          }
        }

        // Adjust parameters
        if (resultBlob.size > targetBytes) {
          if (quality > 0.4) {
            quality -= 0.15;
          } else {
            // Scale resolution down if quality is already low
            currentWidth *= 0.85;
            currentHeight *= 0.85;
          }
        } else {
          // Size is smaller than 70% of target, can increase quality
          quality = Math.min(0.95, quality + 0.05);
        }
      }

      if (!resultBlob) {
        resultBlob = blob;
      }

      const finalKb = (resultBlob.size / 1024).toFixed(1);
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';

      outputs.push({
        name: `${baseName}-under-${options.targetKb || 50}kb.${ext}`,
        type: outputFormat,
        data: resultBlob,
        downloadName: `${baseName}-${finalKb}kb.${ext}`,
        metadata: {
          originalSize: `${(file.size / 1024).toFixed(1)} KB`,
          finalSize: `${finalKb} KB`,
          targetLimit: `${options.targetKb || 50} KB`,
          status: resultBlob.size <= targetBytes ? 'Goal Met ✅' : 'Compressed',
        },
      });
    }

    return outputs;
  },
};
