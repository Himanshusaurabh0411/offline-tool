import { pluginRegistry } from '../core/plugins/registry';

// Dev & Core Plugins
import { hashCheckerPlugin } from './dev/hashChecker';
import { base64ToolPlugin } from './dev/base64Tool';
import { metadataScrubberPlugin } from './dev/metadataScrubber';
import { fileHealthCheckPlugin } from './dev/fileHealthCheck';
import { wordCounterPlugin, diffCheckerPlugin, regexTesterPlugin, unitConverterPlugin } from './dev/textDevTools';

// Document Suite Plugins
import { docxConverterPlugin } from './documents/docxConverter';
import { markdownHtmlPlugin } from './documents/markdownHtmlConverter';
import { spreadsheetConverterPlugin } from './documents/spreadsheetConverter';

// Archive & Data Plugins
import { zipCreatePlugin, zipExtractPlugin, bulkRenamePlugin } from './archives/zipTools';
import { jsonYamlConverterPlugin, xmlJsonConverterPlugin, qrGeneratorPlugin } from './archives/dataConverters';

// Media Plugins (Audio & Video)
import { audioConvertPlugin, audioTrimPlugin, videoExtractAudioPlugin, mediaSpeedPlugin } from './media/audioTools';

// Local AI Plugins
import {
  aiSummarizePlugin,
  aiExtractInfoPlugin,
  aiTranslatePlugin,
  aiSpeechToTextPlugin,
  aiImageCaptionPlugin,
} from './ai/localAiTools';

import {
  pdfRemovePagesPlugin,
  pdfExtractPagesPlugin,
  pdfRotatePlugin,
  pdfRepairPlugin,
  wordToPdfPlugin,
  excelToPdfPlugin,
  textToPdfPlugin,
  pdfToWordPlugin,
  pdfToExcelPlugin,
  pdfEditPlugin,
} from './pdf/additionalPdfTools';

// PDF Suite Plugins (17 tools)
import { pdfMergePlugin } from './pdf/pdfMerge';
import { pdfSplitPlugin } from './pdf/pdfSplit';
import { pdfOrganizePlugin } from './pdf/pdfOrganize';
import { pdfPageNumbersPlugin } from './pdf/pdfPageNumbers';
import { pdfWatermarkPlugin } from './pdf/pdfWatermark';
import { pdfCropPlugin } from './pdf/pdfCrop';
import { pdfFlattenPlugin } from './pdf/pdfFlatten';
import { pdfProtectPlugin, pdfUnlockPlugin } from './pdf/pdfProtectUnlock';
import { pdfCompressPlugin } from './pdf/pdfCompress';
import { pdfSignPlugin } from './pdf/pdfSign';
import { pdfFillFormsPlugin } from './pdf/pdfForms';
import { pdfTrueRedactionPlugin } from './pdf/pdfTrueRedaction';
import { imagesToPdfPlugin } from './pdf/imagesToPdf';
import { pdfToImagesPlugin } from './pdf/pdfToImages';
import { pdfToTextPlugin } from './pdf/pdfToText';
import { pdfVisualDiffPlugin } from './pdf/pdfVisualDiff';
import { pdfOcrPlugin } from './pdf/pdfOcr';

// Image Suite Plugins (11 tools)
import { imageConvertPlugin } from './images/imageConvert';
import { imageResizePlugin } from './images/imageResize';
import { imageCompressPlugin } from './images/imageCompress';
import { imageCropPlugin } from './images/imageCrop';
import { imageRotatePlugin } from './images/imageRotate';
import { imageExifPlugin } from './images/imageExif';
import { imageAsciiPlugin } from './images/imageAscii';
import { imageMemePlugin } from './images/imageMeme';
import { imageCollagePlugin } from './images/imageCollage';
import { imageUpscalePlugin } from './images/imageUpscale';
import { imageRemoveBgPlugin } from './images/imageRemoveBg';
import { passportPhotoPlugin } from './images/passportPhoto';
import { customSizeReducerPlugin } from './images/customSizeReducer';

