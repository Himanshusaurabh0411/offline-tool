import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';
import { loadPdfJsDocument, renderPageToBlob } from '../../core/pdf/pdfjsHelper';

export const pdfToImagesPlugin: ToolPlugin = {
  id: 'pdf-to-images',
  name: 'PDF to Images',
  category: 'pdf',
  description: 'Convert every page of a PDF document into high-resolution JPG, PNG, or WebP images.',
  icon: 'Image',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'format',
      label: 'Image Format',
      type: 'select',
      defaultValue: 'image/png',
      options: [
        { label: 'PNG (Lossless, Transparent)', value: 'image/png' },
        { label: 'JPG / JPEG (Standard)', value: 'image/jpeg' },
        { label: 'WebP (Modern, Compact)', value: 'image/webp' },
      ],
    },
    {
      id: 'scale',
      label: 'Resolution / Scale',
      type: 'select',
      defaultValue: '2.0',
      options: [
        { label: 'Standard (1.0x - 72 DPI)', value: '1.0' },
        { label: 'High Quality (2.0x - 144 DPI)', value: '2.0' },
        { label: 'Ultra Sharp (3.0x - 216 DPI)', value: '3.0' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { format?: 'image/png' | 'image/jpeg' | 'image/webp'; scale?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const format = options.format || 'image/png';
    const scale = parseFloat(options.scale || '2.0');
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';

    context.reportProgress(10, 'Loading PDF document...');
    const pdfDoc = await loadPdfJsDocument(file.data);
    const numPages = pdfDoc.numPages;

    const outputs: ToolOutputItem[] = [];
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      context.reportProgress(
        15 + Math.round((pageNum / numPages) * 80),
        `Rendering page ${pageNum} of ${numPages} as ${ext.toUpperCase()}...`
      );

      const blob = await renderPageToBlob(pdfDoc, pageNum, format, 0.9, scale);
      outputs.push({
        name: `${baseName}-page-${pageNum}.${ext}`,
        type: format,
        data: blob,
        downloadName: `${baseName}-page-${pageNum}.${ext}`,
      });
    }

    return outputs;
  },
};
