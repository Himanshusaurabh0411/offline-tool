import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';
import { loadPdfJsDocument, extractTextFromPdf } from '../../core/pdf/pdfjsHelper';

export const pdfToTextPlugin: ToolPlugin = {
  id: 'pdf-to-text',
  name: 'PDF to Text / Markdown / HTML',
  category: 'pdf',
  description: 'Extract text content from any PDF and convert into clean Plain Text, Markdown, or HTML.',
  icon: 'FileText',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'outputFormat',
      label: 'Output Format',
      type: 'select',
      defaultValue: 'markdown',
      options: [
        { label: 'Markdown (.md)', value: 'markdown' },
        { label: 'Plain Text (.txt)', value: 'txt' },
        { label: 'HTML Document (.html)', value: 'html' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { outputFormat?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const outFmt = options.outputFormat || 'markdown';

    context.reportProgress(15, 'Loading PDF and extracting textual content...');
    const pdfDoc = await loadPdfJsDocument(file.data);
    const pages = await extractTextFromPdf(pdfDoc);

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    let content = '';
    let mimeType = 'text/plain';
    let fileExt = 'txt';

    if (outFmt === 'markdown') {
      mimeType = 'text/markdown';
      fileExt = 'md';
      content = `# ${baseName}\n\n`;
      pages.forEach((pText, idx) => {
        content += `## Page ${idx + 1}\n\n${pText.trim()}\n\n---\n\n`;
      });
    } else if (outFmt === 'html') {
      mimeType = 'text/html';
      fileExt = 'html';
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title><style>body{font-family:system-ui;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}hr{margin:2rem 0;border:0;border-top:1px solid #ccc}.page{margin-bottom:2rem}</style></head><body><h1>${baseName}</h1>`;
      pages.forEach((pText, idx) => {
        content += `<div class="page"><h3>Page ${idx + 1}</h3><p>${pText.trim()}</p></div><hr/>`;
      });
      content += `</body></html>`;
    } else {
      content = pages
        .map((p, idx) => `=== PAGE ${idx + 1} ===\n\n${p.trim()}\n\n`)
        .join('\n');
    }

    return [
      {
        name: `${baseName}.${fileExt}`,
        type: mimeType,
        data: content,
        downloadName: `${baseName}.${fileExt}`,
        metadata: { pageCount: pages.length },
      },
    ];
  },
};
