import { describe, it, expect, beforeAll } from 'vitest';
import { WorkflowEngine } from '../workflows/engine';
import { WorkflowDefinition } from '../workflows/types';
import { metadataScrubberPlugin } from '../tools/dev/metadataScrubber';
import { fileHealthCheckPlugin } from '../tools/dev/fileHealthCheck';
import { pluginRegistry } from '../core/plugins/registry';
import { imageResizePlugin } from '../tools/images/imageResize';
import { imageCompressPlugin } from '../tools/images/imageCompress';
import { executeTool } from '../core/plugins/runner';

beforeAll(() => {
  pluginRegistry.register(imageResizePlugin);
  pluginRegistry.register(imageCompressPlugin);
  pluginRegistry.register(metadataScrubberPlugin);
  pluginRegistry.register(fileHealthCheckPlugin);

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
            width: 100,
            height: 100,
            getContext: () => ({
              drawImage: () => {},
              fillRect: () => {},
              strokeText: () => {},
              fillText: () => {},
              translate: () => {},
              rotate: () => {},
              scale: () => {},
              getImageData: (x: number, y: number, w: number, h: number) => ({
                data: new Uint8ClampedArray(w * h * 4).fill(128),
              }),
              putImageData: () => {},
            }),
            toBlob: (cb: any, type: string) => {
              cb(new Blob([new Uint8Array([1, 2, 3])], { type }));
            },
          };
        }
        return {} as any;
      },
    } as any;
  }
});

function createTestImage(name = 'sample.png'): File {
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const binary = atob(pngBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes as any], name, { type: 'image/png' });
}

describe('Phase (d) Workflow Builder & Privacy Tools', () => {
  it('executes chained workflow pipeline sequentially', async () => {
    const customWorkflow: WorkflowDefinition = {
      id: 'test-flow',
      name: 'Resize and Compress Test Pipeline',
      description: 'Chains image resize and compression',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      steps: [
        {
          id: 'step-1',
          toolId: 'image-resize',
          name: 'Resize Image',
          options: { scalePercent: 80 },
        },
        {
          id: 'step-2',
          toolId: 'image-compress',
          name: 'Compress Image',
          options: { quality: 70 },
        },
      ],
    };

    const initialFile = createTestImage('photo.png');
    let progressCalls = 0;

    const results = await WorkflowEngine.execute(
      customWorkflow,
      [initialFile],
      () => {
        progressCalls++;
      }
    );

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('image/webp');
    expect(progressCalls).toBeGreaterThan(0);
  });

  it('scrubs metadata and outputs before/after report', async () => {
    const file = createTestImage('camera-shot.png');
    const outputs = await executeTool(metadataScrubberPlugin, [file], {});

    expect(outputs).toHaveLength(2);
    const scrubbedFile = outputs[0];
    const auditReport = outputs[1];

    expect(scrubbedFile.name).toContain('scrubbed');
    expect(auditReport.name).toContain('metadata-audit');
    expect(typeof auditReport.data).toBe('string');
    expect(auditReport.data).toContain('BEFORE / AFTER METADATA AUDIT REPORT');
  });

  it('runs file health check and detects healthy test file', async () => {
    const file = createTestImage('valid-image.png');
    const outputs = await executeTool(fileHealthCheckPlugin, [file], { attemptRepair: true });

    expect(outputs).toHaveLength(1);
    const report = outputs[0];
    expect(report.metadata?.healthScore).toBeGreaterThanOrEqual(80);
    expect(typeof report.data).toBe('string');
    expect(report.data).toContain('Integrity Score');
  });
});
