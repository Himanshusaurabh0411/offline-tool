import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageAsciiPlugin: ToolPlugin = {
  id: 'image-ascii',
  name: 'Image to ASCII Art',
  category: 'images',
  description: 'Convert photos or icons into detailed ASCII text art in plain text or colored HTML.',
  icon: 'Terminal',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  optionsSchema: [
    {
      id: 'widthChars',
      label: 'ASCII Width (characters)',
      type: 'number',
      defaultValue: 100,
      min: 40,
      max: 200,
    },
    {
      id: 'coloredHtml',
      label: 'Generate Colored HTML',
      type: 'boolean',
      defaultValue: false,
    },
    {
      id: 'invert',
      label: 'Invert Brightness (Light background)',
      type: 'boolean',
      defaultValue: false,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { widthChars?: number; coloredHtml?: boolean; invert?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file.');
    const targetWidth = options.widthChars || 100;
    const isColored = Boolean(options.coloredHtml);
    const invert = Boolean(options.invert);

    const chars = invert
      ? '@%#*+=-:. '
      : ' .:-=+*#%@';

    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Generating ASCII for ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      // Character aspect ratio is roughly 0.5 (characters are twice as tall as wide)
      const targetHeight = Math.max(1, Math.round((img.height / img.width) * targetWidth * 0.5));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;

      let asciiText = '';
      let htmlContent = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0b0f19;color:#fff;font-family:monospace;font-size:8px;line-height:6px;letter-spacing:1px;white-space:pre}</style></head><body>';

      for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const idx = (y * targetWidth + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          const charIdx = Math.min(chars.length - 1, Math.floor(brightness * chars.length));
          const char = chars[charIdx];

          asciiText += char;
          if (isColored) {
            htmlContent += `<span style="color:rgb(${r},${g},${b})">${char === ' ' ? '&nbsp;' : char}</span>`;
          }
        }
        asciiText += '\n';
        if (isColored) htmlContent += '<br/>';
      }

      htmlContent += '</body></html>';
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      if (isColored) {
        outputs.push({
          name: `${baseName}-ascii.html`,
          type: 'text/html',
          data: htmlContent,
          downloadName: `${baseName}-ascii.html`,
        });
      } else {
        outputs.push({
          name: `${baseName}-ascii.txt`,
          type: 'text/plain',
          data: asciiText,
          downloadName: `${baseName}-ascii.txt`,
        });
      }
    }

    return outputs;
  },
};
