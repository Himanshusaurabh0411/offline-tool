import { PDFDocument, degrees } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfOrganizePlugin: ToolPlugin = {
  id: 'pdf-organize',
  name: 'Organize, Rotate & Delete Pages',
  category: 'pdf',
  description: 'Rotate all or specific pages, delete unwanted pages, or reverse page order.',
  icon: 'RotateCw',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'rotateDegrees',
      label: 'Rotate Clockwise',
      type: 'select',
      defaultValue: '0',
      options: [
        { label: 'Do not rotate (0°)', value: '0' },
        { label: 'Rotate 90° Clockwise', value: '90' },
        { label: 'Rotate 180° Flip', value: '180' },
        { label: 'Rotate 270° (90° Counter-Clockwise)', value: '270' },
      ],
    },
    {
      id: 'deletePages',
      label: 'Pages to Delete (comma-separated, e.g. 2, 4)',
      type: 'string',
      defaultValue: '',
      description: 'Leave empty to keep all pages',
    },
    {
      id: 'reverseOrder',
      label: 'Reverse Page Order',
      type: 'boolean',
      defaultValue: false,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { rotateDegrees?: string; deletePages?: string; reverseOrder?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];
    const rotateAngle = parseInt(options.rotateDegrees || '0', 10);
    const deleteStr = options.deletePages?.trim() || '';
    const reverse = Boolean(options.reverseOrder);

    context.reportProgress(15, 'Loading PDF...');
    const srcDoc = await PDFDocument.load(file.data);
    const totalPages = srcDoc.getPageCount();

    // Parse pages to delete
    const pagesToDelete = new Set<number>();
    if (deleteStr) {
      deleteStr.split(',').forEach((p) => {
        const num = parseInt(p.trim(), 10);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          pagesToDelete.add(num - 1);
        }
      });
    }

    let indices: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (!pagesToDelete.has(i)) {
        indices.push(i);
      }
    }

    if (indices.length === 0) {
      throw new Error('All pages were deleted. At least one page must remain.');
    }

    if (reverse) {
      indices.reverse();
    }

    context.reportProgress(50, 'Organizing pages...');
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, indices);

    for (let i = 0; i < copiedPages.length; i++) {
      const page = copiedPages[i];
      if (rotateAngle !== 0) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotateAngle) % 360));
      }
      newDoc.addPage(page);
    }

    context.reportProgress(90, 'Saving organized document...');
    const bytes = await newDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-organized.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-organized.pdf`,
        metadata: { pageCount: copiedPages.length },
      },
    ];
  },
};
