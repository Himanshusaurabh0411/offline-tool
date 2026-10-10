import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';
import { loadPdfJsDocument, renderPageToCanvas } from '../../core/pdf/pdfjsHelper';

export const pdfVisualDiffPlugin: ToolPlugin = {
  id: 'pdf-visual-diff',
  name: 'Compare Two PDFs (Visual Diff)',
  category: 'pdf',
  description: 'Visually compare two PDF documents side-by-side with pixel-level discrepancy highlighting.',
  icon: 'GitCompare',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'diffColor',
      label: 'Diff Highlight Color',
      type: 'select',
      defaultValue: 'magenta',
      options: [
        { label: 'Magenta / Red (#E11D48)', value: 'magenta' },
        { label: 'Cyan / Blue (#0284C7)', value: 'cyan' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { diffColor?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length < 2) {
      throw new Error('Please select exactly 2 PDF files to visually compare.');
    }

    const [fileA, fileB] = files;
    context.reportProgress(10, 'Loading both PDF documents...');

    const pdfA = await loadPdfJsDocument(fileA.data);
    const pdfB = await loadPdfJsDocument(fileB.data);

    const maxPages = Math.max(pdfA.numPages, pdfB.numPages);
    const outputs: ToolOutputItem[] = [];

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      context.reportProgress(
        15 + Math.round((pageNum / maxPages) * 75),
        `Comparing page ${pageNum} of ${maxPages}...`
      );

      const hasPageA = pageNum <= pdfA.numPages;
      const hasPageB = pageNum <= pdfB.numPages;

      if (!hasPageA || !hasPageB) {
        // Page missing in one document
        continue;
      }

      const canvasA = await renderPageToCanvas(pdfA, pageNum, 1.5);
      const canvasB = await renderPageToCanvas(pdfB, pageNum, 1.5);

      const width = Math.max(canvasA.width, canvasB.width);
      const height = Math.max(canvasA.height, canvasB.height);

      // Create Diff Canvas
      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = width;
      diffCanvas.height = height;
      const diffCtx = diffCanvas.getContext('2d')!;

      const ctxA = canvasA.getContext('2d')!;
      const ctxB = canvasB.getContext('2d')!;

      const imgDataA = ctxA.getImageData(0, 0, canvasA.width, canvasA.height);
      const imgDataB = ctxB.getImageData(0, 0, canvasB.width, canvasB.height);
      const diffImgData = diffCtx.createImageData(width, height);

      let differentPixels = 0;
      const totalPixels = width * height;

      for (let i = 0; i < totalPixels * 4; i += 4) {
        const r1 = imgDataA.data[i] || 255;
        const g1 = imgDataA.data[i + 1] || 255;
        const b1 = imgDataA.data[i + 2] || 255;

        const r2 = imgDataB.data[i] || 255;
        const g2 = imgDataB.data[i + 1] || 255;
        const b2 = imgDataB.data[i + 2] || 255;

        const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

        if (diff > 30) {
          // Pixel differs! Highlight in magenta/red
          differentPixels++;
          diffImgData.data[i] = 225; // R
          diffImgData.data[i + 1] = 29; // G
          diffImgData.data[i + 2] = 72; // B
          diffImgData.data[i + 3] = 255; // Alpha
        } else {
          // Grayscale background of document
          const gray = Math.round((r1 + g1 + b1) / 3 * 0.7 + 76);
          diffImgData.data[i] = gray;
          diffImgData.data[i + 1] = gray;
          diffImgData.data[i + 2] = gray;
          diffImgData.data[i + 3] = 255;
        }
      }

      diffCtx.putImageData(diffImgData, 0, 0);

      const diffPercent = ((differentPixels / totalPixels) * 100).toFixed(2);
      const blob: Blob = await new Promise((res) => diffCanvas.toBlob((b) => res(b!), 'image/png'));

      outputs.push({
        name: `diff-page-${pageNum}.png`,
        type: 'image/png',
        data: blob,
        downloadName: `diff-page-${pageNum}.png`,
        metadata: {
          pageNum,
          differentPixels,
          differencePercent: `${diffPercent}%`,
        },
      });
    }

    return outputs;
  },
};
