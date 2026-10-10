import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfPageNumbersPlugin: ToolPlugin = {
  id: 'pdf-page-numbers',
  name: 'Add Page Numbers to PDF',
  category: 'pdf',
  description: 'Stamp customizable page numbers (Page X of Y, Header/Footer, custom offsets).',
  icon: 'Hash',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'position',
      label: 'Position',
      type: 'select',
      defaultValue: 'bottom-center',
      options: [
        { label: 'Bottom Center', value: 'bottom-center' },
        { label: 'Bottom Right', value: 'bottom-right' },
        { label: 'Bottom Left', value: 'bottom-left' },
        { label: 'Top Right', value: 'top-right' },
        { label: 'Top Center', value: 'top-center' },
      ],
    },
    {
      id: 'format',
      label: 'Numbering Format',
      type: 'select',
      defaultValue: 'page_of_total',
      options: [
        { label: 'Page {n} of {total}', value: 'page_of_total' },
        { label: '{n} / {total}', value: 'n_slash_total' },
        { label: 'Just {n}', value: 'just_n' },
      ],
    },
    {
      id: 'fontSize',
      label: 'Font Size',
      type: 'number',
      defaultValue: 10,
      min: 6,
      max: 24,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { position?: string; format?: string; fontSize?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const pos = options.position || 'bottom-center';
    const fmt = options.format || 'page_of_total';
    const size = options.fontSize || 10;

    context.reportProgress(20, 'Loading PDF and embedding standard fonts...');
    const pdfDoc = await PDFDocument.load(file.data);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const total = pages.length;

    for (let i = 0; i < total; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      context.reportProgress(25 + Math.round((i / total) * 65), `Numbering page ${i + 1} of ${total}...`);
      const page = pages[i];
      const { width, height } = page.getSize();
      const n = i + 1;

      let text = `Page ${n} of ${total}`;
      if (fmt === 'n_slash_total') text = `${n} / ${total}`;
      if (fmt === 'just_n') text = `${n}`;

      const textWidth = font.widthOfTextAtSize(text, size);
      const margin = 30;

      let x = (width - textWidth) / 2;
      let y = margin;

      if (pos === 'bottom-right') {
        x = width - textWidth - margin;
        y = margin;
      } else if (pos === 'bottom-left') {
        x = margin;
        y = margin;
      } else if (pos === 'top-right') {
        x = width - textWidth - margin;
        y = height - margin;
      } else if (pos === 'top-center') {
        x = (width - textWidth) / 2;
        y = height - margin;
      }

      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    context.reportProgress(95, 'Saving numbered PDF...');
    const bytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-numbered.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-numbered.pdf`,
      },
    ];
  },
};
