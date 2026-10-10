import exifr from 'exifr';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageExifPlugin: ToolPlugin = {
  id: 'image-exif-remover',
  name: 'EXIF Viewer & Metadata Scrubber',
  category: 'images',
  description: 'Inspect camera, GPS location, and device EXIF tags and strip all metadata from images for 100% privacy.',
  icon: 'ShieldCheck',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
  optionsSchema: [
    {
      id: 'stripExif',
      label: 'Strip All EXIF & GPS Metadata',
      type: 'boolean',
      defaultValue: true,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { stripExif?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an image file.');
    const strip = options.stripExif !== false;
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Analyzing metadata for ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });

      let parsedExif: Record<string, any> = {};
      try {
        parsedExif = (await exifr.parse(blob, { tiff: true, exif: true, gps: true, xmp: true })) || {};
      } catch (e) {
        console.warn('No EXIF tags found or error parsing', e);
      }

      const reportLines: string[] = [
        '=====================================================',
        '            IMAGE EXIF & METADATA REPORT             ',
        '=====================================================',
        `File Name: ${file.name}`,
        `File Size: ${(file.size / 1024).toFixed(2)} KB`,
        `Tags Detected: ${Object.keys(parsedExif).length}`,
        '-----------------------------------------------------',
      ];

      if (Object.keys(parsedExif).length === 0) {
        reportLines.push('No embedded EXIF or GPS tags found in this image.');
      } else {
        for (const [key, val] of Object.entries(parsedExif)) {
          reportLines.push(`${key}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`);
        }
      }

      reportLines.push('=====================================================');
      const reportText = reportLines.join('\n');
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-exif-report.txt`,
        type: 'text/plain',
        data: reportText,
        downloadName: `${baseName}-exif-report.txt`,
        metadata: { tagCount: Object.keys(parsedExif).length },
      });

      if (strip) {
        // Strip EXIF by re-rendering clean pixel data to fresh canvas
        const img = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const cleanBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
        outputs.push({
          name: `${baseName}-scrubbed.png`,
          type: 'image/png',
          data: cleanBlob,
          downloadName: `${baseName}-scrubbed.png`,
        });
      }
    }

    return outputs;
  },
};
