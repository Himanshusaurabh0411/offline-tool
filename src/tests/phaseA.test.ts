import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pluginRegistry } from '../core/plugins/registry';
import { hashCheckerPlugin } from '../tools/dev/hashChecker';
import { base64ToolPlugin } from '../tools/dev/base64Tool';
import { detectFileFormat } from '../core/detector/fileSniffer';
import { executeTool, ExecutionController } from '../core/plugins/runner';
import { networkMonitor } from '../core/privacy/networkMonitor';

describe('Phase (a) Core Platform Tests', () => {
  beforeEach(() => {
    pluginRegistry.register(hashCheckerPlugin);
    pluginRegistry.register(base64ToolPlugin);
    networkMonitor.init();
  });

  it('registers and searches plugins correctly', () => {
    expect(pluginRegistry.get('hash-checker')).toBeDefined();
    expect(pluginRegistry.get('base64-tool')).toBeDefined();

    const searchResults = pluginRegistry.search('hash');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].id).toBe('hash-checker');
  });

  it('detects magic bytes for PDF format accurately', async () => {
    // PDF magic bytes %PDF (0x25, 0x50, 0x44, 0x46)
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]);
    const mockPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    const detection = await detectFileFormat(mockPdfBlob);
    expect(detection.category).toBe('pdf');
    expect(detection.extension).toBe('pdf');
    expect(detection.suggestedToolIds).toContain('pdf-compress');
  });

  it('detects magic bytes for PNG format accurately', async () => {
    // PNG magic bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const mockPngBlob = new Blob([pngBytes], { type: 'image/png' });

    const detection = await detectFileFormat(mockPngBlob);
    expect(detection.category).toBe('image');
    expect(detection.extension).toBe('png');
  });

  it('runs Hash Checker plugin and reports progress', async () => {
    const file = new File(['Hello OfflineForge!'], 'test.txt', { type: 'text/plain' });
    const progressSpy = vi.fn();

    const outputs = await executeTool(
      hashCheckerPlugin,
      [file],
      { algorithm: 'SHA-256' },
      progressSpy
    );

    expect(outputs).toHaveLength(1);
    expect(outputs[0].metadata?.algo).toBe('SHA-256');
    expect(outputs[0].metadata?.hash).toBeDefined();
    expect(progressSpy).toHaveBeenCalled();
  });

  it('cancels tool execution when requested', async () => {
    const file = new File(['Hello OfflineForge!'], 'test.txt', { type: 'text/plain' });
    const controller = new ExecutionController();
    controller.cancel();

    await expect(
      executeTool(hashCheckerPlugin, [file], { algorithm: 'SHA-256' }, undefined, controller)
    ).rejects.toThrow('Operation cancelled by user.');
  });
});
