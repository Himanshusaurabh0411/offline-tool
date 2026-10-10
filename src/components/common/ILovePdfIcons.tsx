import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image,
  Film,
  Archive,
  Terminal,
  Camera,
  Gauge,
  Lock,
  Unlock,
  PenTool,
  Hash,
  Stamp,
  Crop,
  RotateCw,
  Scissors,
  Split,
  Layers,
  Sparkles,
  Search,
  ScanText,
  ShieldCheck,
  FileType,
  QrCode,
  Wrench,
  KeyRound,
  FileArchive,
  ArrowRightLeft,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface ToolIconProps {
  toolId: string;
  size?: number;
  className?: string;
}

export const ILovePdfToolIcon: React.FC<ToolIconProps> = ({ toolId, size = 20, className = '' }) => {
  const iconProps = {
    size,
    strokeWidth: 2,
    className: className || 'text-current',
  };

  switch (toolId) {
    // Passport & Photos
    case 'passport-photo-maker':
      return <Camera {...iconProps} className={`${iconProps.className} text-teal-600 dark:text-teal-400`} />;
    case 'custom-size-reducer':
      return <Gauge {...iconProps} className={`${iconProps.className} text-indigo-600 dark:text-indigo-400`} />;
    case 'image-resize':
      return <Maximize2 {...iconProps} className={`${iconProps.className} text-sky-600 dark:text-sky-400`} />;
    case 'image-compress':
      return <Minimize2 {...iconProps} className={`${iconProps.className} text-emerald-600 dark:text-emerald-400`} />;
    case 'image-crop':
      return <Crop {...iconProps} className={`${iconProps.className} text-purple-600 dark:text-purple-400`} />;
    case 'image-remove-bg':
      return <Sparkles {...iconProps} className={`${iconProps.className} text-amber-600 dark:text-amber-400`} />;
    case 'image-convert':
      return <ArrowRightLeft {...iconProps} className={`${iconProps.className} text-blue-600 dark:text-blue-400`} />;

    // Organize PDF
    case 'pdf-merge':
      return <Layers {...iconProps} className={`${iconProps.className} text-red-600 dark:text-red-400`} />;
    case 'pdf-split':
      return <Split {...iconProps} className={`${iconProps.className} text-red-600 dark:text-red-400`} />;
    case 'pdf-remove-pages':
      return <Scissors {...iconProps} className={`${iconProps.className} text-red-600 dark:text-red-400`} />;
    case 'pdf-extract-pages':
      return <FileText {...iconProps} className={`${iconProps.className} text-red-600 dark:text-red-400`} />;
    case 'pdf-organize':
      return <Layers {...iconProps} className={`${iconProps.className} text-red-600 dark:text-red-400`} />;
    case 'pdf-rotate':
      return <RotateCw {...iconProps} className={`${iconProps.className} text-red-600 dark:text-red-400`} />;

    // Optimize PDF
    case 'pdf-compress':
      return <Minimize2 {...iconProps} className={`${iconProps.className} text-emerald-600 dark:text-emerald-400`} />;
    case 'pdf-repair':
      return <Wrench {...iconProps} className={`${iconProps.className} text-emerald-600 dark:text-emerald-400`} />;
    case 'pdf-ocr':
      return <ScanText {...iconProps} className={`${iconProps.className} text-emerald-600 dark:text-emerald-400`} />;

    // Convert to PDF
    case 'images-to-pdf':
      return <Image {...iconProps} className={`${iconProps.className} text-amber-600 dark:text-amber-400`} />;
    case 'word-to-pdf':
      return <FileText {...iconProps} className={`${iconProps.className} text-blue-600 dark:text-blue-400`} />;
    case 'excel-to-pdf':
      return <FileSpreadsheet {...iconProps} className={`${iconProps.className} text-emerald-600 dark:text-emerald-400`} />;
    case 'text-to-pdf':
      return <FileType {...iconProps} className={`${iconProps.className} text-amber-600 dark:text-amber-400`} />;

    // Convert from PDF
    case 'pdf-to-images':
      return <Image {...iconProps} className={`${iconProps.className} text-blue-600 dark:text-blue-400`} />;
    case 'pdf-to-word':
      return <FileText {...iconProps} className={`${iconProps.className} text-blue-600 dark:text-blue-400`} />;
    case 'pdf-to-excel':
      return <FileSpreadsheet {...iconProps} className={`${iconProps.className} text-emerald-600 dark:text-emerald-400`} />;
    case 'pdf-to-text':
      return <FileType {...iconProps} className={`${iconProps.className} text-blue-600 dark:text-blue-400`} />;

    // Edit PDF
    case 'pdf-page-numbers':
      return <Hash {...iconProps} className={`${iconProps.className} text-purple-600 dark:text-purple-400`} />;
    case 'pdf-watermark':
      return <Stamp {...iconProps} className={`${iconProps.className} text-purple-600 dark:text-purple-400`} />;
    case 'pdf-crop':
      return <Crop {...iconProps} className={`${iconProps.className} text-purple-600 dark:text-purple-400`} />;
    case 'pdf-edit':
      return <PenTool {...iconProps} className={`${iconProps.className} text-purple-600 dark:text-purple-400`} />;
    case 'pdf-flatten':
      return <Layers {...iconProps} className={`${iconProps.className} text-purple-600 dark:text-purple-400`} />;

    // Security
    case 'pdf-protect':
      return <Lock {...iconProps} className={`${iconProps.className} text-indigo-600 dark:text-indigo-400`} />;
    case 'pdf-unlock':
      return <Unlock {...iconProps} className={`${iconProps.className} text-indigo-600 dark:text-indigo-400`} />;
    case 'pdf-sign':
      return <PenTool {...iconProps} className={`${iconProps.className} text-indigo-600 dark:text-indigo-400`} />;
    case 'pdf-true-redaction':
      return <Scissors {...iconProps} className={`${iconProps.className} text-indigo-600 dark:text-indigo-400`} />;
    case 'pdf-visual-diff':
      return <ArrowRightLeft {...iconProps} className={`${iconProps.className} text-indigo-600 dark:text-indigo-400`} />;

    // Dev Tools
    case 'hash-checker':
      return <KeyRound {...iconProps} className={`${iconProps.className} text-slate-700 dark:text-slate-300`} />;
    case 'base64-tool':
      return <Terminal {...iconProps} className={`${iconProps.className} text-slate-700 dark:text-slate-300`} />;
    case 'metadata-scrubber':
      return <ShieldCheck {...iconProps} className={`${iconProps.className} text-slate-700 dark:text-slate-300`} />;
    case 'file-health-check':
      return <Wrench {...iconProps} className={`${iconProps.className} text-slate-700 dark:text-slate-300`} />;
    case 'word-counter':
      return <FileType {...iconProps} className={`${iconProps.className} text-slate-700 dark:text-slate-300`} />;
    case 'diff-checker':
      return <ArrowRightLeft {...iconProps} className={`${iconProps.className} text-slate-700 dark:text-slate-300`} />;
    case 'regex-tester':
      return <Search {...iconProps} className={`${iconProps.className} text-slate-700 dark:text-slate-300`} />;
    case 'unit-converter':
      return <Gauge {...iconProps} className={`${iconProps.className} text-slate-700 dark:text-slate-300`} />;

    // Docs & Archives
    case 'docx-converter':
      return <FileText {...iconProps} className={`${iconProps.className} text-sky-600 dark:text-sky-400`} />;
    case 'markdown-html':
      return <FileCode {...iconProps} className={`${iconProps.className} text-sky-600 dark:text-sky-400`} />;
    case 'spreadsheet-converter':
      return <FileSpreadsheet {...iconProps} className={`${iconProps.className} text-emerald-600 dark:text-emerald-400`} />;
    case 'zip-create':
    case 'zip-extract':
      return <Archive {...iconProps} className={`${iconProps.className} text-amber-600 dark:text-amber-400`} />;
    case 'bulk-rename':
      return <FileText {...iconProps} className={`${iconProps.className} text-amber-600 dark:text-amber-400`} />;
    case 'qr-generator':
      return <QrCode {...iconProps} className={`${iconProps.className} text-amber-600 dark:text-amber-400`} />;

    default:
      return <FileText {...iconProps} className={`${iconProps.className} text-slate-500`} />;
  }
};
