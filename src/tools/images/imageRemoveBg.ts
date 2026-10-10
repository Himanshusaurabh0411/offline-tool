import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';
import { removeOrReplaceBackground } from './bgRemovalHelper';

export const imageRemoveBgPlugin: ToolPlugin = {
  id: 'image-remove-bg',
  name: 'Background Remover & Color Changer',
  category: 'images',
  description: 'Remove background 100% offline or replace it with white, blue, red, or transparent PNG.',
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
        { label: 'Light Blue (#CAE8FF - Passport & Visa)', value: 'lightblue' },
        { label: 'Royal Blue (#2563EB - Formal Background)', value: 'blue' },
        { label: 'Classic Red (#DC2626 - ID Cards)', value: 'red' },
        { label: 'Light Grey (#F3F4F6)', value: 'lightgrey' },
      ],
    },
    {
      id: 'tolerance',
      label: 'Edge & Color Sensitivity (10-60)',
      type: 'range',
      defaultValue: 30,
      min: 10,
      max: 60,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { bgColor?: string; tolerance?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file.');
    const tolerance = options.tolerance || 30;
    const bgColor = options.bgColor || 'transparent';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Removing background for ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0);

      // Perform boundary-connected background segmentation
      removeOrReplaceBackground(ctx, canvas.width, canvas.height, {
        tolerance,
        replaceBgColor: bgColor === 'transparent' ? null : bgColor,
      });

      const isPng = bgColor === 'transparent';
      const mime = isPng ? 'image/png' : 'image/jpeg';
      const ext = isPng ? 'png' : 'jpg';

      const outputBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), mime, 0.95));
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-${bgColor === 'transparent' ? 'nobg' : bgColor}.${ext}`,
        type: mime,
        data: outputBlob,
        downloadName: `${baseName}-${bgColor === 'transparent' ? 'transparent' : bgColor}.${ext}`,
      });
    }

    return outputs;
  },
};
