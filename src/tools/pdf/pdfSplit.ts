import { PDFDocument } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfSplitPlugin: ToolPlugin = {
  id: 'pdf-split',
  name: 'Split PDF',
  category: 'pdf',
  description: 'Split a PDF by page ranges or extract every page into separate individual documents.',
  icon: 'Scissors',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'splitMode',
      label: 'Split Mode',
      type: 'select',
      defaultValue: 'range',
      options: [
        { label: 'Custom Page Range (e.g. 1-3, 5)', value: 'range' },
        { label: 'Extract Every Page to Separate File', value: 'all' },
      ],
    },
    {
      id: 'pageRange',
      label: 'Page Range',
      type: 'string',
      defaultValue: '1-2',
      description: 'e.g. 1-3, 5, 7-9',
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { splitMode?: string; pageRange?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file to split.');
    const file = files[0];
    const mode = options.splitMode || 'range';
    const rangeStr = options.pageRange || '1';

    context.reportProgress(10, 'Loading PDF...');
    const srcDoc = await PDFDocument.load(file.data);
    const totalPages = srcDoc.getPageCount();

    const outputs: ToolOutputItem[] = [];

    if (mode === 'all') {
      for (let i = 0; i < totalPages; i++) {
        if (context.isCancelled()) throw new Error('Cancelled');
        context.reportProgress(
          15 + Math.round((i / totalPages) * 80),
          `Extracting page ${i + 1} of ${totalPages}...`
        );

        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(copiedPage);

        const bytes = await newDoc.save();
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        outputs.push({
          name: `${baseName}-page-${i + 1}.pdf`,
          type: 'application/pdf',
          data: bytes,
          downloadName: `${baseName}-page-${i + 1}.pdf`,
        });
      }
    } else {
      // Parse page ranges (e.g. "1-3, 5")
      const pageIndicesToKeep: number[] = [];
      const parts = rangeStr.split(',').map((p) => p.trim());

      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-');
          const start = Math.max(1, parseInt(startStr, 10));
          const end = Math.min(totalPages, parseInt(endStr, 10));
          for (let p = start; p <= end; p++) {
            pageIndicesToKeep.push(p - 1);
          }
        } else {
          const p = parseInt(part, 10);
          if (p >= 1 && p <= totalPages) {
            pageIndicesToKeep.push(p - 1);
          }
        }
      }

      if (pageIndicesToKeep.length === 0) {
        throw new Error(`Invalid page range "${rangeStr}". Document has ${totalPages} pages.`);
      }

      context.reportProgress(50, 'Extracting selected pages...');
      const newDoc = await PDFDocument.create();
      const uniqueIndices = Array.from(new Set(pageIndicesToKeep));
      const copiedPages = await newDoc.copyPages(srcDoc, uniqueIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const bytes = await newDoc.save();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      outputs.push({
        name: `${baseName}-extracted.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-extracted.pdf`,
        metadata: { pageCount: copiedPages.length },
      });
    }

    return outputs;
  },
};
