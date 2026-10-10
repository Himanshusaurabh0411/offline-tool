import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { pdfMergePlugin } from '../tools/pdf/pdfMerge';
import { pdfSplitPlugin } from '../tools/pdf/pdfSplit';
import { pdfPageNumbersPlugin } from '../tools/pdf/pdfPageNumbers';
import { pdfWatermarkPlugin } from '../tools/pdf/pdfWatermark';
import { pdfTrueRedactionPlugin } from '../tools/pdf/pdfTrueRedaction';
import { imagesToPdfPlugin } from '../tools/pdf/imagesToPdf';
import { fileToToolInput, executeTool } from '../core/plugins/runner';

// Helper to create a test PDF in memory
async function createTestPdf(pageCount = 2, title = 'Test Document'): Promise<File> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`Page Content ${i + 1} - CONFIDENTIAL DATA 12345`, { x: 50, y: 500, size: 14 });
  }
  const bytes = await doc.save();
  return new File([bytes as any], `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`, {
    type: 'application/pdf',
  });
}

describe('Phase (b) PDF Tools Suite', () => {
  it('merges multiple PDF files into one', async () => {
    const pdf1 = await createTestPdf(2, 'Doc A');
    const pdf2 = await createTestPdf(3, 'Doc B');

    const results = await executeTool(pdfMergePlugin, [pdf1, pdf2], {});
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('application/pdf');
    expect(results[0].metadata?.pageCount).toBe(5);

    const mergedDoc = await PDFDocument.load(results[0].data as Uint8Array);
    expect(mergedDoc.getPageCount()).toBe(5);
  });

  it('splits a PDF file by custom range', async () => {
    const pdf = await createTestPdf(4, 'Multi Page Doc');
    const results = await executeTool(pdfSplitPlugin, [pdf], {
      splitMode: 'range',
      pageRange: '1-2',
    });

    expect(results).toHaveLength(1);
    const splitDoc = await PDFDocument.load(results[0].data as Uint8Array);
    expect(splitDoc.getPageCount()).toBe(2);
  });

  it('adds page numbers to all pages', async () => {
    const pdf = await createTestPdf(3, 'Numbered Doc');
    const results = await executeTool(pdfPageNumbersPlugin, [pdf], {
      position: 'bottom-center',
      format: 'page_of_total',
    });

    expect(results).toHaveLength(1);
    const doc = await PDFDocument.load(results[0].data as Uint8Array);
    expect(doc.getPageCount()).toBe(3);
  });

  it('applies text watermark with rotation and opacity', async () => {
    const pdf = await createTestPdf(1, 'Watermark Doc');
    const results = await executeTool(pdfWatermarkPlugin, [pdf], {
      watermarkText: 'TOP SECRET',
      opacity: 0.3,
    });

    expect(results).toHaveLength(1);
    const doc = await PDFDocument.load(results[0].data as Uint8Array);
    expect(doc.getPageCount()).toBe(1);
  });

  it('performs True Redaction and generates a passing audit verification report', async () => {
    const pdf = await createTestPdf(1, 'Secret File');
    const results = await executeTool(pdfTrueRedactionPlugin, [pdf], {
      redactTerms: 'CONFIDENTIAL, 12345',
    });

    expect(results).toHaveLength(2);
    const redactedPdf = results[0];
    const auditReport = results[1];

    expect(redactedPdf.metadata?.auditPassed).toBe(true);
    expect(typeof auditReport.data).toBe('string');
    expect(auditReport.data).toContain('VERIFIED 100% CLEAN');
    expect(auditReport.data).toContain('CONFIDENTIAL');
  });

  it('converts images into a single PDF', async () => {
    // Generate a minimal valid 1x1 PNG
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const binary = atob(pngBase64);
    const pngBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) pngBytes[i] = binary.charCodeAt(i);

    const imgFile1 = new File([pngBytes], 'sample1.png', { type: 'image/png' });
    const imgFile2 = new File([pngBytes], 'sample2.png', { type: 'image/png' });

    const results = await executeTool(imagesToPdfPlugin, [imgFile1, imgFile2], { pageSize: 'fit' });
    expect(results).toHaveLength(1);
    const doc = await PDFDocument.load(results[0].data as Uint8Array);
    expect(doc.getPageCount()).toBe(2);
  });
});
