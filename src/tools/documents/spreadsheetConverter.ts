import * as XLSX from 'xlsx';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const spreadsheetConverterPlugin: ToolPlugin = {
  id: 'spreadsheet-converter',
  name: 'Spreadsheet Converter (XLSX ↔ CSV ↔ JSON)',
  category: 'documents',
  description: 'Convert Excel workbooks (.xlsx, .xls) to CSV or JSON, or convert CSV tables into formatted Excel spreadsheets.',
  icon: 'Table',
  acceptedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/json',
  ],
  acceptedExtensions: ['xlsx', 'xls', 'csv', 'json'],
  optionsSchema: [
    {
      id: 'targetFormat',
      label: 'Target Output Format',
      type: 'select',
      defaultValue: 'csv',
      options: [
        { label: 'CSV (Comma-Separated Values)', value: 'csv' },
        { label: 'JSON Array of Objects', value: 'json' },
        { label: 'Excel Workbook (.xlsx)', value: 'xlsx' },
        { label: 'HTML Table (.html)', value: 'html' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { targetFormat?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a spreadsheet or data file.');
    const target = options.targetFormat || 'csv';
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Processing ${file.name}...`);

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      let workbook: XLSX.WorkBook;

      if (ext === 'json') {
        const jsonStr = new TextDecoder().decode(file.data);
        const dataArray = JSON.parse(jsonStr);
        const worksheet = XLSX.utils.json_to_sheet(Array.isArray(dataArray) ? dataArray : [dataArray]);
        workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      } else if (ext === 'csv') {
        const csvStr = new TextDecoder().decode(file.data);
        workbook = XLSX.read(csvStr, { type: 'string' });
      } else {
        workbook = XLSX.read(file.data, { type: 'array' });
      }

      const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
      const firstSheet = workbook.Sheets[firstSheetName];

      if (target === 'csv') {
        const csvText = XLSX.utils.sheet_to_csv(firstSheet);
        outputs.push({
          name: `${baseName}.csv`,
          type: 'text/csv',
          data: csvText,
          downloadName: `${baseName}.csv`,
        });
      } else if (target === 'json') {
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        const jsonString = JSON.stringify(jsonData, null, 2);
        outputs.push({
          name: `${baseName}.json`,
          type: 'application/json',
          data: jsonString,
          downloadName: `${baseName}.json`,
        });
      } else if (target === 'html') {
        const htmlTable = XLSX.utils.sheet_to_html(firstSheet);
        const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title><style>body{font-family:system-ui;padding:2rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #cbd5e1;padding:8px 12px;text-align:left}th{background:#f8fafc}</style></head><body>${htmlTable}</body></html>`;
        outputs.push({
          name: `${baseName}.html`,
          type: 'text/html',
          data: doc,
          downloadName: `${baseName}.html`,
        });
      } else {
        // Output XLSX
        const xlsxBuf = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        outputs.push({
          name: `${baseName}.xlsx`,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          data: new Uint8Array(xlsxBuf),
          downloadName: `${baseName}.xlsx`,
        });
      }
    }

    return outputs;
  },
};
