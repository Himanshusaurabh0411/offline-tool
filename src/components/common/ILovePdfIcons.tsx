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
}> = ({ size, backColor, frontColor, children }) => {
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
        className="absolute top-0 right-0 rounded-md transition-transform"
        style={{
          width: `${Math.round(w * 0.78)}px`,
          height: `${Math.round(h * 0.85)}px`,
          backgroundColor: backColor,
          borderRadius: `${r}px`,
          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
        }}
      />
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
        <TwoDocIcon size={size} backColor="#6EE7B7" frontColor="#10B981">
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
        </TwoDocIcon>
      );

    // ── Word & Office Conversion (iLovePDF Blue & Red) ────────────────
    case 'pdf-to-word':
      return (
        <TwoDocIcon size={size} backColor="#E5322D" frontColor="#2B579A">
          <span className="text-white font-black font-sans text-xs tracking-wider">W</span>
        </TwoDocIcon>
      );

    case 'word-to-pdf':
      return (
        <TwoDocIcon size={size} backColor="#2B579A" frontColor="#E5322D">
          <span className="text-white font-black font-sans text-xs tracking-wider">PDF</span>
        </TwoDocIcon>
      );

    case 'pdf-to-excel':
      return (
        <TwoDocIcon size={size} backColor="#E5322D" frontColor="#217346">
          <span className="text-white font-black font-sans text-xs tracking-wider">X</span>
        </TwoDocIcon>
      );

    case 'excel-to-pdf':
      return (
        <TwoDocIcon size={size} backColor="#217346" frontColor="#E5322D">
          <span className="text-white font-black font-sans text-xs tracking-wider">PDF</span>
        </TwoDocIcon>
      );

    case 'pdf-to-images':
      return (
        <TwoDocIcon size={size} backColor="#E5322D" frontColor="#E91E63">
          <span className="text-white font-black font-sans text-xs tracking-wider">JPG</span>
        </TwoDocIcon>
      );

    case 'images-to-pdf':
      return (
        <TwoDocIcon size={size} backColor="#E91E63" frontColor="#E5322D">
          <span className="text-white font-black font-sans text-xs tracking-wider">PDF</span>
        </TwoDocIcon>
      );

    case 'text-to-pdf':
    case 'pdf-to-text':
      return (
        <TwoDocIcon size={size} backColor="#94A3B8" frontColor="#475569">
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

    // ── Dev & Archives ───────────────────────────────────────────────
    case 'hash-checker':
    case 'base64-tool':
    case 'regex-tester':
    case 'diff-checker':
    case 'word-counter':
    case 'unit-converter':
    case 'metadata-scrubber':
    case 'file-health-check':
      return (
        <SingleDocIcon size={size} color="#334155">
          <span className="text-white font-mono font-bold text-xs">&lt;/&gt;</span>
        </SingleDocIcon>
      );

    case 'zip-create':
    case 'zip-extract':
      return (
        <SingleDocIcon size={size} color="#D97706">
          <span className="text-white font-bold text-xs font-mono">ZIP</span>
        </SingleDocIcon>
      );

    default:
      return (
        <TwoDocIcon size={size} backColor="#E2E8F0" frontColor="#64748B">
          <span className="text-white font-bold text-xs">DOC</span>
        </TwoDocIcon>
      );
  }
};
