import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageCropPlugin: ToolPlugin = {
  id: 'image-crop',
  name: 'Crop Image',
  category: 'images',
  description: 'Crop images by aspect ratio presets (1:1, 16:9, 4:3, 9:16, 3:2, 2:3) with smart framing alignment.',
  icon: 'Crop',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'aspectRatio',
      label: 'Crop Aspect Ratio',
      type: 'select',
      defaultValue: '1:1',
      options: [
        { label: 'Square (1:1 - Avatar / Instagram)', value: '1:1' },
        { label: 'Portrait (4:5 - Instagram Post)', value: '4:5' },
        { label: 'Story / Reel / Shorts (9:16 - Mobile Vertical)', value: '9:16' },
        { label: 'Landscape (16:9 - Widescreen / YouTube)', value: '16:9' },
        { label: 'Classic Photo (3:2 - Standard DSLR)', value: '3:2' },
        { label: 'Standard (4:3)', value: '4:3' },
        { label: 'Portrait (2:3)', value: '2:3' },
      ],
    },
    {
      id: 'alignment',
      label: 'Crop Framing Focus',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Center (Balanced)', value: 'center' },
        { label: 'Top / Head (Portraits & People)', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { aspectRatio?: string; alignment?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file to crop.');
    const ratioStr = options.aspectRatio || '1:1';
    const alignment = options.alignment || 'center';
    const [rw, rh] = ratioStr.split(':').map(Number);
    const targetAspect = rw / rh;

    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Cropping ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      let cropWidth = img.width;
      let cropHeight = img.height;
      let cropX = 0;
      let cropY = 0;

      const currentAspect = img.width / img.height;

      if (currentAspect > targetAspect) {
        // Current is wider than target: trim horizontal sides
        cropWidth = Math.round(img.height * targetAspect);
        if (alignment === 'left') {
          cropX = 0;
        } else if (alignment === 'right') {
          cropX = img.width - cropWidth;
        } else {
          cropX = Math.round((img.width - cropWidth) / 2);
        }
      } else {
        // Current is taller than target: trim vertical sides
        cropHeight = Math.round(img.width / targetAspect);
        if (alignment === 'top') {
          cropY = 0;
        } else if (alignment === 'bottom') {
          cropY = img.height - cropHeight;
        } else {
          cropY = Math.round((img.height - cropHeight) / 2);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const croppedBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-cropped.png`,
        type: 'image/png',
        data: croppedBlob,
        downloadName: `${baseName}-cropped.png`,
        metadata: {
          croppedWidth: cropWidth,
          croppedHeight: cropHeight,
          ratio: ratioStr,
          alignment,
        },
      });
    }

    return outputs;
  },
};
