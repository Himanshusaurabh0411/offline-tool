import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageRotatePlugin: ToolPlugin = {
  id: 'image-rotate',
  name: 'Rotate & Flip Image',
  category: 'images',
  description: 'Rotate images by 90°, 180°, or 270° and flip horizontally or vertically.',
  icon: 'RotateCw',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'rotation',
      label: 'Rotation',
      type: 'select',
      defaultValue: '90',
      options: [
        { label: 'Rotate 90° Clockwise', value: '90' },
        { label: 'Rotate 180° Flip', value: '180' },
        { label: 'Rotate 270° Counter-Clockwise', value: '270' },
      ],
    },
    {
      id: 'flipHorizontal',
      label: 'Flip Horizontally',
      type: 'boolean',
      defaultValue: false,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { rotation?: string; flipHorizontal?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file.');
    const angle = parseInt(options.rotation || '90', 10);
    const flipH = Boolean(options.flipHorizontal);

    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Rotating ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      const canvas = document.createElement('canvas');
      const isQuarter = angle === 90 || angle === 270;
      canvas.width = isQuarter ? img.height : img.width;
      canvas.height = isQuarter ? img.width : img.height;

      const ctx = canvas.getContext('2d')!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);

      if (flipH) {
        ctx.scale(-1, 1);
      }

      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-rotated.png`,
        type: 'image/png',
        data: rotatedBlob,
        downloadName: `${baseName}-rotated.png`,
      });
    }

    return outputs;
  },
};
