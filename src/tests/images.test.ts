import { describe, it, expect, beforeAll } from 'vitest';
import { imageConvertPlugin } from '../tools/images/imageConvert';
import { imageResizePlugin } from '../tools/images/imageResize';
import { imageCompressPlugin } from '../tools/images/imageCompress';
import { imageAsciiPlugin } from '../tools/images/imageAscii';
import { imageMemePlugin } from '../tools/images/imageMeme';
import { imageCollagePlugin } from '../tools/images/imageCollage';
import { imageExifPlugin } from '../tools/images/imageExif';
import { imageRemoveBgPlugin } from '../tools/images/imageRemoveBg';
import { passportPhotoPlugin } from '../tools/images/passportPhoto';
import { executeTool } from '../core/plugins/runner';

// Polyfill canvas & ImageBitmap for Node.js test environment
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
            width: 100,
            height: 100,
            getContext: () => ({
              drawImage: () => {},
              fillRect: () => {},
              strokeRect: () => {},
              save: () => {},
              restore: () => {},
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

// Helper to create a valid test PNG
function createTestImage(name = 'sample.png'): File {
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const binary = atob(pngBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes as any], name, { type: 'image/png' });
}

describe('Phase (c) Image Processing Suite', () => {
  it('converts image format cleanly', async () => {
    const img = createTestImage('test-image.png');
    const results = await executeTool(imageConvertPlugin, [img], {
      targetFormat: 'image/webp',
      quality: 85,
    });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('image/webp');
    expect(results[0].name).toBe('test-image.webp');
  });

  it('resizes image to target scale', async () => {
    const img = createTestImage('resize-test.png');
    const results = await executeTool(imageResizePlugin, [img], {
      scalePercent: 200,
    });

    expect(results).toHaveLength(1);
    expect(results[0].metadata?.newWidth).toBeDefined();
  });

  it('compresses image with quality setting', async () => {
    const img = createTestImage('compress-test.png');
    const results = await executeTool(imageCompressPlugin, [img], {
      quality: 60,
      scale: 100,
    });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('image/webp');
    expect(results[0].metadata?.savings).toBeDefined();
  });

  it('generates ASCII art from image', async () => {
    const img = createTestImage('ascii-test.png');
    const results = await executeTool(imageAsciiPlugin, [img], {
      widthChars: 50,
      coloredHtml: false,
    });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('text/plain');
    expect(typeof results[0].data).toBe('string');
    expect((results[0].data as string).length).toBeGreaterThan(0);
  });

  it('generates meme image with captions', async () => {
    const img = createTestImage('meme-template.png');
    const results = await executeTool(imageMemePlugin, [img], {
      topText: 'OFFLINE MODE',
      bottomText: 'ACTIVATED',
      fontSize: 32,
    });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('image/png');
  });

  it('stitches multiple photos into a collage', async () => {
    const img1 = createTestImage('pic1.png');
    const img2 = createTestImage('pic2.png');
    const results = await executeTool(imageCollagePlugin, [img1, img2], {
      layout: 'horizontal',
      gap: 8,
    });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('image/png');
    expect(results[0].metadata?.imagesCombined).toBe(2);
  });

  it('extracts and scrubs EXIF metadata', async () => {
    const img = createTestImage('photo.png');
    const results = await executeTool(imageExifPlugin, [img], {
      stripExif: true,
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].type).toBe('text/plain');
    expect(results[0].name).toContain('exif-report');
  });

  it('removes or replaces background with transparent alpha or color', async () => {
    const img = createTestImage('portrait.png');
    const results = await executeTool(imageRemoveBgPlugin, [img], {
      bgColor: 'transparent',
      tolerance: 32,
    });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('image/png');
    expect(results[0].name).toContain('nobg');
  });

  it('generates biometric passport photo with AI background removal and 4x6 sheet', async () => {
    const img = createTestImage('passport-candidate.png');
    const results = await executeTool(passportPhotoPlugin, [img], {
      format: 'in-35x45',
      bgColor: 'white',
      removeBg: true,
      createPrintSheet: true,
    });

    expect(results.length).toBe(2);
    expect(results[0].type).toBe('image/jpeg');
    expect(results[0].name).toContain('passport-photo');
    expect(results[1].name).toContain('4x6-print-sheet');
  });
});
