import React from 'react';
import {
  // Dev
  Fingerprint, Binary, ShieldAlert, Activity, AlignLeft,
  GitCompare, SearchCode, HardDrive,
  // Documents
  FileText, FileType, Table,
  // Archives
  Archive, FolderArchive, FileSignature, Code2, QrCode,
  // PDF
  Combine, Split, Minimize2, RotateCw, Hash, Stamp, Crop,
  Lock, Unlock, PenTool, FileSpreadsheet, FileCheck2, Eraser,
  FileType2, FileImage, ScanText,
  // Images
  RefreshCw, Maximize2, EyeOff, Terminal, Smile, LayoutGrid,
  Sparkles, Wand2, Image,
  // Media & AI
  ArrowLeftRight, Scissors, Music, Gauge, Cpu, Languages,
  Mic, ScanEye, Film, FileCode, FileArchive,
} from 'lucide-react';
import { ToolCategory } from '../../core/plugins/types';

/** Map each tool to its canonical accent color (used for icon strokes) */
function getIconColor(toolId: string, category: ToolCategory): string {
  // Organize PDF → red
  const organizePdf = ['pdf-merge', 'pdf-split', 'pdf-remove-pages', 'pdf-extract-pages', 'pdf-organize', 'pdf-rotate'];
  if (organizePdf.includes(toolId)) return '#E5322D';

  // Optimize PDF → emerald
  const optimizePdf = ['pdf-compress', 'pdf-repair', 'pdf-ocr'];
  if (optimizePdf.includes(toolId)) return '#059669';

  // Convert to PDF → amber
  const toPdf = ['images-to-pdf', 'word-to-pdf', 'excel-to-pdf', 'text-to-pdf'];
  if (toPdf.includes(toolId)) return '#D97706';

  // Convert from PDF → blue
  const fromPdf = ['pdf-to-images', 'pdf-to-word', 'pdf-to-excel', 'pdf-to-text'];
  if (fromPdf.includes(toolId)) return '#2563EB';

  // Edit PDF → purple
  const editPdf = ['pdf-page-numbers', 'pdf-watermark', 'pdf-crop', 'pdf-edit', 'pdf-flatten', 'pdf-forms'];
  if (editPdf.includes(toolId)) return '#7C3AED';

  // PDF Security → indigo
  const securityPdf = ['pdf-protect', 'pdf-unlock', 'pdf-sign', 'pdf-true-redaction', 'pdf-visual-diff'];
  if (securityPdf.includes(toolId)) return '#4338CA';

  // Dev tools → slate/indigo
  const devTools = ['hash-checker', 'base64-tool', 'metadata-scrubber', 'file-health-check', 'word-counter', 'diff-checker', 'regex-tester', 'unit-converter'];
  if (devTools.includes(toolId)) return '#4F46E5';

  // Docs → sky blue
  const docs = ['docx-converter', 'markdown-html', 'spreadsheet-converter'];
  if (docs.includes(toolId)) return '#0284C7';

  // Archives → orange
  const archives = ['zip-create', 'zip-extract', 'bulk-rename', 'json-yaml-converter', 'xml-json-converter', 'qr-generator'];
  if (archives.includes(toolId)) return '#EA580C';

  // Category fallback
  switch (category) {
    case 'pdf': return '#E5322D';
    case 'images': return '#059669';
    case 'documents': return '#2563EB';
    case 'media': return '#7C3AED';
    case 'archives': return '#EA580C';
    case 'dev': default: return '#4F46E5';
  }
}

/**
 * Universal Tool Icon – returns a Lucide icon pre-colored for the tool's category.
 * Size is determined by the parent container's CSS (use [&_svg]:w-N [&_svg]:h-N wrapper).
 */
