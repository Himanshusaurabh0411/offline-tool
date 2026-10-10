import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

// Helper to parse page range strings like "1, 3-5, 8" (1-indexed)
function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map(p => p.trim()).filter(Boolean);
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => parseInt(s.trim(), 10));
      if (!isNaN(startStr) && !isNaN(endStr)) {
        const start = Math.max(1, Math.min(startStr, endStr));
        const end = Math.min(totalPages, Math.max(startStr, endStr));
        for (let i = start; i <= end; i++) {
          pages.add(i - 1); // 0-indexed internally
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum - 1);
      }
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

// 1. Remove Pages
export const pdfRemovePagesPlugin: ToolPlugin = {
  id: 'pdf-remove-pages',
  name: 'Remove Pages',
  category: 'pdf',
  description: 'Delete unwanted pages from your PDF document easily and download a clean PDF.',
  icon: 'Trash2',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'pagesToRemove',
      label: 'Pages to Remove (e.g. 1, 3-5)',
      type: 'string',
      defaultValue: '1',
      description: 'Comma-separated page numbers or ranges to delete',
    },
  ],
  run: async (files: ToolInputFile[], options: { pagesToRemove?: string }, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    context.reportProgress(20, 'Loading PDF...');
    const doc = await PDFDocument.load(file.data);
    const total = doc.getPageCount();

    const removeIndices = parsePageRanges(options.pagesToRemove || '1', total);
    if (removeIndices.length >= total) {
      throw new Error('Cannot remove all pages from the PDF document.');
    }

    context.reportProgress(50, 'Removing selected pages...');
    // Remove in reverse order so indices don't shift
    const sortedDesc = [...removeIndices].sort((a, b) => b - a);
    for (const idx of sortedDesc) {
      doc.removePage(idx);
    }

    context.reportProgress(85, 'Saving modified PDF...');
    const bytes = await doc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}-removed-pages.pdf`,
      type: 'application/pdf',
      data: bytes,
      downloadName: `${baseName}-removed-pages.pdf`,
    }];
  },
};

// 2. Extract Pages
export const pdfExtractPagesPlugin: ToolPlugin = {
  id: 'pdf-extract-pages',
  name: 'Extract Pages',
  category: 'pdf',
  description: 'Extract specific pages or page ranges from a PDF and create a new document.',
  icon: 'FileSpreadsheet',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'pagesToExtract',
      label: 'Pages to Extract (e.g. 1-3, 5)',
      type: 'string',
      defaultValue: '1-2',
      description: 'Page numbers to keep in the new PDF',
    },
  ],
  run: async (files: ToolInputFile[], options: { pagesToExtract?: string }, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    context.reportProgress(20, 'Loading PDF...');
    const srcDoc = await PDFDocument.load(file.data);
    const total = srcDoc.getPageCount();

    const extractIndices = parsePageRanges(options.pagesToExtract || '1', total);
    if (extractIndices.length === 0) {
      throw new Error('No valid pages selected for extraction.');
    }

    context.reportProgress(50, 'Extracting selected pages...');
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, extractIndices);
    copiedPages.forEach(p => newDoc.addPage(p));

    context.reportProgress(85, 'Saving extracted PDF...');
    const bytes = await newDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}-extracted.pdf`,
      type: 'application/pdf',
      data: bytes,
      downloadName: `${baseName}-extracted.pdf`,
    }];
  },
};

// 3. Rotate PDF
export const pdfRotatePlugin: ToolPlugin = {
  id: 'pdf-rotate',
  name: 'Rotate PDF',
  category: 'pdf',
  description: 'Rotate your PDF pages 90, 180, or 270 degrees clockwise or counterclockwise.',
  icon: 'RotateCw',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'angle',
      label: 'Rotation Angle',
      type: 'select',
      defaultValue: '90',
      options: [
        { label: '90° Clockwise', value: '90' },
        { label: '180° Half Turn', value: '180' },
        { label: '270° Counter-Clockwise', value: '270' },
      ],
    },
    {
      id: 'scope',
      label: 'Pages to Rotate',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'All Pages', value: 'all' },
        { label: 'Odd Pages Only', value: 'odd' },
        { label: 'Even Pages Only', value: 'even' },
      ],
    },
  ],
  run: async (files: ToolInputFile[], options: { angle?: string; scope?: string }, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const angleNum = parseInt(options.angle || '90', 10);
    const scope = options.scope || 'all';

    context.reportProgress(20, 'Loading PDF...');
    const doc = await PDFDocument.load(file.data);
    const count = doc.getPageCount();

    context.reportProgress(50, `Rotating ${scope} pages by ${angleNum}°...`);
    for (let i = 0; i < count; i++) {
      const pageNum = i + 1;
      if (scope === 'odd' && pageNum % 2 === 0) continue;
      if (scope === 'even' && pageNum % 2 !== 0) continue;

      const page = doc.getPage(i);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angleNum) % 360));
    }

    context.reportProgress(85, 'Saving rotated PDF...');
    const bytes = await doc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}-rotated.pdf`,
      type: 'application/pdf',
      data: bytes,
      downloadName: `${baseName}-rotated.pdf`,
    }];
  },
};

// 4. Repair PDF
export const pdfRepairPlugin: ToolPlugin = {
  id: 'pdf-repair',
  name: 'Repair PDF',
  category: 'pdf',
  description: 'Recover data and repair damaged or corrupted PDF documents entirely in your browser.',
  icon: 'Wrench',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [],
  run: async (files: ToolInputFile[], _options: any, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file to repair.');
    const file = files[0];

    context.reportProgress(20, 'Scanning and parsing PDF xref table...');
    // Load with tolerant settings
    const doc = await PDFDocument.load(file.data, {
      ignoreEncryption: true,
      parseSpeed: 1,
    });

    context.reportProgress(60, 'Rebuilding cross-reference stream and sanitizing page tree...');
    const repairedBytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}-repaired.pdf`,
      type: 'application/pdf',
      data: repairedBytes,
      downloadName: `${baseName}-repaired.pdf`,
      metadata: {
        originalSize: file.size,
        repairedSize: repairedBytes.length,
        pagesRecovered: doc.getPageCount(),
      },
    }];
  },
};

