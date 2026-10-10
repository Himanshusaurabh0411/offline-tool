import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageMemePlugin: ToolPlugin = {
  id: 'image-meme-maker',
  name: 'Meme Generator',
  category: 'images',
  description: 'Create viral memes with custom top and bottom captions, Impact typography, and outline strokes.',
  icon: 'Smile',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'topText',
      label: 'Top Text',
      type: 'string',
      defaultValue: 'WHEN YOU FIND AN OFFLINE TOOL',
    },
    {
      id: 'bottomText',
      label: 'Bottom Text',
      type: 'string',
      defaultValue: 'THAT SENDS 0 BYTES TO SERVERS',
    },
    {
      id: 'fontSize',
      label: 'Font Size (px)',
      type: 'number',
      defaultValue: 42,
      min: 18,
      max: 96,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { topText?: string; bottomText?: string; fontSize?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a meme template image.');
    const file = files[0];
    const topText = (options.topText || '').toUpperCase();
    const bottomText = (options.bottomText || '').toUpperCase();
    const fontSize = options.fontSize || 42;

    context.reportProgress(20, 'Loading template image...');
    const blob = new Blob([file.data as any], { type: file.type });
    const img = await createImageBitmap(blob);

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(img, 0, 0);

    // Setup Meme Typography
    ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, Math.round(fontSize / 7));
    ctx.lineJoin = 'round';

    context.reportProgress(60, 'Stamping captions...');

    // Draw Top Text
    if (topText) {
      const y = fontSize + 20;
      ctx.strokeText(topText, canvas.width / 2, y);
      ctx.fillText(topText, canvas.width / 2, y);
    }

    // Draw Bottom Text
    if (bottomText) {
      const y = canvas.height - 30;
      ctx.strokeText(bottomText, canvas.width / 2, y);
      ctx.fillText(bottomText, canvas.width / 2, y);
    }

    context.reportProgress(90, 'Generating meme...');
    const memeBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-meme.png`,
        type: 'image/png',
        data: memeBlob,
        downloadName: `${baseName}-meme.png`,
      },
    ];
  },
};