export function getToolIcon(toolId: string, category: ToolCategory): React.ReactNode {
  const color = getIconColor(toolId, category);
  const props = { strokeWidth: 2, color };

  switch (toolId) {
    // --- Developer Tools ---
    case 'hash-checker':      return <Fingerprint {...props} />;
    case 'base64-tool':       return <Binary {...props} />;
    case 'metadata-scrubber': return <ShieldAlert {...props} />;
    case 'file-health-check': return <Activity {...props} />;
    case 'word-counter':      return <AlignLeft {...props} />;
    case 'diff-checker':      return <GitCompare {...props} />;
    case 'regex-tester':      return <SearchCode {...props} />;
    case 'unit-converter':    return <HardDrive {...props} />;

    // --- Documents ---
    case 'docx-converter':         return <FileText {...props} />;
    case 'markdown-html':          return <FileType {...props} />;
    case 'spreadsheet-converter':  return <Table {...props} />;

    // --- Archives ---
    case 'zip-create':          return <Archive {...props} />;
    case 'zip-extract':         return <FolderArchive {...props} />;
    case 'bulk-rename':         return <FileSignature {...props} />;
    case 'json-yaml-converter':
    case 'xml-json-converter':  return <Code2 {...props} />;
    case 'qr-generator':        return <QrCode {...props} />;

    // --- Organize PDF ---
    case 'pdf-merge':          return <Combine {...props} />;
    case 'pdf-split':          return <Split {...props} />;
    case 'pdf-remove-pages':   return <Eraser {...props} />;
    case 'pdf-extract-pages':  return <FileSpreadsheet {...props} />;
    case 'pdf-organize':       return <LayoutGrid {...props} />;
    case 'pdf-rotate':         return <RotateCw {...props} />;

    // --- Optimize PDF ---
    case 'pdf-compress': return <Minimize2 {...props} />;
    case 'pdf-repair':   return <Activity {...props} />;
    case 'pdf-ocr':      return <ScanText {...props} />;

    // --- Convert to PDF ---
    case 'images-to-pdf': return <FileType2 {...props} />;
    case 'word-to-pdf':   return <FileType {...props} />;
    case 'excel-to-pdf':  return <Table {...props} />;
    case 'text-to-pdf':   return <FileText {...props} />;

    // --- Convert from PDF ---
    case 'pdf-to-images': return <FileImage {...props} />;
    case 'pdf-to-word':   return <FileType {...props} />;
    case 'pdf-to-excel':  return <Table {...props} />;
    case 'pdf-to-text':   return <FileText {...props} />;

    // --- Edit PDF ---
    case 'pdf-page-numbers': return <Hash {...props} />;
    case 'pdf-watermark':    return <Stamp {...props} />;
    case 'pdf-crop':         return <Crop {...props} />;
    case 'pdf-edit':         return <PenTool {...props} />;
    case 'pdf-flatten':      return <FileCheck2 {...props} />;
    case 'pdf-forms':        return <FileSpreadsheet {...props} />;

    // --- PDF Security ---
    case 'pdf-protect':        return <Lock {...props} />;
    case 'pdf-unlock':         return <Unlock {...props} />;
    case 'pdf-sign':           return <PenTool {...props} />;
    case 'pdf-true-redaction': return <Eraser {...props} />;
    case 'pdf-visual-diff':    return <GitCompare {...props} />;

    // --- Image Suite ---
    case 'image-convert':    return <RefreshCw {...props} />;
    case 'image-resize':     return <Maximize2 {...props} />;
    case 'image-compress':   return <Minimize2 {...props} />;
    case 'image-crop':       return <Crop {...props} />;
    case 'image-rotate':     return <RotateCw {...props} />;
    case 'image-exif':       return <EyeOff {...props} />;
    case 'image-ascii':      return <Terminal {...props} />;
    case 'image-meme':       return <Smile {...props} />;
    case 'image-collage':    return <LayoutGrid {...props} />;
    case 'image-upscale':    return <Sparkles {...props} />;
    case 'image-remove-bg':  return <Wand2 {...props} />;

    // --- Audio / Video ---
    case 'audio-convert':      return <ArrowLeftRight {...props} />;
    case 'audio-trim':         return <Scissors {...props} />;
    case 'video-extract-audio':return <Music {...props} />;
    case 'media-speed':        return <Gauge {...props} />;

    // --- AI Tools ---
    case 'ai-summarize':     return <Sparkles {...props} />;
    case 'ai-extract-info':  return <Cpu {...props} />;
    case 'ai-translate':     return <Languages {...props} />;
    case 'ai-speech-to-text':return <Mic {...props} />;
    case 'ai-image-caption': return <ScanEye {...props} />;

    default:
      switch (category) {
        case 'pdf':       return <FileText {...props} />;
        case 'images':    return <Image {...props} />;
        case 'documents': return <FileCode {...props} />;
        case 'media':     return <Film {...props} />;
        case 'archives':  return <Archive {...props} />;
        case 'dev':
        default:          return <Terminal {...props} />;
      }
  }
}

/**
 * Category Visual Badge – colored pill with mini icon
 */
export const CategoryBadge: React.FC<{ category: ToolCategory }> = ({ category }) => {
  switch (category) {
    case 'pdf':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70">
          <FileText strokeWidth={2} className="w-2.5 h-2.5" />
          <span>PDF</span>
        </span>
      );
    case 'documents':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
          <FileCode strokeWidth={2} className="w-2.5 h-2.5" />
          <span>Docs</span>
        </span>
      );
    case 'images':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
          <Image strokeWidth={2} className="w-2.5 h-2.5" />
          <span>Images</span>
        </span>
      );
    case 'media':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70">
          <Film strokeWidth={2} className="w-2.5 h-2.5" />
          <span>Media</span>
        </span>
      );
    case 'archives':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
          <Archive strokeWidth={2} className="w-2.5 h-2.5" />
          <span>Archives</span>
        </span>
      );
    case 'dev':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
          <Code2 strokeWidth={2} className="w-2.5 h-2.5" />
          <span>Dev</span>
        </span>
      );
  }
};

/**
 * Extension Tag – file type pill with mini icon
 */
export const ExtensionTag: React.FC<{ ext: string }> = ({ ext }) => {
  const cleanExt = ext.replace(/^\./, '').toLowerCase();

  const getIcon = () => {
    if (['pdf'].includes(cleanExt)) return <FileText className="w-2.5 h-2.5 text-rose-500 shrink-0" />;
    if (['jpg','jpeg','png','webp','svg','gif','bmp','avif','heic'].includes(cleanExt))
      return <Image className="w-2.5 h-2.5 text-emerald-500 shrink-0" />;
    if (['docx','doc','txt','md','html','epub'].includes(cleanExt))
      return <FileCode className="w-2.5 h-2.5 text-blue-500 shrink-0" />;
    if (['xlsx','xls','csv'].includes(cleanExt))
      return <Table className="w-2.5 h-2.5 text-emerald-600 shrink-0" />;
    if (['zip','tar','gz','7z'].includes(cleanExt))
      return <FileArchive className="w-2.5 h-2.5 text-amber-500 shrink-0" />;
    if (['mp3','wav','ogg','aac','mp4','webm','mov'].includes(cleanExt))
      return <Film className="w-2.5 h-2.5 text-purple-500 shrink-0" />;
    if (['json','yaml','xml'].includes(cleanExt))
      return <Code2 className="w-2.5 h-2.5 text-indigo-500 shrink-0" />;
    return <FileType className="w-2.5 h-2.5 text-slate-400 shrink-0" />;
  };

  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
      {getIcon()}
      <span>.{cleanExt}</span>
    </span>
  );
};
