import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// iLovePDF signature two overlapping sheets: Back sheet + Front sheet with emblem
const TwoDocIcon: React.FC<{
  size: number;
  backColor: string;
  frontColor: string;
  children?: React.ReactNode;
  backLabel?: string;
}> = ({ size, backColor, frontColor, children, backLabel }) => {
  const w = size;
  const h = Math.round(size * 1.15);
  const r = Math.max(3, Math.round(size * 0.12));

  return (
    <div
      className="relative shrink-0 select-none"
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      {/* Back overlapping sheet */}
      <div
        className="absolute top-0 right-0 rounded-md transition-transform flex items-start justify-end pr-1 pt-0.5 overflow-hidden"
        style={{
          width: `${Math.round(w * 0.78)}px`,
          height: `${Math.round(h * 0.85)}px`,
          backgroundColor: backColor,
          borderRadius: `${r}px`,
          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
        }}
      >
        {backLabel && (
          <span className="text-white/90 font-black text-[9px] tracking-tight leading-none">
            {backLabel}
          </span>
        )}
      </div>
      {/* Front primary sheet */}
      <div
        className="absolute bottom-0 left-0 flex items-center justify-center rounded-md"
        style={{
          width: `${Math.round(w * 0.82)}px`,
          height: `${Math.round(h * 0.88)}px`,
          backgroundColor: frontColor,
          borderRadius: `${r}px`,
          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Single solid sheet for specialized tools
const SingleDocIcon: React.FC<{
  size: number;
  color: string;
  children?: React.ReactNode;
}> = ({ size, color, children }) => {
  const w = size;
  const h = Math.round(size * 1.12);
  const r = Math.max(4, Math.round(size * 0.14));

  return (
    <div
      className="relative shrink-0 select-none flex items-center justify-center"
      style={{
        width: `${w}px`,
        height: `${h}px`,
        backgroundColor: color,
        borderRadius: `${r}px`,
        boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
      }}
    >
      {children}
    </div>
  );
};

export const ILovePdfToolIcon: React.FC<{ toolId: string; size?: number; className?: string }> = ({
  toolId,
  size = 46,
}) => {
  switch (toolId) {
    // ── Organize PDF (iLovePDF Red) ──────────────────────────────────
    case 'pdf-merge':
      return (
        <TwoDocIcon size={size} backColor="#F87171" frontColor="#E5322D">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-split':
      return (
        <TwoDocIcon size={size} backColor="#F87171" frontColor="#E5322D">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5" />
            <path d="M4 20L21 3" />
            <path d="M21 16v5h-5" />
            <path d="M15 15l6 6" />
            <path d="M4 4l5 5" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-remove-pages':
      return (
        <TwoDocIcon size={size} backColor="#F87171" frontColor="#E5322D">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-extract-pages':
      return (
        <TwoDocIcon size={size} backColor="#F87171" frontColor="#E5322D">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-organize':
      return (
        <TwoDocIcon size={size} backColor="#F87171" frontColor="#E5322D">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-rotate':
      return (
        <TwoDocIcon size={size} backColor="#F87171" frontColor="#E5322D">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6" />
            <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </TwoDocIcon>
      );

    // ── Optimize PDF (iLovePDF Emerald Green) ─────────────────────────
    case 'pdf-compress':
      return (
        <TwoDocIcon size={size} backColor="#6EE7B7" frontColor="#10B981">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-repair':
      return (
        <TwoDocIcon size={size} backColor="#6EE7B7" frontColor="#10B981">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-ocr':
      return (
        <TwoDocIcon size={size} backColor="#6EE7B7" frontColor="#059669">
          <span className="text-white font-black font-sans text-xs tracking-wider">OCR</span>
        </TwoDocIcon>
      );

    // ── Converter Suite (Authentic iLovePDF Overlapping Duo) ──────────
    case 'word-to-pdf':
      return (
        <TwoDocIcon size={size} backColor="#2B579A" backLabel="W" frontColor="#E5322D">
          <span className="text-white font-black font-sans text-xs tracking-wider">PDF</span>
        </TwoDocIcon>
      );

    case 'pdf-to-word':
      return (
        <TwoDocIcon size={size} backColor="#E5322D" backLabel="PDF" frontColor="#2B579A">
          <span className="text-white font-black font-sans text-xs tracking-wider">W</span>
        </TwoDocIcon>
      );

    case 'excel-to-pdf':
      return (
        <TwoDocIcon size={size} backColor="#217346" backLabel="X" frontColor="#E5322D">
          <span className="text-white font-black font-sans text-xs tracking-wider">PDF</span>
        </TwoDocIcon>
      );

    case 'pdf-to-excel':
      return (
        <TwoDocIcon size={size} backColor="#E5322D" backLabel="PDF" frontColor="#217346">
          <span className="text-white font-black font-sans text-xs tracking-wider">XLS</span>
        </TwoDocIcon>
      );

    case 'images-to-pdf':
      return (
        <TwoDocIcon size={size} backColor="#E91E63" backLabel="JPG" frontColor="#E5322D">
          <span className="text-white font-black font-sans text-xs tracking-wider">PDF</span>
        </TwoDocIcon>
      );

    case 'pdf-to-images':
      return (
        <TwoDocIcon size={size} backColor="#E5322D" backLabel="PDF" frontColor="#E91E63">
          <span className="text-white font-black font-sans text-xs tracking-wider">JPG</span>
        </TwoDocIcon>
      );

    case 'text-to-pdf':
      return (
        <TwoDocIcon size={size} backColor="#64748B" backLabel="TXT" frontColor="#E5322D">
          <span className="text-white font-black font-sans text-xs tracking-wider">PDF</span>
        </TwoDocIcon>
      );

    case 'pdf-to-text':
      return (
        <TwoDocIcon size={size} backColor="#E5322D" backLabel="PDF" frontColor="#475569">
          <span className="text-white font-black font-sans text-xs tracking-wider">TXT</span>
        </TwoDocIcon>
      );

    case 'docx-converter':
      return (
        <TwoDocIcon size={size} backColor="#1E3A8A" backLabel="DOC" frontColor="#2563EB">
          <span className="text-white font-black font-sans text-[11px] tracking-tight">DOCX</span>
        </TwoDocIcon>
      );

    case 'spreadsheet-converter':
      return (
        <TwoDocIcon size={size} backColor="#065F46" backLabel="CSV" frontColor="#10B981">
          <span className="text-white font-black font-sans text-xs tracking-wider">XLS</span>
        </TwoDocIcon>
      );

    case 'markdown-html':
      return (
        <TwoDocIcon size={size} backColor="#4F46E5" backLabel="MD" frontColor="#EA580C">
          <span className="text-white font-black font-sans text-[10px] tracking-tight">HTML</span>
        </TwoDocIcon>
      );

    case 'json-yaml-converter':
      return (
        <TwoDocIcon size={size} backColor="#D97706" backLabel="JSON" frontColor="#7C3AED">
          <span className="text-white font-black font-sans text-[10px] tracking-tight">YAML</span>
        </TwoDocIcon>
      );

    case 'xml-json-converter':
      return (
        <TwoDocIcon size={size} backColor="#0D9488" backLabel="XML" frontColor="#D97706">
          <span className="text-white font-black font-sans text-[10px] tracking-tight">JSON</span>
        </TwoDocIcon>
      );

    case 'image-convert':
      return (
        <TwoDocIcon size={size} backColor="#FB7185" backLabel="PNG" frontColor="#E11D48">
          <span className="text-white font-black font-sans text-xs tracking-wider">JPG</span>
        </TwoDocIcon>
      );

    case 'audio-convert':
      return (
        <TwoDocIcon size={size} backColor="#06B6D4" backLabel="WAV" frontColor="#6366F1">
          <span className="text-white font-black font-sans text-[11px] tracking-tight">MP3</span>
        </TwoDocIcon>
      );

    case 'video-extract-audio':
      return (
        <TwoDocIcon size={size} backColor="#9333EA" backLabel="MP4" frontColor="#0284C7">
          <span className="text-white font-black font-sans text-[11px] tracking-tight">MP3</span>
        </TwoDocIcon>
      );

    case 'unit-converter':
      return (
        <TwoDocIcon size={size} backColor="#60A5FA" backLabel="KM" frontColor="#2563EB">
          <span className="text-white font-black font-sans text-xs tracking-wider">MI</span>
        </TwoDocIcon>
      );

    case 'ai-translate':
      return (
        <TwoDocIcon size={size} backColor="#6366F1" backLabel="EN" frontColor="#E5322D">
          <span className="text-white font-black font-sans text-xs tracking-tight">文A</span>
        </TwoDocIcon>
      );

    case 'ai-speech-to-text':
      return (
        <TwoDocIcon size={size} backColor="#E11D48" backLabel="REC" frontColor="#0284C7">
          <span className="text-white font-black font-sans text-xs tracking-wider">TXT</span>
        </TwoDocIcon>
      );

    // ── Passport & Photos (Dedicated Government Suite) ────────────────
    case 'passport-photo-maker':
      return (
        <SingleDocIcon size={size} color="#0D9488">
          <div className="flex flex-col items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white mb-0.5" />
            <div className="w-6 h-3 rounded-t-lg bg-white" />
          </div>
        </SingleDocIcon>
      );

    case 'custom-size-reducer':
      return (
        <SingleDocIcon size={size} color="#EA580C">
          <div className="flex flex-col items-center justify-center">
            <span className="text-white font-black text-[10px] tracking-tight font-mono">KB</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
          </div>
        </SingleDocIcon>
      );

    case 'image-resize':
      return (
        <SingleDocIcon size={size} color="#0284C7">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        </SingleDocIcon>
      );

    case 'image-compress':
      return (
        <SingleDocIcon size={size} color="#10B981">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </SingleDocIcon>
      );

    case 'image-crop':
      return (
        <SingleDocIcon size={size} color="#8B5CF6">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2v14a2 2 0 0 0 2 2h14" />
            <path d="M18 22V8a2 2 0 0 0-2-2H2" />
          </svg>
        </SingleDocIcon>
      );

    case 'image-remove-bg':
      return (
        <SingleDocIcon size={size} color="#EC4899">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </SingleDocIcon>
      );

    case 'image-rotate':
      return (
        <SingleDocIcon size={size} color="#F59E0B">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6" />
            <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </SingleDocIcon>
      );

    case 'image-exif':
      return (
        <SingleDocIcon size={size} color="#64748B">
          <span className="text-white font-black font-sans text-[10px] tracking-tight">EXIF</span>
        </SingleDocIcon>
      );

    case 'image-ascii':
      return (
        <SingleDocIcon size={size} color="#059669">
          <span className="text-white font-mono font-bold text-xs">#&amp;%</span>
        </SingleDocIcon>
      );

    case 'image-meme':
      return (
        <SingleDocIcon size={size} color="#EAB308">
          <span className="text-white font-black font-sans text-[10px] tracking-tight">MEME</span>
        </SingleDocIcon>
      );

    case 'image-collage':
      return (
        <SingleDocIcon size={size} color="#6366F1">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="18" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </SingleDocIcon>
      );

    case 'image-upscale':
      return (
        <SingleDocIcon size={size} color="#0EA5E9">
          <span className="text-white font-black font-sans text-xs tracking-wider">2x</span>
        </SingleDocIcon>
      );

    // ── Edit & Security (iLovePDF Purple & Dark Blue) ─────────────────
    case 'pdf-edit':
      return (
        <TwoDocIcon size={size} backColor="#C084FC" frontColor="#9333EA">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-watermark':
      return (
        <TwoDocIcon size={size} backColor="#C084FC" frontColor="#9333EA">
          <span className="text-white font-black text-xs">©</span>
        </TwoDocIcon>
      );

    case 'pdf-page-numbers':
      return (
        <TwoDocIcon size={size} backColor="#C084FC" frontColor="#9333EA">
          <span className="text-white font-black text-xs font-mono">1 2</span>
        </TwoDocIcon>
      );

    case 'pdf-crop':
      return (
        <TwoDocIcon size={size} backColor="#C084FC" frontColor="#9333EA">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2v14a2 2 0 0 0 2 2h14" />
            <path d="M18 22V8a2 2 0 0 0-2-2H2" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-flatten':
      return (
        <TwoDocIcon size={size} backColor="#C084FC" frontColor="#9333EA">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-protect':
      return (
        <TwoDocIcon size={size} backColor="#818CF8" frontColor="#4338CA">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-unlock':
      return (
        <TwoDocIcon size={size} backColor="#818CF8" frontColor="#4338CA">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-sign':
      return (
        <TwoDocIcon size={size} backColor="#818CF8" frontColor="#4338CA">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-fill-forms':
      return (
        <TwoDocIcon size={size} backColor="#818CF8" frontColor="#4338CA">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </TwoDocIcon>
      );

    case 'pdf-true-redaction':
      return (
        <TwoDocIcon size={size} backColor="#475569" frontColor="#0F172A">
          <div className="w-5 h-2 bg-white rounded-xs" />
        </TwoDocIcon>
      );

    case 'pdf-visual-diff':
      return (
        <TwoDocIcon size={size} backColor="#A855F7" frontColor="#7E22CE">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
        </TwoDocIcon>
      );

    // ── Media & AI Tools ──────────────────────────────────────────────
    case 'audio-trim':
      return (
        <SingleDocIcon size={size} color="#4F46E5">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
        </SingleDocIcon>
      );

    case 'media-speed':
      return (
        <SingleDocIcon size={size} color="#0891B2">
          <span className="text-white font-black font-sans text-[10px] tracking-tight">1.5x</span>
        </SingleDocIcon>
      );

    case 'ai-summarize':
    case 'ai-extract-info':
      return (
        <SingleDocIcon size={size} color="#7C3AED">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </SingleDocIcon>
      );

    case 'ai-image-caption':
      return (
        <SingleDocIcon size={size} color="#D97706">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </SingleDocIcon>
      );

    // ── Dev & Archives ───────────────────────────────────────────────
    case 'zip-create':
    case 'zip-extract':
      return (
        <SingleDocIcon size={size} color="#D97706">
          <span className="text-white font-bold text-xs font-mono">ZIP</span>
        </SingleDocIcon>
      );

    case 'bulk-rename':
      return (
        <SingleDocIcon size={size} color="#2563EB">
          <span className="text-white font-black font-sans text-[10px] tracking-tight">A→B</span>
        </SingleDocIcon>
      );

    case 'qr-generator':
      return (
        <SingleDocIcon size={size} color="#0F172A">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="18" width="3" height="3" />
          </svg>
        </SingleDocIcon>
      );

    case 'hash-checker':
      return (
        <SingleDocIcon size={size} color="#4F46E5">
          <span className="text-white font-mono font-black text-xs">#SHA</span>
        </SingleDocIcon>
      );

    case 'base64-tool':
      return (
        <SingleDocIcon size={size} color="#0891B2">
          <span className="text-white font-mono font-black text-xs">B64</span>
        </SingleDocIcon>
      );

    case 'regex-tester':
      return (
        <SingleDocIcon size={size} color="#D97706">
          <span className="text-white font-mono font-black text-xs">.*</span>
        </SingleDocIcon>
      );

    case 'diff-checker':
      return (
        <TwoDocIcon size={size} backColor="#EF4444" backLabel="-" frontColor="#10B981">
          <span className="text-white font-mono font-black text-xs">+ -</span>
        </TwoDocIcon>
      );

    case 'word-counter':
      return (
        <SingleDocIcon size={size} color="#7C3AED">
          <span className="text-white font-mono font-black text-xs">123</span>
        </SingleDocIcon>
      );

    case 'metadata-scrubber':
      return (
        <SingleDocIcon size={size} color="#059669">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </SingleDocIcon>
      );

    case 'file-health-check':
      return (
        <SingleDocIcon size={size} color="#16A34A">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </SingleDocIcon>
      );

    default:
      return (
        <TwoDocIcon size={size} backColor="#CBD5E1" frontColor="#475569">
          <span className="text-white font-bold text-xs">DOC</span>
        </TwoDocIcon>
      );
  }
};
