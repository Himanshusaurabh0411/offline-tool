import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfWatermarkPlugin: ToolPlugin = {
  id: 'pdf-watermark',
  name: 'Watermark PDF',
  category: 'pdf',
  description: 'Apply diagonal or centered text watermarks with customizable opacity and font size.',
  icon: 'Stamp',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'watermarkText',
      label: 'Watermark Text',
      type: 'string',
      defaultValue: 'CONFIDENTIAL',
    },
    {
      id: 'opacity',
      label: 'Opacity (0.1 to 1.0)',
      type: 'number',
      defaultValue: 0.25,
      min: 0.05,
      max: 1.0,
      step: 0.05,
    },
    {
      id: 'fontSize',
      label: 'Font Size',
      type: 'number',
      defaultValue: 48,
      min: 16,
      max: 120,
    },
    {
      id: 'rotation',
      label: 'Rotation Angle (degrees)',
      type: 'number',
      defaultValue: 45,
      min: -90,
      max: 90,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { watermarkText?: string; opacity?: number; fontSize?: number; rotation?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const text = options.watermarkText || 'CONFIDENTIAL';
    const opacity = options.opacity !== undefined ? Number(options.opacity) : 0.25;
    const fontSize = options.fontSize || 48;
    const rotation = options.rotation !== undefined ? Number(options.rotation) : 45;

    context.reportProgress(20, 'Loading PDF and fonts...');
    const pdfDoc = await PDFDocument.load(file.data);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      context.reportProgress(
        25 + Math.round((i / pages.length) * 65),
        `Watermarking page ${i + 1} of ${pages.length}...`
      );
      const page = pages[i];
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      // Centered rotation
      page.drawText(text, {
        x: width / 2 - (textWidth / 2) * Math.cos((rotation * Math.PI) / 180),
        y: height / 2 - (textWidth / 2) * Math.sin((rotation * Math.PI) / 180),
        size: fontSize,
        font,
        color: rgb(0.8, 0.2, 0.2),
        opacity,
        rotate: degrees(rotation),
      });
    }

    context.reportProgress(95, 'Saving watermarked document...');
    const bytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-watermarked.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-watermarked.pdf`,
      },
    ];
  },
};
