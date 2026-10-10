import { marked } from 'marked';
import TurndownService from 'turndown';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const markdownHtmlPlugin: ToolPlugin = {
  id: 'markdown-html-converter',
  name: 'Markdown ↔ HTML Converter',
  category: 'documents',
  description: 'Convert Markdown documents into styled HTML or convert HTML files into clean Markdown.',
  icon: 'Code',
  acceptedMimeTypes: ['text/markdown', 'text/html', 'text/plain'],
  acceptedExtensions: ['md', 'markdown', 'html', 'htm'],
  optionsSchema: [
    {
      id: 'direction',
      label: 'Conversion Direction',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto Detect from File Extension', value: 'auto' },
        { label: 'Markdown to HTML', value: 'md2html' },
        { label: 'HTML to Markdown', value: 'html2md' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { direction?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a file to convert.');
    const dir = options.direction || 'auto';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Processing ${file.name}...`);

      const text = new TextDecoder().decode(file.data);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      const isToHtml = dir === 'md2html' || (dir === 'auto' && (ext === 'md' || ext === 'markdown'));

      if (isToHtml) {
        const parsedBody = await marked.parse(text);
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}pre{background:#f1f5f9;padding:1rem;border-radius:8px;overflow-x:auto}code{font-family:monospace}</style></head><body>${parsedBody}</body></html>`;
        outputs.push({
          name: `${baseName}.html`,
          type: 'text/html',
          data: fullHtml,
          downloadName: `${baseName}.html`,
        });
      } else {
        const turndown = new TurndownService({ headingStyle: 'atx' });
        const md = turndown.turndown(text);
        outputs.push({
          name: `${baseName}.md`,
          type: 'text/markdown',
          data: md,
          downloadName: `${baseName}.md`,
        });
      }
    }

    return outputs;
  },
};
