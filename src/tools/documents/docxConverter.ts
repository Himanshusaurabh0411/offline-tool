import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const docxConverterPlugin: ToolPlugin = {
  id: 'docx-converter',
  name: 'DOCX to HTML / Markdown / TXT',
  category: 'documents',
  description: 'Convert Microsoft Word (.docx) documents into clean HTML, Markdown, or plain text 100% locally with Mammoth.',
  icon: 'FileText',
  acceptedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
  acceptedExtensions: ['docx'],
  optionsSchema: [
    {
      id: 'targetFormat',
      label: 'Target Format',
      type: 'select',
      defaultValue: 'html',
      options: [
        { label: 'HTML Document (.html)', value: 'html' },
        { label: 'Markdown (.md)', value: 'markdown' },
        { label: 'Plain Text (.txt)', value: 'txt' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { targetFormat?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a DOCX file to convert.');
    const format = options.targetFormat || 'html';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Converting ${file.name}...`);

      const arrayBuffer = file.data.buffer.slice(
        file.data.byteOffset,
        file.data.byteOffset + file.data.byteLength
      ) as ArrayBuffer;

      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlBody = result.value;
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      if (format === 'markdown') {
        const turndown = new TurndownService({ headingStyle: 'atx' });
        const mdText = turndown.turndown(htmlBody);
        outputs.push({
          name: `${baseName}.md`,
          type: 'text/markdown',
          data: mdText,
          downloadName: `${baseName}.md`,
          metadata: { warnings: result.messages },
        });
      } else if (format === 'txt') {
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        outputs.push({
          name: `${baseName}.txt`,
          type: 'text/plain',
          data: textResult.value,
          downloadName: `${baseName}.txt`,
        });
      } else {
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:3rem auto;padding:0 1.5rem;line-height:1.6;color:#1e293b}p{margin-bottom:1rem}</style></head><body>${htmlBody}</body></html>`;
        outputs.push({
          name: `${baseName}.html`,
          type: 'text/html',
          data: fullHtml,
          downloadName: `${baseName}.html`,
          metadata: { warnings: result.messages },
        });
      }
    }

    return outputs;
  },
};
