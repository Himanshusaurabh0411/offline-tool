import { describe, it, expect, beforeAll } from 'vitest';
import {
  aiSummarizePlugin,
  aiExtractInfoPlugin,
  aiTranslatePlugin,
  aiImageCaptionPlugin,
} from '../tools/ai/localAiTools';
import { executeTool } from '../core/plugins/runner';

beforeAll(() => {
  if (typeof globalThis.createImageBitmap === 'undefined') {
    globalThis.createImageBitmap = async () =>
      ({
        width: 100,
        height: 100,
        close: () => {},
      } as any);
  }

  if (typeof globalThis.document === 'undefined' || !globalThis.document.createElement) {
    globalThis.document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 64,
            height: 64,
            getContext: () => ({
              drawImage: () => {},
              getImageData: (x: number, y: number, w: number, h: number) => ({
                data: new Uint8ClampedArray(w * h * 4).fill(180),
              }),
            }),
          };
        }
        return {} as any;
      },
    } as any;
  }
});

describe('Phase (f) Media & Local AI Tools Suite', () => {
  it('summarizes document text and extracts core takeaways', async () => {
    const documentText = [
      'OfflineForge is a private client-side file toolkit.',
      'All heavy data processing executes directly inside the web browser using WebAssembly and Web Workers.',
      'User files never leave the machine under any circumstance.',
      'The privacy proof panel provides continuous network verification showing zero bytes sent.',
      'Workflows can chain multiple operations together seamlessly in airplane mode.',
    ].join(' ');

    const file = new File([documentText], 'report.txt', { type: 'text/plain' });
    const results = await executeTool(aiSummarizePlugin, [file], { summaryLength: 'short' });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('text/plain');
    expect(results[0].data).toContain('OFFLINEFORGE AI EXECUTIVE SUMMARY');
    expect(results[0].metadata?.takeaways).toBeGreaterThan(0);
  });

  it('extracts dates, amounts, and contact details from document', async () => {
    const text = 'Invoice Date: Oct 9, 2026. Total Amount Due: $1,250.00. Please contact support@offlineforge.local or call 555-123-4567.';
    const file = new File([text], 'invoice.txt', { type: 'text/plain' });

    const results = await executeTool(aiExtractInfoPlugin, [file], {});
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('application/json');

    const parsed = JSON.parse(results[0].data as string);
    expect(parsed.entities.emailAddresses).toContain('support@offlineforge.local');
    expect(parsed.entities.datesFound.length).toBeGreaterThan(0);
    expect(parsed.entities.monetaryAmountsFound.length).toBeGreaterThan(0);
  });

  it('translates text offline with token-alignment matrix', async () => {
    const text = 'Hello world. Fast, secure, offline file privacy.';
    const file = new File([text], 'greeting.txt', { type: 'text/plain' });

    const results = await executeTool(aiTranslatePlugin, [file], { targetLanguage: 'hi' });
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('text/plain');
    // 'नमस्ते' should be present for 'hello', 'गोपनीयता' for 'privacy'
    expect(results[0].data).toContain('नमस्ते');
    expect(results[0].data).toContain('गोपनीयता');
  });

  it('generates accessibility caption and alt-text for image', async () => {
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const binary = atob(pngBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const imgFile = new File([bytes as any], 'photo.png', { type: 'image/png' });

    const results = await executeTool(aiImageCaptionPlugin, [imgFile], {});
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('text/plain');
    expect(results[0].metadata?.caption).toBeDefined();
    expect(results[0].data).toContain('RGB palette');
  });
});
