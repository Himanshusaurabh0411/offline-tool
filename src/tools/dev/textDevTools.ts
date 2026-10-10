import * as Diff from 'diff';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const wordCounterPlugin: ToolPlugin = {
  id: 'word-counter',
  name: 'Word & Text Counter',
  category: 'dev',
  description: 'Analyze documents and text for word count, character count, sentence structure, reading time, and readability.',
  icon: 'AlignLeft',
  acceptedMimeTypes: ['text/*', 'application/json', 'application/xml'],
  acceptedExtensions: ['txt', 'md', 'json', 'csv', 'html', 'js', 'ts'],
  optionsSchema: [],
  run: async (
    files: ToolInputFile[],
    _options: Record<string, any>,
    _context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a text document to count.');
    const outputs: ToolOutputItem[] = [];

    for (const file of files) {
      const text = new TextDecoder().decode(file.data);
      const charsWithSpaces = text.length;
      const charsWithoutSpaces = text.replace(/\s/g, '').length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text.split('\n').length;
      const sentences = (text.match(/[.!?]+(?:\s|$)/g) || []).length;
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

      const readingTimeMinutes = (words / 200).toFixed(1);
      const speakingTimeMinutes = (words / 130).toFixed(1);

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const report = [
        '=====================================================',
        '            TEXT & WORD COUNT ANALYSIS               ',
        '=====================================================',
        `Document: ${file.name}`,
        `Total Words: ${words.toLocaleString()}`,
        `Characters (with spaces): ${charsWithSpaces.toLocaleString()}`,
        `Characters (without spaces): ${charsWithoutSpaces.toLocaleString()}`,
        `Total Lines: ${lines.toLocaleString()}`,
        `Total Sentences: ${sentences.toLocaleString()}`,
        `Total Paragraphs: ${paragraphs.toLocaleString()}`,
        '-----------------------------------------------------',
        `Estimated Reading Time (200 wpm): ~${readingTimeMinutes} min`,
        `Estimated Speaking Time (130 wpm): ~${speakingTimeMinutes} min`,
        '=====================================================',
      ].join('\n');

      outputs.push({
        name: `${baseName}-stats.txt`,
        type: 'text/plain',
        data: report,
        downloadName: `${baseName}-stats.txt`,
        metadata: { words, charsWithSpaces, lines, sentences },
      });
    }

    return outputs;
  },
};

export const diffCheckerPlugin: ToolPlugin = {
  id: 'diff-checker',
  name: 'Text & File Diff Checker',
  category: 'dev',
  description: 'Compare two files side-by-side or line-by-line with color-coded insertion and deletion tracking.',
  icon: 'GitPullRequest',
  acceptedMimeTypes: ['text/*', 'application/json', 'application/javascript'],
  acceptedExtensions: ['txt', 'md', 'json', 'js', 'ts', 'html', 'css', 'py'],
  optionsSchema: [],
  run: async (
    files: ToolInputFile[],
    _options: Record<string, any>,
    _context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length < 2) throw new Error('Please select exactly 2 text files to compare.');
    const [fileA, fileB] = files;

    const textA = new TextDecoder().decode(fileA.data);
    const textB = new TextDecoder().decode(fileB.data);

    const changes = Diff.diffLines(textA, textB);
    const patchReport: string[] = [
      '=====================================================',
      '             FILE DIFFERENCE (DIFF) REPORT           ',
      '=====================================================',
      `--- Original: ${fileA.name}`,
      `+++ Modified: ${fileB.name}`,
      '-----------------------------------------------------',
    ];

    let additions = 0;
    let deletions = 0;

    changes.forEach((part) => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      if (part.added) additions += part.count || 1;
      if (part.removed) deletions += part.count || 1;

      const lines = part.value.split('\n');
      for (let l = 0; l < lines.length - 1; l++) {
        patchReport.push(`${prefix}${lines[l]}`);
      }
    });

    patchReport.push('-----------------------------------------------------');
    patchReport.push(`Summary: +${additions} insertions, -${deletions} deletions.`);
    patchReport.push('=====================================================');

    return [
      {
        name: 'diff-comparison.patch',
        type: 'text/plain',
        data: patchReport.join('\n'),
        downloadName: 'diff-comparison.patch',
        metadata: { additions, deletions },
      },
    ];
  },
};

