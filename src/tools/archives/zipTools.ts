import JSZip from 'jszip';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const zipCreatePlugin: ToolPlugin = {
  id: 'zip-create',
  name: 'Create ZIP Archive',
  category: 'archives',
  description: 'Bundle multiple files and folders into a compressed .zip archive directly in your browser.',
  icon: 'Archive',
  acceptedMimeTypes: ['*/*'],
  acceptedExtensions: ['*'],
  optionsSchema: [
    {
      id: 'archiveName',
      label: 'Archive Name',
      type: 'string',
      defaultValue: 'archive.zip',
    },
    {
      id: 'compressionLevel',
      label: 'Compression Level',
      type: 'select',
      defaultValue: 'DEFLATE',
      options: [
        { label: 'Deflate (Standard Compression)', value: 'DEFLATE' },
        { label: 'Store (Fastest, No Compression)', value: 'STORE' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { archiveName?: string; compressionLevel?: 'DEFLATE' | 'STORE' },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select files to compress into a ZIP.');
    const zip = new JSZip();
    const compression = options.compressionLevel || 'DEFLATE';

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 50), `Adding ${file.name} to ZIP...`);
      zip.file(file.name, file.data);
    }

    context.reportProgress(80, 'Compressing archive...');
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression,
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        context.reportProgress(80 + Math.round(metadata.percent * 0.18));
      }
    );

    const name = options.archiveName || 'archive.zip';
    return [
      {
        name,
        type: 'application/zip',
        data: zipBlob,
        downloadName: name,
        metadata: { filesCount: files.length },
      },
    ];
  },
};

export const zipExtractPlugin: ToolPlugin = {
  id: 'zip-extract',
  name: 'Extract ZIP Archive',
  category: 'archives',
  description: 'Inspect and extract all files and subfolders from any ZIP archive 100% locally.',
  icon: 'FolderArchive',
  acceptedMimeTypes: ['application/zip', 'application/x-zip-compressed'],
  acceptedExtensions: ['zip'],
  optionsSchema: [],
  run: async (
    files: ToolInputFile[],
    _options: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a ZIP file to extract.');
    const file = files[0];

    context.reportProgress(20, 'Unpacking ZIP central directory...');
    const zip = await JSZip.loadAsync(file.data);

    const outputs: ToolOutputItem[] = [];
    const fileKeys = Object.keys(zip.files).filter((k) => !zip.files[k].dir);

    for (let i = 0; i < fileKeys.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const key = fileKeys[i];
      context.reportProgress(
        30 + Math.round((i / fileKeys.length) * 65),
        `Extracting ${key}...`
      );

      const zipEntry = zip.files[key];
      const data = await zipEntry.async('uint8array');
      outputs.push({
        name: key,
        type: 'application/octet-stream',
        data,
        downloadName: key.split('/').pop() || key,
      });
    }

    return outputs;
  },
};

export const bulkRenamePlugin: ToolPlugin = {
  id: 'bulk-rename',
  name: 'Bulk File Renamer',
  category: 'archives',
  description: 'Batch rename multiple files using custom prefixes, suffixes, numbering ({n}), or search-and-replace patterns.',
  icon: 'FileText',
  acceptedMimeTypes: ['*/*'],
  acceptedExtensions: ['*'],
  optionsSchema: [
    {
      id: 'pattern',
      label: 'Naming Pattern (use {name} and {n} for number)',
      type: 'string',
      defaultValue: 'document_{n}',
    },
    {
      id: 'startNumber',
      label: 'Starting Number',
      type: 'number',
      defaultValue: 1,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { pattern?: string; startNumber?: number },
    _context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    const pattern = options.pattern || 'file_{n}';
    const startNum = options.startNumber || 1;
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop() || '';
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      const num = startNum + i;

      const newBase = pattern
        .replace(/{name}/g, rawName)
        .replace(/{n}/g, String(num).padStart(2, '0'));

      const finalName = ext ? `${newBase}.${ext}` : newBase;
      outputs.push({
        name: finalName,
        type: file.type,
        data: file.data,
        downloadName: finalName,
      });
    }

    return outputs;
  },
};
