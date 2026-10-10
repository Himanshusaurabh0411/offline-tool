import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';
import { removeBackground } from '@imgly/background-removal';
import { removeOrReplaceBackground } from './bgRemovalHelper';

export const imageRemoveBgPlugin: ToolPlugin = {
  id: 'image-remove-bg',
  name: 'AI Background Remover & Color Changer',
  category: 'images',
  description: 'Remove background 100% offline or replace with custom colors using in-browser deep learning neural network (ISNet).',
  icon: 'Scissors',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'bgColor',
      label: 'Output Background Color',
      type: 'select',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparent (Cutout PNG)', value: 'transparent' },
        { label: 'Plain White (#FFFFFF)', value: 'white' },
        { label: 'Solid Black (#000000)', value: 'black' },
        { label: 'Light Blue (#CAE8FF - Passport & Visa)', value: 'lightblue' },
        { label: 'Royal Blue (#2563EB - Formal Background)', value: 'blue' },
        { label: 'Classic Red (#DC2626 - ID Cards)', value: 'red' },
        { label: 'Light Grey (#F3F4F6)', value: 'lightgrey' },
      ],
    },
    {
      id: 'tolerance',
      label: 'Edge & Color Sensitivity (15-65)',
      type: 'range',
      defaultValue: 32,
      min: 15,
      max: 65,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { bgColor?: string; tolerance?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file.');
    const tolerance = options.tolerance || 32;
    const bgColor = options.bgColor || 'transparent';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Processing ${file.name}...`);

      const rawBlob = new Blob([file.data as any], { type: file.type });
      let outputBlob: Blob;

      try {
        // 1. Try Deep Learning AI in-browser inference
        context.reportProgress(30, 'Segmenting foreground with AI neural network...');
        const aiCutout = await removeBackground(rawBlob, {
          model: 'isnet_quint8',
          progress: (key: string, current: number, total: number) => {
            if (total > 0) {
              const pct = Math.round((current / total) * 100);
              context.reportProgress(30 + Math.round(pct * 0.5), `AI model processing: ${pct}%`);
            }
          },
          output: {
            format: 'image/png',
            quality: 1.0,
          },
        });

        if (bgColor === 'transparent') {
          outputBlob = aiCutout;
        } else {
          // Composite cutout over chosen solid color
          outputBlob = await compositeOnColor(aiCutout, bgColor);
        }
      } catch (aiErr) {
        console.warn('AI inference fallback triggered:', aiErr);
        // 2. High-accuracy boundary & skin protection fallback
        const img = await createImageBitmap(rawBlob);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        ctx.drawImage(img, 0, 0);
        removeOrReplaceBackground(ctx, canvas.width, canvas.height, {
          tolerance,
          replaceBgColor: bgColor === 'transparent' ? null : bgColor,
          protectSkin: true,
        });

        const isPng = bgColor === 'transparent';
        const mime = isPng ? 'image/png' : 'image/jpeg';
        outputBlob = await new Promise((res) => canvas.toBlob((b) => res(b!), mime, 0.95));
      }

      const isPng = bgColor === 'transparent';
      const ext = isPng ? 'png' : 'jpg';
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-${bgColor === 'transparent' ? 'nobg' : bgColor}.${ext}`,
        type: isPng ? 'image/png' : 'image/jpeg',
        data: outputBlob,
        downloadName: `${baseName}-${bgColor === 'transparent' ? 'transparent' : bgColor}.${ext}`,
      });
    }

    return outputs;
  },
};

/** Helper to composite transparent PNG cutout onto solid background color */
async function compositeOnColor(cutoutBlob: Blob, bgColor: string): Promise<Blob> {
  const img = await createImageBitmap(cutoutBlob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;

  let fill = '#FFFFFF';
  if (bgColor === 'white') fill = '#FFFFFF';
  else if (bgColor === 'black') fill = '#000000';
  else if (bgColor === 'lightblue') fill = '#CAE8FF';
  else if (bgColor === 'blue') fill = '#2563EB';
  else if (bgColor === 'red') fill = '#DC2626';
  else if (bgColor === 'lightgrey') fill = '#F3F4F6';
  else if (bgColor.startsWith('#')) fill = bgColor;

  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  return new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
}