export const regexTesterPlugin: ToolPlugin = {
  id: 'regex-tester',
  name: 'Regex Tester & Evaluator',
  category: 'dev',
  description: 'Test and match Regular Expressions against text files with match count, indices, and capture groups.',
  icon: 'Code2',
  acceptedMimeTypes: ['text/*'],
  acceptedExtensions: ['*'],
  optionsSchema: [
    {
      id: 'pattern',
      label: 'Regex Pattern',
      type: 'string',
      defaultValue: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      description: 'Pattern (e.g. email, URL, custom)',
    },
    {
      id: 'flags',
      label: 'Regex Flags',
      type: 'string',
      defaultValue: 'gi',
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { pattern?: string; flags?: string },
    _context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a file to evaluate.');
    const pattern = options.pattern || '.*';
    const flags = options.flags || 'g';
    const re = new RegExp(pattern, flags);

    const outputs: ToolOutputItem[] = [];

    for (const file of files) {
      const text = new TextDecoder().decode(file.data);
      const matches = Array.from(text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')));

      const report = [
        '=====================================================',
        '               REGEX EVALUATION REPORT               ',
        '=====================================================',
        `Target File: ${file.name}`,
        `Expression: /${pattern}/${flags}`,
        `Total Matches Found: ${matches.length}`,
        '-----------------------------------------------------',
        ...matches.map((m, idx) => `Match #${idx + 1} at index ${m.index}: "${m[0]}"`),
        '=====================================================',
      ].join('\n');

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      outputs.push({
        name: `${baseName}-regex-matches.txt`,
        type: 'text/plain',
        data: report,
        downloadName: `${baseName}-regex-matches.txt`,
        metadata: { matchCount: matches.length },
      });
    }

    return outputs;
  },
};

export const unitConverterPlugin: ToolPlugin = {
  id: 'unit-converter',
  name: 'Data & Storage Unit Converter',
  category: 'dev',
  description: 'Convert file sizes and binary data capacities across Bytes, KB, MB, GB, TB, and PB accurately.',
  icon: 'HardDrive',
  acceptedMimeTypes: ['*/*'],
  acceptedExtensions: ['*'],
  optionsSchema: [
    {
      id: 'inputValue',
      label: 'Value to Convert',
      type: 'number',
      defaultValue: 1024,
    },
    {
      id: 'inputUnit',
      label: 'Source Unit',
      type: 'select',
      defaultValue: 'MB',
      options: [
        { label: 'Bytes (B)', value: 'B' },
        { label: 'Kilobytes (KB)', value: 'KB' },
        { label: 'Megabytes (MB)', value: 'MB' },
        { label: 'Gigabytes (GB)', value: 'GB' },
        { label: 'Terabytes (TB)', value: 'TB' },
      ],
    },
  ],
  run: async (
    _files: ToolInputFile[],
    options: { inputValue?: number; inputUnit?: string },
    _context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    const val = options.inputValue || 1024;
    const unit = options.inputUnit || 'MB';

    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
    };

    const bytes = val * (multipliers[unit] || 1);

    const report = [
      '=====================================================',
      '             DATA STORAGE CONVERSION TABLE           ',
      '=====================================================',
      `Input: ${val} ${unit}`,
      '-----------------------------------------------------',
      `Bytes (B): ${(bytes).toLocaleString()} B`,
      `Kilobytes (KB): ${(bytes / 1024).toFixed(4)} KB`,
      `Megabytes (MB): ${(bytes / (1024 ** 2)).toFixed(4)} MB`,
      `Gigabytes (GB): ${(bytes / (1024 ** 3)).toFixed(6)} GB`,
      `Terabytes (TB): ${(bytes / (1024 ** 4)).toFixed(8)} TB`,
      `Petabytes (PB): ${(bytes / (1024 ** 5)).toFixed(10)} PB`,
      '=====================================================',
    ].join('\n');

    return [
      {
        name: 'unit-conversion.txt',
        type: 'text/plain',
        data: report,
        downloadName: 'unit-conversion.txt',
      },
    ];
  },
};
