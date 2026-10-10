import { PDFDocument } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfMergePlugin: ToolPlugin = {
  id: 'pdf-merge',
  name: 'Merge PDFs',
  category: 'pdf',
  description: 'Combine multiple PDF documents into a single document in your chosen order.',
  icon: 'Layers',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [],
  run: async (
    files: ToolInputFile[],
    _options: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length < 2) {
      throw new Error('Please select at least 2 PDF files to merge.');
    }

    context.reportProgress(10, 'Initializing merged PDF document...');
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Operation cancelled');
      const file = files[i];
      context.reportProgress(
        15 + Math.round((i / files.length) * 75),
        `Merging file ${i + 1} of ${files.length}: ${file.name}...`
      );

      const srcPdf = await PDFDocument.load(file.data);
      const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    context.reportProgress(95, 'Saving combined PDF...');
    const mergedPdfBytes = await mergedPdf.save();

    return [
      {
        name: 'merged-document.pdf',
        type: 'application/pdf',
        data: mergedPdfBytes,
        downloadName: 'merged-document.pdf',
        metadata: {
          pageCount: mergedPdf.getPageCount(),
          fileCount: files.length,
        },
      },
    ];
  },
};
