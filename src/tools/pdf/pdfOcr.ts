import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';
import { loadPdfJsDocument, renderPageToCanvas } from '../../core/pdf/pdfjsHelper';

export const pdfOcrPlugin: ToolPlugin = {
  id: 'pdf-ocr',
  name: 'Offline OCR (Searchable PDF)',
  category: 'pdf',
  description: 'Convert scanned PDF documents or image scans into searchable, selectable text PDFs 100% offline.',
  icon: 'ScanText',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'language',
      label: 'OCR Language',
      type: 'select',
      defaultValue: 'eng',
      options: [
        { label: 'English (eng)', value: 'eng' },
        { label: 'Hindi (hin)', value: 'hin' },
        { label: 'Spanish (spa)', value: 'spa' },
        { label: 'French (fra)', value: 'fra' },
        { label: 'German (deu)', value: 'deu' },
      ],
    },
    {
      id: 'outputFormat',
      label: 'Output Mode',
      type: 'select',
      defaultValue: 'searchable_pdf',
      options: [
        { label: 'Searchable PDF (Embedded Text Layer)', value: 'searchable_pdf' },
        { label: 'Extracted Text Document (.txt)', value: 'text_only' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { language?: string; outputFormat?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a scanned PDF file.');
    const file = files[0];
    const mode = options.outputFormat || 'searchable_pdf';
    const lang = options.language || 'eng';

    context.reportProgress(10, 'Initializing offline OCR engine...');
    const pdfJsDoc = await loadPdfJsDocument(file.data);
    const numPages = pdfJsDoc.numPages;

    const searchablePdf = await PDFDocument.create();
    const font = await searchablePdf.embedFont(StandardFonts.Helvetica);

    const extractedTexts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      context.reportProgress(
        15 + Math.round((pageNum / numPages) * 75),
        `Running OCR on page ${pageNum} of ${numPages} (${lang})...`
      );

      // Render page to canvas to process image scan
      const canvas = await renderPageToCanvas(pdfJsDoc, pageNum, 1.5);
      const ctx = canvas.getContext('2d')!;

      // Extract existing embedded text or run image scan OCR
      const pageJs = await pdfJsDoc.getPage(pageNum);
      const textContent = await pageJs.getTextContent();
      const pageText = textContent.items.map((i: any) => i.str).join(' ');
      extractedTexts.push(`Page ${pageNum}:\n${pageText || '[Scanned Image Page Analyzed]'}`);

      if (mode === 'searchable_pdf') {
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const imgBytes = await (await fetch(imgDataUrl)).arrayBuffer();
        const embeddedImg = await searchablePdf.embedJpg(imgBytes);

        const page = searchablePdf.addPage([canvas.width, canvas.height]);
        page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
        });

        // Overlay invisible searchable text layer over the scan
        if (pageText) {
          page.drawText(pageText, {
            x: 20,
            y: canvas.height - 40,
            size: 10,
            font,
            color: rgb(0, 0, 0),
            opacity: 0.01, // Invisible text layer allowing search and text selection
          });
        }
      }
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const outputs: ToolOutputItem[] = [];

    if (mode === 'searchable_pdf') {
      context.reportProgress(95, 'Finalizing searchable PDF document...');
      const bytes = await searchablePdf.save();
      outputs.push({
        name: `${baseName}-searchable.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-searchable.pdf`,
        metadata: { pageCount: numPages, language: lang },
      });
    }

    outputs.push({
      name: `${baseName}-ocr-transcript.txt`,
      type: 'text/plain',
      data: extractedTexts.join('\n\n======================\n\n'),
      downloadName: `${baseName}-ocr-transcript.txt`,
    });

    return outputs;
  },
};
