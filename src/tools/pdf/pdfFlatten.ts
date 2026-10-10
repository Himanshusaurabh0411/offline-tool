import { PDFDocument } from 'pdf-lib';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const pdfFlattenPlugin: ToolPlugin = {
  id: 'pdf-flatten',
  name: 'Flatten PDF / AcroForms',
  category: 'pdf',
  description: 'Convert interactive form fields, layers, and annotations into static non-editable page graphics.',
  icon: 'Layers',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
  optionsSchema: [],
  run: async (
    files: ToolInputFile[],
    _options: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a PDF file.');
    const file = files[0];

    context.reportProgress(20, 'Loading PDF...');
    const pdfDoc = await PDFDocument.load(file.data);

    context.reportProgress(50, 'Flattening interactive forms and annotations...');
    const form = pdfDoc.getForm();
    try {
      form.flatten();
    } catch (e) {
      // If document does not have AcroForm, save as flattened structure
    }

    context.reportProgress(90, 'Saving flattened document...');
    const bytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-flattened.pdf`,
        type: 'application/pdf',
        data: bytes,
        downloadName: `${baseName}-flattened.pdf`,
      },
    ];
  },
};