export function registerInitialPlugins() {
  // 1. PDF Suite (Flagship)
  pluginRegistry.register(pdfMergePlugin);
  pluginRegistry.register(pdfSplitPlugin);
  pluginRegistry.register(pdfCompressPlugin);
  pluginRegistry.register(pdfToWordPlugin);
  pluginRegistry.register(wordToPdfPlugin);
  pluginRegistry.register(pdfToExcelPlugin);
  pluginRegistry.register(excelToPdfPlugin);
  pluginRegistry.register(imagesToPdfPlugin);
  pluginRegistry.register(pdfToImagesPlugin);
  pluginRegistry.register(pdfRemovePagesPlugin);
  pluginRegistry.register(pdfExtractPagesPlugin);
  pluginRegistry.register(pdfOrganizePlugin);
  pluginRegistry.register(pdfRotatePlugin);
  pluginRegistry.register(pdfPageNumbersPlugin);
  pluginRegistry.register(pdfWatermarkPlugin);
  pluginRegistry.register(pdfCropPlugin);
  pluginRegistry.register(pdfFlattenPlugin);
  pluginRegistry.register(pdfProtectPlugin);
  pluginRegistry.register(pdfUnlockPlugin);
  pluginRegistry.register(pdfRepairPlugin);
  pluginRegistry.register(pdfSignPlugin);
  pluginRegistry.register(pdfFillFormsPlugin);
  pluginRegistry.register(pdfTrueRedactionPlugin);
  pluginRegistry.register(textToPdfPlugin);
  pluginRegistry.register(pdfToTextPlugin);
  pluginRegistry.register(pdfVisualDiffPlugin);
  pluginRegistry.register(pdfOcrPlugin);
  pluginRegistry.register(pdfEditPlugin);

  // 2. Image Suite & Government Photos
  pluginRegistry.register(passportPhotoPlugin);
  pluginRegistry.register(customSizeReducerPlugin);
  pluginRegistry.register(imageConvertPlugin);
  pluginRegistry.register(imageResizePlugin);
  pluginRegistry.register(imageCompressPlugin);
  pluginRegistry.register(imageCropPlugin);
  pluginRegistry.register(imageRotatePlugin);
  pluginRegistry.register(imageRemoveBgPlugin);
  pluginRegistry.register(imageExifPlugin);
  pluginRegistry.register(imageAsciiPlugin);
  pluginRegistry.register(imageMemePlugin);
  pluginRegistry.register(imageCollagePlugin);
  pluginRegistry.register(imageUpscalePlugin);

  // 3. Documents
  pluginRegistry.register(docxConverterPlugin);
  pluginRegistry.register(markdownHtmlPlugin);
  pluginRegistry.register(spreadsheetConverterPlugin);

  // 4. Archives & Data
  pluginRegistry.register(zipCreatePlugin);
  pluginRegistry.register(zipExtractPlugin);
  pluginRegistry.register(bulkRenamePlugin);
  pluginRegistry.register(jsonYamlConverterPlugin);
  pluginRegistry.register(xmlJsonConverterPlugin);
  pluginRegistry.register(qrGeneratorPlugin);

  // 5. Media (Audio / Video)
  pluginRegistry.register(audioConvertPlugin);
  pluginRegistry.register(audioTrimPlugin);
  pluginRegistry.register(videoExtractAudioPlugin);
  pluginRegistry.register(mediaSpeedPlugin);

  // 6. Dev & Core
  pluginRegistry.register(hashCheckerPlugin);
  pluginRegistry.register(base64ToolPlugin);
  pluginRegistry.register(metadataScrubberPlugin);
  pluginRegistry.register(fileHealthCheckPlugin);
  pluginRegistry.register(wordCounterPlugin);
  pluginRegistry.register(diffCheckerPlugin);
  pluginRegistry.register(regexTesterPlugin);
  pluginRegistry.register(unitConverterPlugin);

  // 7. Local AI
  pluginRegistry.register(aiSummarizePlugin);
  pluginRegistry.register(aiExtractInfoPlugin);
  pluginRegistry.register(aiTranslatePlugin);
  pluginRegistry.register(aiSpeechToTextPlugin);
  pluginRegistry.register(aiImageCaptionPlugin);
}
