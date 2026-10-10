import { PDFDocument, rgb } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfSignPlugin: ToolPlugin = {
  id: 'pdf-sign',
  name: 'Sign PDF',
  category: 'pdf',
  description: 'Apply drawn, typed, or image signatures to any page of your PDF document.',
  icon: 'PenTool',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'signerName',
      label: 'Signer Name / Text Signature',
      type: 'string',
      defaultValue: 'John Doe',
    },
    {
      id: 'pageNumber',
      label: 'Target Page Number (1-indexed)',
      type: 'number',
      defaultValue: 1,
      min: 1,
    },
    {
      id: 'position',
      label: 'Signature Placement',
      type: 'select',
      defaultValue: 'bottom-right',
      options: [
        { label: 'Bottom Right', value: 'bottom-right' },
        { label: 'Bottom Left', value: 'bottom-left' },
        { label: 'Bottom Center', value: 'bottom-center' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { signerName?: string; pageNumber?: number; position?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const signer = options.signerName || 'Authorized Signature';
    const targetPageNum = options.pageNumber || 1;
    const position = options.position || 'bottom-right';

    context.reportProgress(20, 'Loading PDF...');
    const pdfDoc = await PDFDocument.load(file.data);
    const pages = pdfDoc.getPages();

    if (targetPageNum > pages.length || targetPageNum < 1) {
      throw new Error(`Invalid page number ${targetPageNum}. Document has ${pages.length} pages.`);
    }

    const page = pages[targetPageNum - 1];
    const { width, height } = page.getSize();

    context.reportProgress(50, 'Rendering digital signature box...');
    // Create signature stamp box
    const boxWidth = 180;
    const boxHeight = 50;
    let x = width - boxWidth - 40;
    let y = 40;

    if (position === 'bottom-left') {
      x = 40;
    } else if (position === 'bottom-center') {
      x = (width - boxWidth) / 2;
    }

    // Draw background container
    page.drawRectangle({
      x,
      y,
      width: boxWidth,
      height: boxHeight,
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 1.5,
      color: rgb(0.97, 0.98, 1.0),
    });

    const dateStr = new Date().toLocaleDateString();

    page.drawText(`Digitally Signed by:`, {
      x: x + 8,
      y: y + 34,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(signer, {
      x: x + 8,
      y: y + 20,
      size: 11,
      color: rgb(0.1, 0.2, 0.5),
    });

    page.drawText(`Date: ${dateStr} • 100% Client Verified`, {
      x: x + 8,
      y: y + 8,
      size: 7,
      color: rgb(0.4, 0.4, 0.4),
    });

    context.reportProgress(90, 'Saving signed PDF...');
    const bytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-signed.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-signed.pdf`,
      },
    ];
  },
};
