import { PDFDocument, PageSizes } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imagesToPdfPlugin: ToolPlugin = {
  id: 'images-to-pdf',
  name: 'Images to PDF',
  category: 'pdf',
  description: 'Convert multiple JPG, PNG, and WebP images into a single high-quality PDF document.',
  icon: 'FileImage',
  acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'pageSize',
      label: 'Page Size',
      type: 'select',
      defaultValue: 'fit',
      options: [
        { label: 'Fit to Image Dimensions (Original)', value: 'fit' },
        { label: 'Standard A4 Portrait', value: 'a4' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { pageSize?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select at least one image file.');
    const fitMode = options.pageSize || 'fit';

    context.reportProgress(10, 'Creating PDF document...');
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(
        15 + Math.round((i / files.length) * 75),
        `Embedding image ${i + 1} of ${files.length}: ${file.name}...`
      );

      const uint8 = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data as ArrayBuffer);
      let embeddedImage;

      if (file.name.toLowerCase().endsWith('.png') || file.type === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(uint8);
      } else {
        // JPEG or converted image
        embeddedImage = await pdfDoc.embedJpg(uint8);
      }

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      if (fitMode === 'a4') {
        const page = pdfDoc.addPage(PageSizes.A4);
        const [pageWidth, pageHeight] = PageSizes.A4;
        const scale = Math.min((pageWidth - 40) / imgWidth, (pageHeight - 40) / imgHeight);
        const w = imgWidth * scale;
        const h = imgHeight * scale;
        page.drawImage(embeddedImage, {
          x: (pageWidth - w) / 2,
          y: (pageHeight - h) / 2,
          width: w,
          height: h,
        });
      } else {
        const page = pdfDoc.addPage([imgWidth, imgHeight]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        });
      }
    }

    context.reportProgress(92, 'Generating PDF...');
    const bytes = await pdfDoc.save();

    return [
      {
        name: 'images-converted.pdf',
        type: 'application/pdf',
        data: bytes,
        downloadName: 'images-converted.pdf',
        metadata: { pageCount: files.length },
      },
    ];
  },
};
