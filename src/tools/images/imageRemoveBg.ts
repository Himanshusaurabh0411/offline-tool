import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageRemoveBgPlugin: ToolPlugin = {
  id: 'image-remove-bg',
  name: 'Background Remover (Offline Alpha Matting)',
  category: 'images',
  description: 'Eradicate backgrounds from portraits, logos, and product photos to produce transparent PNGs 100% locally.',
  icon: 'Scissors',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'tolerance',
      label: 'Edge & Color Sensitivity (1-50)',
      type: 'range',
      defaultValue: 25,
      min: 5,
      max: 60,
    },
    {
      id: 'feather',
      label: 'Edge Feather Radius (px)',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 10,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { tolerance?: number; feather?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file.');
    const tolerance = options.tolerance || 25;
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Analyzing background for ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0);

      context.reportProgress(50, 'Extracting foreground alpha mask...');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample 4 corners to establish background seed color
      const sampleCorner = (x: number, y: number) => {
        const idx = (y * w + x) * 4;
        return [data[idx], data[idx + 1], data[idx + 2]];
      };

      const cornerSeeds = [
        sampleCorner(0, 0),
        sampleCorner(w - 1, 0),
        sampleCorner(0, h - 1),
        sampleCorner(w - 1, h - 1),
      ];

      // Average background color
      const bgR = Math.round(cornerSeeds.reduce((a, s) => a + s[0], 0) / 4);
      const bgG = Math.round(cornerSeeds.reduce((a, s) => a + s[1], 0) / 4);
      const bgB = Math.round(cornerSeeds.reduce((a, s) => a + s[2], 0) / 4);

      // Color distance threshold
      const maxDistance = tolerance * 4.0;

      for (let idx = 0; idx < data.length; idx += 4) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Euclidean color distance from background
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

        if (dist < maxDistance) {
          // Fade to transparent based on proximity
          const alphaRatio = Math.max(0, (dist - maxDistance * 0.5) / (maxDistance * 0.5));
          data[idx + 3] = Math.round(data[idx + 3] * alphaRatio);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const transparentBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-transparent.png`,
        type: 'image/png',
        data: transparentBlob,
        downloadName: `${baseName}-transparent.png`,
      });
    }

    return outputs;
  },
};
