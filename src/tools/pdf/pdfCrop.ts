import { PDFDocument } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfCropPlugin: ToolPlugin = {
  id: 'pdf-crop',
  name: 'Crop PDF Margins',
  category: 'pdf',
  description: 'Trim margins or custom rectangular viewports from PDF pages.',
  icon: 'Crop',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'margin',
      label: 'Margin to trim (points: 72 pt = 1 inch)',
      type: 'number',
      defaultValue: 36,
      min: 0,
      max: 200,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { margin?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const margin = options.margin !== undefined ? Number(options.margin) : 36;

    context.reportProgress(20, 'Loading PDF...');
    const pdfDoc = await PDFDocument.load(file.data);
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      context.reportProgress(25 + Math.round((i / pages.length) * 65), `Cropping page ${i + 1}...`);
      const page = pages[i];
      const { width, height } = page.getSize();

      const newWidth = Math.max(50, width - margin * 2);
      const newHeight = Math.max(50, height - margin * 2);

      page.setCropBox(margin, margin, newWidth, newHeight);
    }

    context.reportProgress(95, 'Saving cropped document...');
    const bytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-cropped.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-cropped.pdf`,
      },
    ];
  },
};
