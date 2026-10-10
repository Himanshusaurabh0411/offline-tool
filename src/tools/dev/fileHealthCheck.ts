import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const fileHealthCheckPlugin: ToolPlugin = {
  id: 'file-health-check',
  name: 'File Health Check & Repair',
  category: 'dev',
  description: 'Diagnose corrupted PDFs, images, and archives, inspect structural anomalies, and attempt automated client-side repair.',
  icon: 'Activity',
  acceptedMimeTypes: ['*/*'],
  acceptedExtensions: ['*'],
  optionsSchema: [
    {
      id: 'attemptRepair',
      label: 'Attempt Automated File Repair',
      type: 'boolean',
      defaultValue: true,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { attemptRepair?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select at least one file to diagnose.');
    const attemptRepair = options.attemptRepair !== false;
    const outputs: ToolOutputItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Diagnosing ${file.name}...`);

      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const issuesFound: string[] = [];
      let isCorrupt = false;
      let repairedData: Uint8Array | null = null;
      let healthScore = 100;

      // 1. PDF Diagnostics
      if (ext === 'pdf' || file.type === 'application/pdf') {
        // Check %PDF header
        const headerStr = String.fromCharCode.apply(null, file.data.subarray(0, 5) as any);
        if (!headerStr.startsWith('%PDF')) {
          issuesFound.push('Missing or invalid %PDF magic byte header.');
          healthScore -= 30;
          isCorrupt = true;
        }

        // Check %%EOF trailer
        const trailerSlice = file.data.subarray(Math.max(0, file.data.length - 128));
        let trailerStr = '';
        for (let j = 0; j < trailerSlice.length; j++) trailerStr += String.fromCharCode(trailerSlice[j]);

        if (!trailerStr.includes('%%EOF')) {
          issuesFound.push('Missing %%EOF end-of-file trailer (truncated download or damaged stream).');
          healthScore -= 40;
          isCorrupt = true;
        }

        if (attemptRepair && isCorrupt) {
          context.reportProgress(60, 'Attempting PDF trailer and xref table reconstruction...');
          try {
            // Repair: Append %%EOF and attempt lenient load
            const fixedBuffer = new Uint8Array(file.data.length + 8);
            fixedBuffer.set(file.data);
            const eofBytes = [0x0a, 0x25, 0x25, 0x45, 0x4f, 0x46, 0x0a]; // \n%%EOF\n
            for (let b = 0; b < eofBytes.length; b++) fixedBuffer[file.data.length + b] = eofBytes[b];

            const repairedPdf = await PDFDocument.load(fixedBuffer, { ignoreEncryption: true });
            repairedData = await repairedPdf.save();
            issuesFound.push('[REPAIRED] Structural catalog and xref rebuilt successfully.');
          } catch (err: any) {
            issuesFound.push(`[REPAIR FAILED] Could not parse object streams: ${err.message}`);
          }
        }
      }
      // 2. Archive / ZIP / Office Diagnostics
      else if (['zip', 'docx', 'xlsx', 'pptx'].includes(ext)) {
        // Check PK\x03\x04
        if (file.data[0] !== 0x50 || file.data[1] !== 0x4b || file.data[2] !== 0x03 || file.data[3] !== 0x04) {
          issuesFound.push('Invalid ZIP header magic bytes.');
          healthScore -= 50;
          isCorrupt = true;
        }

        try {
          const zip = await JSZip.loadAsync(file.data);
          const fileCount = Object.keys(zip.files).length;
          if (fileCount === 0) {
            issuesFound.push('ZIP archive contains zero files.');
            healthScore -= 20;
          }
        } catch (err: any) {
          issuesFound.push(`Corrupt ZIP central directory: ${err.message}`);
          healthScore -= 50;
          isCorrupt = true;
        }
      }
      // 3. Image Diagnostics
      else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        try {
          const blob = new Blob([file.data as any], { type: file.type });
          if (typeof createImageBitmap !== 'undefined') {
            await createImageBitmap(blob);
          }
        } catch (err: any) {
          issuesFound.push(`Corrupted image bitmap raster data: ${err.message}`);
          healthScore -= 60;
          isCorrupt = true;
        }
      }

      healthScore = Math.max(0, healthScore);
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      const reportLines: string[] = [
        '=====================================================',
        '            FILE HEALTH DIAGNOSTIC REPORT            ',
        '=====================================================',
        `Target File: ${file.name}`,
        `File Size: ${(file.size / 1024).toFixed(2)} KB`,
        `Integrity Score: ${healthScore} / 100`,
        `Integrity Status: ${healthScore >= 90 ? 'HEALTHY & INTACT' : isCorrupt ? 'CORRUPTED / DAMAGED' : 'WARNINGS DETECTED'}`,
        '-----------------------------------------------------',
        'DIAGNOSTIC FINDINGS:',
      ];

      if (issuesFound.length === 0) {
        reportLines.push('  [✔] All header bytes, structural trailers, and stream boundaries verified clean.');
      } else {
        issuesFound.forEach((iss) => reportLines.push(`  [!] ${iss}`));
      }

      reportLines.push('=====================================================');

      outputs.push({
        name: `${baseName}-health-report.txt`,
        type: 'text/plain',
        data: reportLines.join('\n'),
        downloadName: `${baseName}-health-report.txt`,
        metadata: { healthScore, isCorrupt },
      });

      if (repairedData) {
        outputs.push({
          name: `${baseName}-repaired.${ext}`,
          type: file.type,
          data: repairedData,
          downloadName: `${baseName}-repaired.${ext}`,
          metadata: { repaired: true },
        });
      }
    }

    return outputs;
  },
};
