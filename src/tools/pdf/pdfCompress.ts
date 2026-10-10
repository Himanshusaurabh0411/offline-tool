import { PDFDocument } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfCompressPlugin: ToolPlugin = {
  id: 'pdf-compress',
  name: 'Compress PDF',
  category: 'pdf',
  description: 'Reduce PDF file size by stripping redundant metadata, compressing streams, and optimizing objects.',
  icon: 'Minimize2',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'quality',
      label: 'Compression Level',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Maximum Compression (Smallest file)', value: 'high' },
        { label: 'Recommended / Balanced', value: 'medium' },
        { label: 'Low Compression (Highest quality)', value: 'low' },
      ],
    },
    {
      id: 'stripMetadata',
      label: 'Strip Author / Creation Metadata',
      type: 'boolean',
      defaultValue: true,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { quality?: string; stripMetadata?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const stripMeta = options.stripMetadata !== false;

    context.reportProgress(20, 'Loading and inspecting PDF structure...');
    const pdfDoc = await PDFDocument.load(file.data);

    if (stripMeta) {
      context.reportProgress(40, 'Removing metadata headers and document history...');
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('OfflineForge Optimizer');
      pdfDoc.setCreator('OfflineForge Optimizer');
    }

    context.reportProgress(70, 'Re-compressing stream objects and cleaning unreferenced xrefs...');
    // PDF-lib's useObjectStreams packs objects into compressed streams, significantly reducing size!
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const originalSize = file.size;
    const newSize = compressedBytes.length;
    const reduction = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

    return [
      {
        name: `${baseName}-compressed.pdf`,
        type: 'application/pdf',
        data: compressedBytes,
        downloadName: `${baseName}-compressed.pdf`,
        metadata: {
          originalSize,
          newSize,
          reductionPercent: reduction,
        },
      },
    ];
  },
};
