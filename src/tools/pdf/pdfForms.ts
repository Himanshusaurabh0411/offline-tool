import { PDFDocument, rgb } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfFillFormsPlugin: ToolPlugin = {
  id: 'pdf-fill-forms',
  name: 'Fill PDF Forms & Annotate',
  category: 'pdf',
  description: 'Inspect and fill form fields (text boxes, checkmarks) or add annotations to any page.',
  icon: 'FileCheck',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [
    {
      id: 'fieldValues',
      label: 'Field Key-Value Pairs (JSON, e.g. {"Name": "Alex", "Date": "2026-10-09"})',
      type: 'string',
      defaultValue: '{"Full Name": "Jane Doe", "Date": "2026-10-09"}',
    },
    {
      id: 'annotationText',
      label: 'Optional Note / Sticky Annotation',
      type: 'string',
      defaultValue: 'Reviewed & Approved',
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { fieldValues?: string; annotationText?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];

    context.reportProgress(20, 'Loading PDF and inspecting form fields...');
    const pdfDoc = await PDFDocument.load(file.data);
    const form = pdfDoc.getForm();

    let parsedValues: Record<string, string> = {};
    try {
      if (options.fieldValues) {
        parsedValues = JSON.parse(options.fieldValues);
      }
    } catch {}

    const fields = form.getFields();
    context.reportProgress(40, `Found ${fields.length} form field(s). Filling values...`);

    for (const [key, val] of Object.entries(parsedValues)) {
      try {
        const textField = form.getTextField(key);
        if (textField) textField.setText(String(val));
      } catch {}
    }

    // Add annotation note on page 1 if specified
    if (options.annotationText && pdfDoc.getPageCount() > 0) {
      context.reportProgress(70, 'Adding annotation note...');
      const firstPage = pdfDoc.getPages()[0];
      firstPage.drawRectangle({
        x: 40,
        y: firstPage.getHeight() - 40,
        width: 160,
        height: 24,
        color: rgb(1, 0.95, 0.7),
        borderColor: rgb(0.9, 0.7, 0.2),
        borderWidth: 1,
      });
      firstPage.drawText(options.annotationText, {
        x: 46,
        y: firstPage.getHeight() - 32,
        size: 9,
        color: rgb(0.3, 0.2, 0.0),
      });
    }

    context.reportProgress(90, 'Saving filled PDF...');
    const bytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-filled.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-filled.pdf`,
        metadata: { fieldCount: fields.length },
      },
    ];
  },
};
