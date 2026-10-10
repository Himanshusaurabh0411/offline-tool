import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const passportPhotoPlugin: ToolPlugin = {
  id: 'passport-photo-maker',
  name: 'Passport Photo Maker',
  category: 'images',
  description: 'Generate standard biometric passport & visa photos (India 3.5x4.5cm, US 2x2 in, UK/EU, Canada) with optional white/blue background and 4x6 print sheet.',
  icon: 'UserCheck',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'format',
      label: 'Standard Country Size',
      type: 'select',
      defaultValue: 'in-35x45',
      options: [
        { label: 'India / UK / Europe (35mm x 45mm @ 300 DPI - 413x531 px)', value: 'in-35x45' },
        { label: 'US Passport & Visa (2 x 2 inches @ 300 DPI - 600x600 px)', value: 'us-2x2' },
        { label: 'Canada Passport (50mm x 70mm @ 300 DPI - 590x826 px)', value: 'ca-50x70' },
        { label: 'Schengen Visa (35mm x 45mm)', value: 'schengen' },
        { label: 'Square Avatar (500x500 px)', value: 'sq-500' },
      ],
    },
    {
      id: 'bgColor',
      label: 'Background Tint / Color',
      type: 'select',
      defaultValue: 'white',
      options: [
        { label: 'Original Background', value: 'original' },
        { label: 'Plain White (#FFFFFF)', value: 'white' },
        { label: 'Light Blue (#EBF4FF - Standard India/Oman/Kuwait)', value: 'lightblue' },
        { label: 'Light Grey (#F3F4F6 - Standard US/EU)', value: 'lightgrey' },
      ],
    },
    {
      id: 'createPrintSheet',
      label: 'Generate Printable 4x6 inch Sheet (Multi-copy grid)',
      type: 'boolean',
      defaultValue: true,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { format?: string; bgColor?: string; createPrintSheet?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please upload a portrait image.');

    const outputs: ToolOutputItem[] = [];
    const format = options.format || 'in-35x45';
    const bgColor = options.bgColor || 'white';
    const createSheet = options.createPrintSheet ?? true;

    // Dimensions in pixels (300 DPI standard)
    let photoW = 413;
    let photoH = 531;
    if (format === 'us-2x2') {
      photoW = 600;
      photoH = 600;
    } else if (format === 'ca-50x70') {
      photoW = 590;
      photoH = 826;
    } else if (format === 'sq-500') {
      photoW = 500;
      photoH = 500;
    }

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Operation cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 60), `Processing passport photo for ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      // Create cropped & centered passport photo canvas
      const canvas = document.createElement('canvas');
      canvas.width = photoW;
      canvas.height = photoH;
      const ctx = canvas.getContext('2d')!;

      // Background color
      if (bgColor === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, photoW, photoH);
      } else if (bgColor === 'lightblue') {
        ctx.fillStyle = '#DCEBFA';
        ctx.fillRect(0, 0, photoW, photoH);
      } else if (bgColor === 'lightgrey') {
        ctx.fillStyle = '#F3F4F6';
        ctx.fillRect(0, 0, photoW, photoH);
      }

      // Calculate center-crop to fit target aspect ratio with portrait focus
      const targetRatio = photoW / photoH;
      const sourceRatio = img.width / img.height;

      let srcW = img.width;
      let srcH = img.height;
      let srcX = 0;
      let srcY = 0;

      if (sourceRatio > targetRatio) {
        // Image is wider than needed, crop sides
        srcW = img.height * targetRatio;
        srcX = (img.width - srcW) / 2;
      } else {
        // Image is taller than needed, focus on upper 70% (head & shoulders)
        srcH = img.width / targetRatio;
        srcY = Math.max(0, (img.height - srcH) * 0.2); // Upper focus
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, photoW, photoH);

      // Delicate border guide for cutting
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, photoW, photoH);

      const singleBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.95));
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      outputs.push({
        name: `${baseName}-passport-photo.jpg`,
        type: 'image/jpeg',
        data: singleBlob,
        downloadName: `${baseName}-passport-${photoW}x${photoH}.jpg`,
        metadata: {
          dimensions: `${photoW}x${photoH}px @ 300 DPI`,
          format,
        },
      });

      // Optionally generate 4x6 Printable Sheet (1800 x 1200 px at 300 DPI)
      if (createSheet) {
        context.reportProgress(85, 'Generating 4x6 printable multi-photo sheet...');
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = 1800; // 6 inches @ 300 DPI
        sheetCanvas.height = 1200; // 4 inches @ 300 DPI
        const sCtx = sheetCanvas.getContext('2d')!;

        // Crisp white paper background
        sCtx.fillStyle = '#FFFFFF';
        sCtx.fillRect(0, 0, 1800, 1200);

        // Calculate grid (e.g. 2x4 for 35x45 or 2x3 for 2x2)
        const cols = format === 'us-2x2' ? 2 : 4;
        const rows = format === 'us-2x2' ? 2 : 2;
        const gapX = Math.round((1800 - (cols * photoW)) / (cols + 1));
        const gapY = Math.round((1200 - (rows * photoH)) / (rows + 1));

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = gapX + c * (photoW + gapX);
            const y = gapY + r * (photoH + gapY);
            sCtx.drawImage(canvas, x, y);
            // Light cutting boundary dashed line
            sCtx.strokeStyle = '#CCCCCC';
            sCtx.lineWidth = 1;
            sCtx.strokeRect(x, y, photoW, photoH);
          }
        }

        const sheetBlob: Blob = await new Promise((res) => sheetCanvas.toBlob((b) => res(b!), 'image/jpeg', 0.95));
        outputs.push({
          name: `${baseName}-4x6-print-sheet.jpg`,
          type: 'image/jpeg',
          data: sheetBlob,
          downloadName: `${baseName}-4x6-passport-sheet.jpg`,
          metadata: {
            description: `4x6 inch studio printable sheet (${cols * rows} photos)`,
          },
        });
      }
    }

    return outputs;
  },
};
