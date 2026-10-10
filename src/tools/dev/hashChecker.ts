import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const hashCheckerPlugin: ToolPlugin = {
  id: 'hash-checker',
  name: 'Hash Checker & Generator',
  category: 'dev',
  description: 'Compute SHA-256, SHA-512, and SHA-1 cryptographic checksums 100% locally.',
  icon: 'Hash',
  acceptedMimeTypes: ['*/*'],
  acceptedExtensions: ['*'],
  optionsSchema: [
    {
      id: 'algorithm',
      label: 'Hash Algorithm',
      type: 'select',
      defaultValue: 'SHA-256',
      options: [
        { label: 'SHA-256', value: 'SHA-256' },
        { label: 'SHA-512', value: 'SHA-512' },
        { label: 'SHA-1', value: 'SHA-1' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { algorithm?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    const algo = options.algorithm || 'SHA-256';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(Math.round(((i + 1) / files.length) * 100), `Hashing ${file.name}...`);

      const buffer = file.data.buffer as ArrayBuffer;

      const hashBuffer = await crypto.subtle.digest(algo, buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const resultText = `File: ${file.name}\nSize: ${file.size} bytes\nAlgorithm: ${algo}\nChecksum: ${hashHex}\n`;

      outputs.push({
        name: `${file.name}.${algo.toLowerCase()}.txt`,
        type: 'text/plain',
        data: resultText,
        downloadName: `${file.name}-${algo.toLowerCase()}.txt`,
        metadata: { hash: hashHex, algo },
      });
    }

    return outputs;
  },
};
