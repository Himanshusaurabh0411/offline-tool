import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const base64ToolPlugin: ToolPlugin = {
  id: 'base64-tool',
  name: 'Base64 Encoder & Decoder',
  category: 'dev',
  description: 'Convert any file to data URL / Base64 string or decode Base64 back into file.',
  icon: 'Binary',
  acceptedMimeTypes: ['*/*'],
  acceptedExtensions: ['*'],
  optionsSchema: [
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'encode',
      options: [
        { label: 'Encode to Base64 (Data URI)', value: 'encode' },
        { label: 'Encode to Raw Base64', value: 'raw' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { mode?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    const mode = options.mode || 'encode';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(Math.round(((i + 1) / files.length) * 100), `Converting ${file.name}...`);

      const bytes = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data as ArrayBuffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let j = 0; j < len; j++) {
        binary += String.fromCharCode(bytes[j]);
      }
      const b64 = btoa(binary);
      const text = mode === 'encode' ? `data:${file.type || 'application/octet-stream'};base64,${b64}` : b64;

      outputs.push({
        name: `${file.name}.base64.txt`,
        type: 'text/plain',
        data: text,
        downloadName: `${file.name}.base64.txt`,
      });
    }

    return outputs;
  },
};
