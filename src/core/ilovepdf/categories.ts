export type ILovePdfCategoryId =
  | 'all'
  | 'photos'
  | 'organize'
  | 'optimize'
  | 'to-pdf'
  | 'from-pdf'
  | 'edit'
  | 'security'
  | 'dev'
  | 'docs'
  | 'archives';

export interface CategoryTheme {
  id: ILovePdfCategoryId;
  label: string;
  colorName: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  buttonBg: string;
  buttonHover: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORY_THEMES: Record<ILovePdfCategoryId, CategoryTheme> = {
  all: {
    id: 'all',
    label: 'All',
    colorName: 'slate',
    iconColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    buttonBg: 'bg-slate-900',
    buttonHover: 'hover:bg-slate-800',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
  },
  photos: {
    id: 'photos',
    label: 'Passport & Photos',
    colorName: 'teal',
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    buttonBg: 'bg-teal-600',
    buttonHover: 'hover:bg-teal-700',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
  },
  organize: {
    id: 'organize',
    label: 'Organize PDF',
    colorName: 'red',
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    buttonBg: 'bg-red-600',
    buttonHover: 'hover:bg-red-700',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
  },
  optimize: {
    id: 'optimize',
    label: 'Optimize PDF',
    colorName: 'green',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    buttonBg: 'bg-emerald-600',
    buttonHover: 'hover:bg-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
  },
  'to-pdf': {
    id: 'to-pdf',
    label: 'Convert to PDF',
    colorName: 'yellow',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    buttonBg: 'bg-amber-600',
    buttonHover: 'hover:bg-amber-700',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
  },
  'from-pdf': {
    id: 'from-pdf',
    label: 'Convert from PDF',
    colorName: 'blue',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
  },
  edit: {
    id: 'edit',
    label: 'Edit PDF',
    colorName: 'purple',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    buttonBg: 'bg-purple-600',
    buttonHover: 'hover:bg-purple-700',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
  },
  security: {
    id: 'security',
    label: 'PDF Security',
    colorName: 'darkblue',
    iconColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    buttonBg: 'bg-indigo-700',
    buttonHover: 'hover:bg-indigo-800',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
  },
  'dev': {
    id: 'dev',
    label: 'Dev Tools',
    colorName: 'slate',
    iconColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    buttonBg: 'bg-slate-900',
    buttonHover: 'hover:bg-slate-800',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
  },
  'docs': {
    id: 'docs',
    label: 'Docs',
    colorName: 'sky',
    iconColor: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    buttonBg: 'bg-sky-600',
    buttonHover: 'hover:bg-sky-700',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
  },
  'archives': {
    id: 'archives',
    label: 'Archives',
    colorName: 'orange',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    buttonBg: 'bg-orange-600',
    buttonHover: 'hover:bg-orange-700',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
  },
};

export const TOOL_CATEGORY_MAP: Record<string, ILovePdfCategoryId> = {
  // Organize PDF
  'pdf-merge': 'organize',
  'pdf-split': 'organize',
  'pdf-remove-pages': 'organize',
  'pdf-extract-pages': 'organize',
  'pdf-organize': 'organize',
  'pdf-rotate': 'organize',

  // Optimize PDF
  'pdf-compress': 'optimize',
  'pdf-repair': 'optimize',
  'pdf-ocr': 'optimize',

  // Convert to PDF
  'images-to-pdf': 'to-pdf',
  'word-to-pdf': 'to-pdf',
  'excel-to-pdf': 'to-pdf',
  'text-to-pdf': 'to-pdf',

  // Convert from PDF
  'pdf-to-images': 'from-pdf',
  'pdf-to-word': 'from-pdf',
  'pdf-to-excel': 'from-pdf',
  'pdf-to-text': 'from-pdf',

  // Edit PDF
  'pdf-page-numbers': 'edit',
  'pdf-watermark': 'edit',
  'pdf-crop': 'edit',
  'pdf-edit': 'edit',
  'pdf-flatten': 'edit',
  'pdf-forms': 'edit',

  // PDF Security
  'pdf-protect': 'security',
  'pdf-unlock': 'security',
  'pdf-sign': 'security',
  'pdf-true-redaction': 'security',
  'pdf-visual-diff': 'security',

  // Photos & Image Enhancements
  'passport-photo-maker': 'photos',
  'custom-size-reducer': 'photos',
  'image-resize': 'photos',
  'image-compress': 'photos',
  'image-crop': 'photos',
  'image-remove-bg': 'photos',
  'image-convert': 'photos',

  // Dev Tools
  'hash-checker': 'dev',
  'base64-tool': 'dev',
  'metadata-scrubber': 'dev',
  'file-health-check': 'dev',
  'word-counter': 'dev',
  'diff-checker': 'dev',
  'regex-tester': 'dev',
  'unit-converter': 'dev',

  // Docs
  'docx-converter': 'docs',
  'markdown-html': 'docs',
  'spreadsheet-converter': 'docs',

  // Archives
  'zip-create': 'archives',
  'zip-extract': 'archives',
  'bulk-rename': 'archives',
  'json-yaml-converter': 'archives',
  'xml-json-converter': 'archives',
  'qr-generator': 'archives',
};

// URL Route Slug Map
export const TOOL_ROUTE_MAP: Record<string, string> = {
  'passport-photo-maker': 'passport-photo-maker',
  'custom-size-reducer': 'custom-size-reducer',
  'image-resize': 'resize-image',
  'image-compress': 'compress-image',
  'image-crop': 'crop-image',
  'image-remove-bg': 'remove-background',
  'pdf-merge': 'merge-pdf',
  'pdf-split': 'split-pdf',
  'pdf-remove-pages': 'remove-pages',
  'pdf-extract-pages': 'extract-pages',
  'pdf-organize': 'organize-pdf',
  'pdf-rotate': 'rotate-pdf',

  'pdf-compress': 'compress-pdf',
  'pdf-repair': 'repair-pdf',
  'pdf-ocr': 'ocr-pdf',

  'images-to-pdf': 'jpg-to-pdf',
  'word-to-pdf': 'word-to-pdf',
  'excel-to-pdf': 'excel-to-pdf',
  'text-to-pdf': 'text-to-pdf',

  'pdf-to-images': 'pdf-to-jpg',
  'pdf-to-word': 'pdf-to-word',
  'pdf-to-excel': 'pdf-to-excel',
  'pdf-to-text': 'pdf-to-text',

  'pdf-page-numbers': 'add-page-numbers',
  'pdf-watermark': 'add-watermark',
  'pdf-crop': 'crop-pdf',
  'pdf-edit': 'edit-pdf',

  'pdf-protect': 'protect-pdf',
  'pdf-unlock': 'unlock-pdf',
  'pdf-sign': 'sign-pdf',
  'pdf-true-redaction': 'redact-pdf',
  'pdf-visual-diff': 'compare-pdf',
};

export const ROUTE_TO_TOOL_MAP: Record<string, string> = Object.entries(TOOL_ROUTE_MAP).reduce(
  (acc, [toolId, slug]) => {
    acc[slug] = toolId;
    return acc;
  },
  {} as Record<string, string>
);

export function getToolRoute(toolId: string): string {
  return TOOL_ROUTE_MAP[toolId] || toolId;
}

export function getToolIdFromRoute(slug: string): string {
  return ROUTE_TO_TOOL_MAP[slug] || slug;
}

export function getToolCategoryTheme(toolId: string): CategoryTheme {
  const cat = TOOL_CATEGORY_MAP[toolId] || 'all';
  return CATEGORY_THEMES[cat];
}

// Suggested next tools after finishing an operation
export const SUGGESTED_NEXT_TOOLS: Record<string, string[]> = {
  'pdf-merge': ['pdf-compress', 'pdf-split', 'pdf-page-numbers', 'pdf-protect'],
  'pdf-split': ['pdf-merge', 'pdf-compress', 'pdf-protect'],
  'pdf-compress': ['pdf-protect', 'pdf-sign', 'pdf-watermark'],
  'images-to-pdf': ['pdf-compress', 'pdf-merge', 'pdf-page-numbers'],
  'word-to-pdf': ['pdf-compress', 'pdf-protect', 'pdf-sign'],
  'excel-to-pdf': ['pdf-compress', 'pdf-protect'],
  'text-to-pdf': ['pdf-compress', 'pdf-protect'],
  'pdf-to-images': ['image-compress', 'zip-create'],
  'pdf-page-numbers': ['pdf-watermark', 'pdf-compress', 'pdf-protect'],
  'pdf-watermark': ['pdf-compress', 'pdf-protect'],
  'pdf-protect': ['pdf-sign', 'pdf-watermark'],
  'pdf-sign': ['pdf-protect', 'pdf-compress'],
};
