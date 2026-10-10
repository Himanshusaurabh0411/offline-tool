import { describe, it, expect } from 'vitest';
import { markdownHtmlPlugin } from '../tools/documents/markdownHtmlConverter';
import { spreadsheetConverterPlugin } from '../tools/documents/spreadsheetConverter';
import { zipCreatePlugin, zipExtractPlugin, bulkRenamePlugin } from '../tools/archives/zipTools';
import { jsonYamlConverterPlugin, qrGeneratorPlugin } from '../tools/archives/dataConverters';
import { wordCounterPlugin, diffCheckerPlugin } from '../tools/dev/textDevTools';
import { executeTool } from '../core/plugins/runner';

describe('Phase (e) Documents, Archives & Dev Tools Suite', () => {
  it('converts Markdown to HTML cleanly', async () => {
    const mdContent = '# Header Title\n\nThis is **bold** text and [link](https://offlineforge.local).';
    const mdFile = new File([mdContent], 'readme.md', { type: 'text/markdown' });

    const results = await executeTool(markdownHtmlPlugin, [mdFile], { direction: 'md2html' });
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('text/html');
    expect(results[0].data).toContain('<h1>Header Title</h1>');
    expect(results[0].data).toContain('<strong>bold</strong>');
  });

  it('converts CSV to JSON and vice-versa', async () => {
    const csvContent = 'name,age,role\nAlice,30,Engineer\nBob,25,Designer\n';
    const csvFile = new File([csvContent], 'users.csv', { type: 'text/csv' });

    const results = await executeTool(spreadsheetConverterPlugin, [csvFile], { targetFormat: 'json' });
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('application/json');

    const parsedJson = JSON.parse(results[0].data as string);
    expect(parsedJson).toHaveLength(2);
    expect(parsedJson[0].name).toBe('Alice');
    expect(parsedJson[1].role).toBe('Designer');
  });

  it('creates and extracts a ZIP archive', async () => {
    const file1 = new File(['Hello from file 1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['Hello from file 2'], 'file2.txt', { type: 'text/plain' });

    const zipResults = await executeTool(zipCreatePlugin, [file1, file2], { archiveName: 'bundle.zip' });
    expect(zipResults).toHaveLength(1);
    expect(zipResults[0].type).toBe('application/zip');

    // Extract the created zip
    const createdZipBlob = zipResults[0].data as Blob;
    const zipFile = new File([createdZipBlob], 'bundle.zip', { type: 'application/zip' });

    const extractResults = await executeTool(zipExtractPlugin, [zipFile], {});
    expect(extractResults).toHaveLength(2);
    const extractedNames = extractResults.map(r => r.name);
    expect(extractedNames).toContain('file1.txt');
    expect(extractedNames).toContain('file2.txt');
  });

  it('renames multiple files using naming pattern and sequential index', async () => {
    const f1 = new File(['a'], 'docA.txt', { type: 'text/plain' });
    const f2 = new File(['b'], 'docB.txt', { type: 'text/plain' });

    const results = await executeTool(bulkRenamePlugin, [f1, f2], {
      pattern: 'invoice_{n}',
      startNumber: 10,
    });

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('invoice_10.txt');
    expect(results[1].name).toBe('invoice_11.txt');
  });

  it('converts JSON to YAML syntax', async () => {
    const jsonStr = JSON.stringify({ app: 'OfflineForge', offline: true, rating: 5 });
    const jsonFile = new File([jsonStr], 'config.json', { type: 'application/json' });

    const results = await executeTool(jsonYamlConverterPlugin, [jsonFile], { direction: 'json2yaml' });
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('text/yaml');
    expect(results[0].data).toContain('app: OfflineForge');
    expect(results[0].data).toContain('offline: true');
  });

  it('generates QR code from text', async () => {
    const results = await executeTool(qrGeneratorPlugin, [], {
      qrContent: 'https://offlineforge.local',
      qrSize: 256,
    });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('image/png');
  });

  it('counts words, characters, and sentences accurately', async () => {
    const text = 'OfflineForge is private. It works in airplane mode. Zero bytes leave your browser!';
    const file = new File([text], 'sample.txt', { type: 'text/plain' });

    const results = await executeTool(wordCounterPlugin, [file], {});
    expect(results).toHaveLength(1);
    expect(results[0].metadata?.words).toBe(13);
    expect(results[0].metadata?.sentences).toBe(3);
  });

  it('detects line insertions and deletions with diff checker', async () => {
    const original = new File(['Line 1\nLine 2\nLine 3\n'], 'v1.txt', { type: 'text/plain' });
    const modified = new File(['Line 1\nLine 2 Modified\nLine 3\nLine 4\n'], 'v2.txt', { type: 'text/plain' });

    const results = await executeTool(diffCheckerPlugin, [original, modified], {});
    expect(results).toHaveLength(1);
    expect(results[0].data).toContain('+ Line 2 Modified');
    expect(results[0].data).toContain('- Line 2');
    expect(results[0].data).toContain('+ Line 4');
  });
});
