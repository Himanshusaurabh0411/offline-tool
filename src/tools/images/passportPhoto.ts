import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';
import { removeOrReplaceBackground } from './bgRemovalHelper';

export const passportPhotoPlugin: ToolPlugin = {
  id: 'passport-photo-maker',
  name: 'Passport Photo Maker & Background Changer',
  category: 'images',
  description: 'Generate standard biometric passport & visa photos (India 3.5x4.5cm, US 2x2 in, UK/EU) with automatic background removal, color replacement (white, blue, red), and 4x6 print sheet.',
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
      id: 'removeBg',
      label: 'Remove & Replace Background',
      type: 'boolean',
      defaultValue: true,
      description: 'Automatically segment portrait and replace background with chosen color',
    },
    {
      id: 'bgColor',
      label: 'Background Color',
      type: 'select',
      defaultValue: 'white',
      options: [
        { label: 'Plain White (#FFFFFF) - US, UK, Schengen, Passport India', value: 'white' },
        { label: 'Light Blue (#CAE8FF) - India SSC, UPSC, State Exams, Oman', value: 'lightblue' },
        { label: 'Royal Blue (#2563EB) - Corporate / ID Badges', value: 'blue' },
        { label: 'Classic Red (#DC2626) - Asian Passports / ID', value: 'red' },
        { label: 'Light Grey (#F3F4F6) - US/EU Standard', value: 'lightgrey' },
        { label: 'Keep Original Background', value: 'original' },
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
    options: { format?: string; bgColor?: string; removeBg?: boolean; createPrintSheet?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please upload a portrait image.');

    const outputs: ToolOutputItem[] = [];
    const format = options.format || 'in-35x45';
    const bgColor = options.bgColor || 'white';
    const removeBg = options.removeBg ?? true;
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
      context.reportProgress(20 + Math.round((i / files.length) * 40), `Processing passport photo for ${file.name}...`);

      const blob = new Blob([file.data as any], { type: file.type });
      const img = await createImageBitmap(blob);

      // Create cropped & centered passport photo canvas
      const canvas = document.createElement('canvas');
      canvas.width = photoW;
      canvas.height = photoH;
      const ctx = canvas.getContext('2d')!;

      // Calculate center-crop to fit target aspect ratio with portrait focus
      const targetRatio = photoW / photoH;
      const sourceRatio = img.width / img.height;

      let srcW = img.width;
      let srcH = img.height;
      let srcX = 0;
      let srcY = 0;

      if (sourceRatio > targetRatio) {
        srcW = img.height * targetRatio;
        srcX = (img.width - srcW) / 2;
      } else {
        srcH = img.width / targetRatio;
        srcY = Math.max(0, (img.height - srcH) * 0.18);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, photoW, photoH);

      // Perform background removal and color replacement
      if (removeBg && bgColor !== 'original') {
        context.reportProgress(65, 'Segmenting background & applying color...');
        removeOrReplaceBackground(ctx, photoW, photoH, {
          tolerance: 30,
          replaceBgColor: bgColor,
        });
      }

      // Subtle border cutting guide
      ctx.strokeStyle = '#E5E7EB';
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
          bgColor,
        },
      });

      // Optionally generate 4x6 Printable Sheet (1800 x 1200 px at 300 DPI)
      if (createSheet) {
        context.reportProgress(85, 'Generating 4x6 printable multi-photo sheet...');
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = 1800; // 6 inches @ 300 DPI
        sheetCanvas.height = 1200; // 4 inches @ 300 DPI
        const sCtx = sheetCanvas.getContext('2d')!;

        sCtx.fillStyle = '#FFFFFF';
        sCtx.fillRect(0, 0, 1800, 1200);

        const cols = format === 'us-2x2' ? 2 : 4;
        const rows = format === 'us-2x2' ? 2 : 2;
        const gapX = Math.round((1800 - (cols * photoW)) / (cols + 1));
        const gapY = Math.round((1200 - (rows * photoH)) / (rows + 1));

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = gapX + c * (photoW + gapX);
            const y = gapY + r * (photoH + gapY);
            sCtx.drawImage(canvas, x, y);
            sCtx.strokeStyle = '#D1D5DB';
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