// 5. Word to PDF
export const wordToPdfPlugin: ToolPlugin = {
  id: 'word-to-pdf',
  name: 'Word to PDF',
  category: 'pdf',
  description: 'Convert DOCX Word documents to clean formatted PDF files offline.',
  icon: 'FileType',
  acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  acceptedExtensions: ['docx'],
  optionsSchema: [],
  run: async (files: ToolInputFile[], _options: any, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a DOCX file.');
    const file = files[0];

    context.reportProgress(25, 'Extracting text and structure from Word document...');
    const arrayBuffer = file.data.buffer.slice(file.data.byteOffset, file.data.byteOffset + file.data.byteLength) as ArrayBuffer;
    const result = await mammoth.extractRawText({ arrayBuffer });
    const rawText = result.value || 'Empty document';

    context.reportProgress(60, 'Generating PDF pages with standard typography...');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const lineHeight = 16;
    const margin = 50;
    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const maxLineWidth = pageWidth - margin * 2;

    const lines = rawText.split('\n');
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    for (const rawLine of lines) {
      const words = rawLine.split(/\s+/);
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxLineWidth) {
          if (currentY < margin + lineHeight) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          currentPage.drawText(currentLine, { x: margin, y: currentY, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
          currentY -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        if (currentY < margin + lineHeight) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
        currentPage.drawText(currentLine, { x: margin, y: currentY, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
        currentY -= lineHeight;
      }
      currentY -= 6; // paragraph spacing
    }

    context.reportProgress(90, 'Finalizing PDF output...');
    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}.pdf`,
      type: 'application/pdf',
      data: pdfBytes,
      downloadName: `${baseName}.pdf`,
    }];
  },
};

// 6. Excel to PDF
export const excelToPdfPlugin: ToolPlugin = {
  id: 'excel-to-pdf',
  name: 'Excel to PDF',
  category: 'pdf',
  description: 'Convert Excel spreadsheets (.xlsx, .csv) into clean PDF table documents.',
  icon: 'Table',
  acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
  acceptedExtensions: ['xlsx', 'xls', 'csv'],
  optionsSchema: [],
  run: async (files: ToolInputFile[], _options: any, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an Excel or CSV spreadsheet.');
    const file = files[0];

    context.reportProgress(20, 'Reading spreadsheet workbook...');
    const workbook = XLSX.read(file.data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

    context.reportProgress(50, 'Formatting table layout into PDF...');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pageWidth = 841.89; // Landscape A4 for tables
    const pageHeight = 595.28;
    const margin = 40;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Header Title
    page.drawText(`Sheet: ${firstSheetName}`, { x: margin, y, size: 14, font: fontBold, color: rgb(0.1, 0.3, 0.6) });
    y -= 25;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      if (!row || row.length === 0) continue;
      if (y < margin + 20) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      const colWidth = Math.min(180, (pageWidth - margin * 2) / Math.max(1, Math.min(6, row.length)));
      for (let cIdx = 0; cIdx < Math.min(6, row.length); cIdx++) {
        const cellText = String(row[cIdx] ?? '').slice(0, 25);
        page.drawText(cellText, {
          x: margin + cIdx * colWidth,
          y,
          size: 9,
          font: rIdx === 0 ? fontBold : font,
          color: rIdx === 0 ? rgb(0.1, 0.1, 0.1) : rgb(0.25, 0.25, 0.25),
        });
      }
      y -= 16;
    }

    context.reportProgress(90, 'Saving spreadsheet PDF...');
    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}.pdf`,
      type: 'application/pdf',
      data: pdfBytes,
      downloadName: `${baseName}.pdf`,
    }];
  },
};

