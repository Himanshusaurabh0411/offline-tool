import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';
import { removeImageBackground, compositeCutoutOnColor } from '../../core/ai/backgroundRemovalService';

export const imageRemoveBgPlugin: ToolPlugin = {
  id: 'image-remove-bg',
  name: 'AI Background Remover & Color Changer',
  category: 'images',
  description: 'Remove background 100% offline or replace with custom colors using in-browser deep learning neural network (MODNet).',
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
    const bgColor = options.bgColor || 'transparent';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Processing ${file.name}...`);

      const rawBlob = new Blob([file.data as any], { type: file.type });
      
      const { blob: cutoutBlob } = await removeImageBackground(rawBlob, (stage, pct, detail) => {
        context.reportProgress(
          20 + Math.round((pct / 100) * 70),
          detail || `Neural network processing: ${pct}%`
        );
      });

      const finalBlob = await compositeCutoutOnColor(cutoutBlob, bgColor);

      const isPng = bgColor === 'transparent';
      const ext = isPng ? 'png' : 'jpg';
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-${bgColor === 'transparent' ? 'nobg' : bgColor}.${ext}`,
        type: isPng ? 'image/png' : 'image/jpeg',
        data: finalBlob,
        downloadName: `${baseName}-${bgColor === 'transparent' ? 'transparent' : bgColor}.${ext}`,
      });
    }

    return outputs;
  },
};