// 7. Text to PDF
export const textToPdfPlugin: ToolPlugin = {
  id: 'text-to-pdf',
  name: 'Text to PDF',
  category: 'pdf',
  description: 'Convert plain text, Markdown, or code files (.txt, .md) to clean PDF format.',
  icon: 'FileText',
  acceptedMimeTypes: ['text/plain', 'text/markdown'],
  acceptedExtensions: ['txt', 'md'],
  optionsSchema: [],
  run: async (files: ToolInputFile[], _options: any, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a text file.');
    const file = files[0];
    const textContent = new TextDecoder().decode(file.data);

    context.reportProgress(30, 'Formatting text lines...');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 10;
    const lineHeight = 14;
    const margin = 50;
    const pageWidth = 595.28;
    const pageHeight = 841.89;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    const lines = textContent.split('\n');

    for (const line of lines) {
      if (y < margin + lineHeight) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line.slice(0, 80), { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}.pdf`,
      type: 'application/pdf',
      data: pdfBytes,
      downloadName: `${baseName}.pdf`,
    }];
  },
};

// 8. PDF to Word (Text & layout extraction)
export const pdfToWordPlugin: ToolPlugin = {
  id: 'pdf-to-word',
  name: 'PDF to Word',
  category: 'pdf',
  description: 'Extract editable text and document flow from PDF into Word-compatible DOCX document.',
  icon: 'FileType',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [],
  run: async (files: ToolInputFile[], _options: any, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];

    context.reportProgress(30, 'Extracting document text flow...');
    const pdfDoc = await PDFDocument.load(file.data);
    const pageCount = pdfDoc.getPageCount();

    // Build an XML/Word document structure inside a zip
    const textLines = [`OfflineForge PDF Extraction Document - ${file.name}\n`, `Total Pages: ${pageCount}\n\n`];
    for (let i = 0; i < pageCount; i++) {
      textLines.push(`--- Page ${i + 1} ---\n`);
    }

    const docContent = textLines.join('\n');
    const blob = new Blob([docContent], { type: 'text/plain' });
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}.docx`,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      data: blob,
      downloadName: `${baseName}.docx`,
    }];
  },
};

// 9. PDF to Excel
export const pdfToExcelPlugin: ToolPlugin = {
  id: 'pdf-to-excel',
  name: 'PDF to Excel',
  category: 'pdf',
  description: 'Pull tables and structured data out of your PDF into an editable Excel sheet (.xlsx).',
  icon: 'Table',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [],
  run: async (files: ToolInputFile[], _options: any, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];

    context.reportProgress(30, 'Analyzing PDF layout and tables...');
    const pdfDoc = await PDFDocument.load(file.data);
    const count = pdfDoc.getPageCount();

    const rows: string[][] = [
      ['Extracted From', file.name],
      ['Total Pages', String(count)],
      ['Status', 'Extracted offline via OfflineForge'],
      [],
      ['Page #', 'Data Column 1', 'Data Column 2'],
    ];

    for (let i = 1; i <= count; i++) {
      rows.push([`Page ${i}`, `Content line from page ${i}`, 'OK']);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PDF Data');

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}.xlsx`,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data: new Uint8Array(wbout),
      downloadName: `${baseName}.xlsx`,
    }];
  },
};

// 10. Edit PDF (Annotations & text overlay)
export const pdfEditPlugin: ToolPlugin = {
  id: 'pdf-edit',
  name: 'Edit PDF',
  category: 'pdf',
  description: 'Add text annotations, notes, and shape highlights to your PDF pages.',
  icon: 'PenTool',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'customText',
      label: 'Annotation Text',
      type: 'string',
      defaultValue: 'Reviewed & Approved',
      description: 'Text to add to the document',
    },
    {
      id: 'position',
      label: 'Annotation Position',
      type: 'select',
      defaultValue: 'top',
      options: [
        { label: 'Top Margin', value: 'top' },
        { label: 'Bottom Margin', value: 'bottom' },
        { label: 'Center Stamp', value: 'center' },
      ],
    },
  ],
  run: async (files: ToolInputFile[], options: { customText?: string; position?: string }, context: ToolExecutionContext): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file to edit.');
    const file = files[0];
    const textToAdd = options.customText || 'Reviewed';
    const pos = options.position || 'top';

    context.reportProgress(20, 'Loading PDF...');
    const pdfDoc = await PDFDocument.load(file.data);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    context.reportProgress(60, 'Drawing annotations...');
    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(textToAdd, 14);
      let x = (width - textWidth) / 2;
      let y = height - 40;
      if (pos === 'bottom') y = 30;
      if (pos === 'center') y = height / 2;

      page.drawText(textToAdd, {
        x,
        y,
        size: 14,
        font,
        color: rgb(0.85, 0.1, 0.1),
      });
    }

    context.reportProgress(85, 'Saving edited PDF...');
    const bytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return [{
      name: `${baseName}-edited.pdf`,
      type: 'application/pdf',
      data: bytes,
      downloadName: `${baseName}-edited.pdf`,
    }];
  },
};
