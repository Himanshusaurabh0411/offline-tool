/**
 * iLovePDF-style illustrated SVG icons for each tool.
 * These match the colored illustration style from iLovePDF.com:
 * two overlapping document squares with a symbol overlay.
 */
import React from 'react';

interface IconProps {
  toolId: string;
  size?: number;
}

// Color palette matching iLovePDF exactly
const COLORS = {
  // Organize PDF – orange-red
  organize: { bg1: '#EE6C4D', bg2: '#D4543A', accent: '#FFFFFF' },
  // Optimize PDF – green
  optimize: { bg1: '#4CAF82', bg2: '#3D9E70', accent: '#FFFFFF' },
  // Convert to PDF – amber
  toPdf: { bg1: '#F5A623', bg2: '#E09415', accent: '#FFFFFF' },
  // Convert from PDF – blue
  fromPdf: { bg1: '#4A90D9', bg2: '#3A7EC4', accent: '#FFFFFF' },
  // Edit PDF – purple
  edit: { bg1: '#9B59B6', bg2: '#8549A2', accent: '#FFFFFF' },
  // Security – dark blue/indigo
  security: { bg1: '#3B5998', bg2: '#2C4A87', accent: '#FFFFFF' },
  // Dev – slate/teal
  dev: { bg1: '#26A69A', bg2: '#1E8F84', accent: '#FFFFFF' },
  // Docs – sky blue
  docs: { bg1: '#29B6F6', bg2: '#0EA5E9', accent: '#FFFFFF' },
  // Archives – orange
  archives: { bg1: '#FF7043', bg2: '#E8623A', accent: '#FFFFFF' },
  // Word related – blue (Word brand)
  word: { bg1: '#2B579A', bg2: '#1E4080', accent: '#FFFFFF' },
  // Excel related – green (Excel brand)
  excel: { bg1: '#217346', bg2: '#1A5C38', accent: '#FFFFFF' },
  // Image related – pink/red
  image: { bg1: '#E91E63', bg2: '#C2185B', accent: '#FFFFFF' },
  // HTML – orange
  html: { bg1: '#E67E22', bg2: '#CA6F1E', accent: '#FFFFFF' },
};

// Reusable two-square document base (iLovePDF's signature shape)
const DocBase: React.FC<{
  size: number;
  back: string;
  front: string;
  children?: React.ReactNode;
}> = ({ size, back, front, children }) => {
  const s = size;
  const offset = Math.round(s * 0.3);
  const sq = Math.round(s * 0.68);
  const r = Math.round(s * 0.1);

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back square */}
      <rect x={offset} y={0} width={sq} height={sq} rx={r} fill={back} />
      {/* Front square */}
      <rect x={0} y={offset} width={sq} height={sq} rx={r} fill={front} />
      {/* Content overlay */}
      {children}
    </svg>
  );
};

// Simple single-box icon for tools that don't fit the two-square pattern
const SingleBox: React.FC<{
  size: number;
  bg: string;
  children?: React.ReactNode;
}> = ({ size, bg, children }) => {
  const s = size;
  const r = Math.round(s * 0.18);
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x={0} y={0} width={s} height={s} rx={r} fill={bg} />
      {children}
    </svg>
  );
};

// --- Individual tool icons ---

const MergePdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.organize.bg1} front={COLORS.organize.bg2}>
    {/* Arrow/merge symbol */}
    <line x1={Math.round(s*0.22)} y1={Math.round(s*0.72)} x2={Math.round(s*0.44)} y2={Math.round(s*0.5)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.72)} y1={Math.round(s*0.22)} x2={Math.round(s*0.5)} y2={Math.round(s*0.44)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.44)} y1={Math.round(s*0.5)} x2={Math.round(s*0.6)} y2={Math.round(s*0.5)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
  </DocBase>
);

const SplitPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.organize.bg1} front={COLORS.organize.bg2}>
    <line x1={Math.round(s*0.22)} y1={Math.round(s*0.5)} x2={Math.round(s*0.78)} y2={Math.round(s*0.5)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" strokeDasharray={`${Math.round(s/10)} ${Math.round(s/12)}`}/>
    <polyline points={`${Math.round(s*0.35)},${Math.round(s*0.38)} ${Math.round(s*0.22)},${Math.round(s*0.5)} ${Math.round(s*0.35)},${Math.round(s*0.62)}`} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <polyline points={`${Math.round(s*0.65)},${Math.round(s*0.38)} ${Math.round(s*0.78)},${Math.round(s*0.5)} ${Math.round(s*0.65)},${Math.round(s*0.62)}`} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </DocBase>
);

const CompressPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.optimize.bg1} front={COLORS.optimize.bg2}>
    <polyline points={`${Math.round(s*0.32)},${Math.round(s*0.35)} ${Math.round(s*0.5)},${Math.round(s*0.5)} ${Math.round(s*0.32)},${Math.round(s*0.65)}`} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <polyline points={`${Math.round(s*0.52)},${Math.round(s*0.35)} ${Math.round(s*0.68)},${Math.round(s*0.5)} ${Math.round(s*0.52)},${Math.round(s*0.65)}`} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </DocBase>
);

const RotatePdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.organize.bg1} front={COLORS.organize.bg2}>
    <path d={`M ${Math.round(s*0.36)} ${Math.round(s*0.38)} A ${Math.round(s*0.16)} ${Math.round(s*0.16)} 0 1 1 ${Math.round(s*0.62)} ${Math.round(s*0.55)}`} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" fill="none"/>
    <polyline points={`${Math.round(s*0.6)},${Math.round(s*0.42)} ${Math.round(s*0.62)},${Math.round(s*0.55)} ${Math.round(s*0.49)},${Math.round(s*0.56)}`} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </DocBase>
);

const WatermarkIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.edit.bg1}>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.62)} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={Math.round(s*0.34)} fontWeight="bold" fontFamily="sans-serif" transform={`rotate(-20, ${Math.round(s*0.5)}, ${Math.round(s*0.5)})`}>W</text>
    <rect x={Math.round(s*0.18)} y={Math.round(s*0.3)} width={Math.round(s*0.64)} height={Math.round(s*0.03)} fill="rgba(255,255,255,0.5)" rx="1"/>
    <rect x={Math.round(s*0.18)} y={Math.round(s*0.4)} width={Math.round(s*0.5)} height={Math.round(s*0.03)} fill="rgba(255,255,255,0.5)" rx="1"/>
    <rect x={Math.round(s*0.18)} y={Math.round(s*0.5)} width={Math.round(s*0.58)} height={Math.round(s*0.03)} fill="rgba(255,255,255,0.5)" rx="1"/>
    <rect x={Math.round(s*0.18)} y={Math.round(s*0.6)} width={Math.round(s*0.4)} height={Math.round(s*0.03)} fill="rgba(255,255,255,0.5)" rx="1"/>
  </SingleBox>
);

const SignPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg="#3D72D9">
    <path d={`M ${Math.round(s*0.3)} ${Math.round(s*0.65)} Q ${Math.round(s*0.38)} ${Math.round(s*0.4)} ${Math.round(s*0.5)} ${Math.round(s*0.55)} Q ${Math.round(s*0.6)} ${Math.round(s*0.68)} ${Math.round(s*0.7)} ${Math.round(s*0.4)}`} stroke="white" strokeWidth={Math.max(2, s/18)} strokeLinecap="round" fill="none"/>
    <line x1={Math.round(s*0.25)} y1={Math.round(s*0.72)} x2={Math.round(s*0.75)} y2={Math.round(s*0.72)} stroke="rgba(255,255,255,0.5)" strokeWidth={Math.max(1, s/30)} strokeLinecap="round"/>
  </SingleBox>
);

const ProtectPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg="#3B5998">
    <path d={`M ${Math.round(s*0.5)} ${Math.round(s*0.22)} L ${Math.round(s*0.72)} ${Math.round(s*0.32)} L ${Math.round(s*0.72)} ${Math.round(s*0.55)} Q ${Math.round(s*0.72)} ${Math.round(s*0.75)} ${Math.round(s*0.5)} ${Math.round(s*0.8)} Q ${Math.round(s*0.28)} ${Math.round(s*0.75)} ${Math.round(s*0.28)} ${Math.round(s*0.55)} L ${Math.round(s*0.28)} ${Math.round(s*0.32)} Z`} fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth={Math.max(2, s/22)} strokeLinejoin="round"/>
    <circle cx={Math.round(s*0.5)} cy={Math.round(s*0.52)} r={Math.round(s*0.1)} fill="white"/>
    <line x1={Math.round(s*0.5)} y1={Math.round(s*0.52)} x2={Math.round(s*0.5)} y2={Math.round(s*0.64)} stroke="white" strokeWidth={Math.max(2, s/22)} strokeLinecap="round"/>
  </SingleBox>
);

const UnlockPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg="#5C7BC2">
    <path d={`M ${Math.round(s*0.38)} ${Math.round(s*0.42)} L ${Math.round(s*0.38)} ${Math.round(s*0.34)} Q ${Math.round(s*0.38)} ${Math.round(s*0.22)} ${Math.round(s*0.5)} ${Math.round(s*0.22)} Q ${Math.round(s*0.66)} ${Math.round(s*0.22)} ${Math.round(s*0.66)} ${Math.round(s*0.34)}`} stroke="white" strokeWidth={Math.max(2, s/22)} strokeLinecap="round" fill="none"/>
    <rect x={Math.round(s*0.28)} y={Math.round(s*0.42)} width={Math.round(s*0.44)} height={Math.round(s*0.36)} rx={Math.round(s*0.06)} fill="white" fillOpacity="0.3" stroke="white" strokeWidth={Math.max(2, s/22)}/>
    <circle cx={Math.round(s*0.5)} cy={Math.round(s*0.6)} r={Math.round(s*0.06)} fill="white"/>
  </SingleBox>
);

const OcrPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.optimize.bg1} front={COLORS.optimize.bg2}>
    <rect x={Math.round(s*0.3)} y={Math.round(s*0.42)} width={Math.round(s*0.4)} height={Math.round(s*0.28)} rx={Math.round(s*0.04)} stroke="white" strokeWidth={Math.max(1.5, s/24)} fill="none"/>
    <line x1={Math.round(s*0.34)} y1={Math.round(s*0.42)} x2={Math.round(s*0.34)} y2={Math.round(s*0.36)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.66)} y1={Math.round(s*0.42)} x2={Math.round(s*0.66)} y2={Math.round(s*0.36)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.34)} y1={Math.round(s*0.7)} x2={Math.round(s*0.34)} y2={Math.round(s*0.76)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.66)} y1={Math.round(s*0.7)} x2={Math.round(s*0.66)} y2={Math.round(s*0.76)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.62)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.14)} fontWeight="bold" fontFamily="monospace">OCR</text>
  </DocBase>
);

const PageNumIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.edit.bg1}>
    <rect x={Math.round(s*0.22)} y={Math.round(s*0.22)} width={Math.round(s*0.56)} height={Math.round(s*0.56)} rx={Math.round(s*0.06)} stroke="white" strokeWidth={Math.max(1.5, s/24)} fill="none" strokeOpacity="0.7"/>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.58)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.22)} fontWeight="bold" fontFamily="monospace">1</text>
  </SingleBox>
);

const RepairPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.optimize.bg1} front={COLORS.optimize.bg2}>
    <path d={`M ${Math.round(s*0.44)} ${Math.round(s*0.38)} L ${Math.round(s*0.5)} ${Math.round(s*0.5)} L ${Math.round(s*0.38)} ${Math.round(s*0.54)} L ${Math.round(s*0.5)} ${Math.round(s*0.64)} L ${Math.round(s*0.64)} ${Math.round(s*0.58)} L ${Math.round(s*0.58)} ${Math.round(s*0.46)} Z`} fill="white" opacity="0.9"/>
  </DocBase>
);

// PDF to/from conversions – Word style
const WordToPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.word.bg1} front="#E5322D">
    <text x={Math.round(s*0.2)} y={Math.round(s*0.63)} fill="white" fontSize={Math.round(s*0.3)} fontWeight="bold" fontFamily="sans-serif">W</text>
  </DocBase>
);

const PdfToWordIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back="#E5322D" front={COLORS.word.bg1}>
    <text x={Math.round(s*0.2)} y={Math.round(s*0.63)} fill="white" fontSize={Math.round(s*0.3)} fontWeight="bold" fontFamily="sans-serif">W</text>
  </DocBase>
);

const ExcelToPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.excel.bg1} front="#E5322D">
    <text x={Math.round(s*0.18)} y={Math.round(s*0.63)} fill="white" fontSize={Math.round(s*0.3)} fontWeight="bold" fontFamily="sans-serif">X</text>
  </DocBase>
);

const PdfToExcelIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back="#E5322D" front={COLORS.excel.bg1}>
    <text x={Math.round(s*0.18)} y={Math.round(s*0.63)} fill="white" fontSize={Math.round(s*0.3)} fontWeight="bold" fontFamily="sans-serif">X</text>
  </DocBase>
);

const ImageToPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.image.bg1} front="#E5322D">
    <circle cx={Math.round(s*0.26)} cy={Math.round(s*0.48)} r={Math.round(s*0.06)} fill="rgba(255,255,255,0.9)"/>
    <polyline points={`${Math.round(s*0.16)},${Math.round(s*0.68)} ${Math.round(s*0.3)},${Math.round(s*0.55)} ${Math.round(s*0.4)},${Math.round(s*0.62)} ${Math.round(s*0.55)},${Math.round(s*0.45)} ${Math.round(s*0.68)},${Math.round(s*0.68)}`} stroke="rgba(255,255,255,0.9)" strokeWidth={Math.max(1.5, s/24)} strokeLinejoin="round" fill="none"/>
  </DocBase>
);

const PdfToImageIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back="#E5322D" front={COLORS.image.bg1}>
    <circle cx={Math.round(s*0.26)} cy={Math.round(s*0.48)} r={Math.round(s*0.06)} fill="rgba(255,255,255,0.9)"/>
    <polyline points={`${Math.round(s*0.16)},${Math.round(s*0.68)} ${Math.round(s*0.3)},${Math.round(s*0.55)} ${Math.round(s*0.4)},${Math.round(s*0.62)} ${Math.round(s*0.55)},${Math.round(s*0.45)} ${Math.round(s*0.68)},${Math.round(s*0.68)}`} stroke="rgba(255,255,255,0.9)" strokeWidth={Math.max(1.5, s/24)} strokeLinejoin="round" fill="none"/>
  </DocBase>
);

const TextToPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.toPdf.bg1} front="#E5322D">
    <line x1={Math.round(s*0.2)} y1={Math.round(s*0.44)} x2={Math.round(s*0.62)} y2={Math.round(s*0.44)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.2)} y1={Math.round(s*0.54)} x2={Math.round(s*0.55)} y2={Math.round(s*0.54)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.2)} y1={Math.round(s*0.64)} x2={Math.round(s*0.48)} y2={Math.round(s*0.64)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
  </DocBase>
);

const PdfToTextIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back="#E5322D" front={COLORS.fromPdf.bg1}>
    <line x1={Math.round(s*0.2)} y1={Math.round(s*0.44)} x2={Math.round(s*0.62)} y2={Math.round(s*0.44)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.2)} y1={Math.round(s*0.54)} x2={Math.round(s*0.55)} y2={Math.round(s*0.54)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.2)} y1={Math.round(s*0.64)} x2={Math.round(s*0.48)} y2={Math.round(s*0.64)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
  </DocBase>
);

const EditPdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.edit.bg1}>
    <path d={`M ${Math.round(s*0.55)} ${Math.round(s*0.28)} L ${Math.round(s*0.7)} ${Math.round(s*0.42)} L ${Math.round(s*0.4)} ${Math.round(s*0.72)} L ${Math.round(s*0.25)} ${Math.round(s*0.72)} L ${Math.round(s*0.25)} ${Math.round(s*0.58)} Z`} fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth={Math.max(1.5, s/22)} strokeLinejoin="round"/>
    <line x1={Math.round(s*0.5)} y1={Math.round(s*0.33)} x2={Math.round(s*0.65)} y2={Math.round(s*0.47)} stroke="white" strokeWidth={Math.max(1.5, s/22)} strokeLinecap="round"/>
  </SingleBox>
);

const RemovePagesIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.organize.bg1} front={COLORS.organize.bg2}>
    <line x1={Math.round(s*0.36)} y1={Math.round(s*0.44)} x2={Math.round(s*0.64)} y2={Math.round(s*0.72)} stroke="white" strokeWidth={Math.max(2, s/18)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.64)} y1={Math.round(s*0.44)} x2={Math.round(s*0.36)} y2={Math.round(s*0.72)} stroke="white" strokeWidth={Math.max(2, s/18)} strokeLinecap="round"/>
  </DocBase>
);

const ExtractPagesIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.organize.bg1} front={COLORS.organize.bg2}>
    <line x1={Math.round(s*0.5)} y1={Math.round(s*0.38)} x2={Math.round(s*0.5)} y2={Math.round(s*0.7)} stroke="white" strokeWidth={Math.max(2, s/18)} strokeLinecap="round"/>
    <polyline points={`${Math.round(s*0.36)},${Math.round(s*0.56)} ${Math.round(s*0.5)},${Math.round(s*0.7)} ${Math.round(s*0.64)},${Math.round(s*0.56)}`} stroke="white" strokeWidth={Math.max(2, s/18)} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1={Math.round(s*0.36)} y1={Math.round(s*0.76)} x2={Math.round(s*0.64)} y2={Math.round(s*0.76)} stroke="white" strokeWidth={Math.max(2, s/18)} strokeLinecap="round"/>
  </DocBase>
);

const OrganizePdfIcon: React.FC<{ s: number }> = ({ s }) => (
  <DocBase size={s} back={COLORS.organize.bg1} front={COLORS.organize.bg2}>
    <rect x={Math.round(s*0.3)} y={Math.round(s*0.4)} width={Math.round(s*0.18)} height={Math.round(s*0.25)} rx={Math.round(s*0.03)} fill="white" opacity="0.8"/>
    <rect x={Math.round(s*0.52)} y={Math.round(s*0.4)} width={Math.round(s*0.18)} height={Math.round(s*0.25)} rx={Math.round(s*0.03)} fill="white" opacity="0.8"/>
    <line x1={Math.round(s*0.39)} y1={Math.round(s*0.36)} x2={Math.round(s*0.39)} y2={Math.round(s*0.4)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.61)} y1={Math.round(s*0.36)} x2={Math.round(s*0.61)} y2={Math.round(s*0.4)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
  </DocBase>
);

// Generic dev/docs/archive icons
const GenericDocIcon: React.FC<{ s: number; color: string; letter?: string }> = ({ s, color, letter }) => (
  <SingleBox size={s} bg={color}>
    {letter ? (
      <text x={Math.round(s*0.5)} y={Math.round(s*0.64)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.3)} fontWeight="bold" fontFamily="monospace">{letter}</text>
    ) : (
      <>
        <line x1={Math.round(s*0.25)} y1={Math.round(s*0.36)} x2={Math.round(s*0.75)} y2={Math.round(s*0.36)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" opacity="0.9"/>
        <line x1={Math.round(s*0.25)} y1={Math.round(s*0.5)} x2={Math.round(s*0.7)} y2={Math.round(s*0.5)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" opacity="0.9"/>
        <line x1={Math.round(s*0.25)} y1={Math.round(s*0.64)} x2={Math.round(s*0.6)} y2={Math.round(s*0.64)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round" opacity="0.9"/>
      </>
    )}
  </SingleBox>
);

const HashIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.dev.bg1}>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.64)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.32)} fontWeight="bold" fontFamily="monospace">#</text>
  </SingleBox>
);

const Base64Icon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.dev.bg1}>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.56)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.17)} fontWeight="bold" fontFamily="monospace">B64</text>
  </SingleBox>
);

const QrIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.archives.bg1}>
    {/* QR-like grid */}
    <rect x={Math.round(s*0.22)} y={Math.round(s*0.22)} width={Math.round(s*0.24)} height={Math.round(s*0.24)} rx="2" fill="white" opacity="0.9"/>
    <rect x={Math.round(s*0.54)} y={Math.round(s*0.22)} width={Math.round(s*0.24)} height={Math.round(s*0.24)} rx="2" fill="white" opacity="0.9"/>
    <rect x={Math.round(s*0.22)} y={Math.round(s*0.54)} width={Math.round(s*0.24)} height={Math.round(s*0.24)} rx="2" fill="white" opacity="0.9"/>
    <rect x={Math.round(s*0.54)} y={Math.round(s*0.54)} width={Math.round(s*0.1)} height={Math.round(s*0.1)} rx="1" fill="white" opacity="0.9"/>
    <rect x={Math.round(s*0.68)} y={Math.round(s*0.54)} width={Math.round(s*0.1)} height={Math.round(s*0.1)} rx="1" fill="white" opacity="0.9"/>
    <rect x={Math.round(s*0.54)} y={Math.round(s*0.68)} width={Math.round(s*0.1)} height={Math.round(s*0.1)} rx="1" fill="white" opacity="0.9"/>
  </SingleBox>
);

const ZipIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.archives.bg1}>
    <path d={`M ${Math.round(s*0.4)} ${Math.round(s*0.2)} L ${Math.round(s*0.6)} ${Math.round(s*0.2)} L ${Math.round(s*0.7)} ${Math.round(s*0.35)} L ${Math.round(s*0.7)} ${Math.round(s*0.8)} L ${Math.round(s*0.3)} ${Math.round(s*0.8)} L ${Math.round(s*0.3)} ${Math.round(s*0.2)} Z`} fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth={Math.max(1.5, s/22)} strokeLinejoin="round"/>
    <line x1={Math.round(s*0.46)} y1={Math.round(s*0.36)} x2={Math.round(s*0.54)} y2={Math.round(s*0.36)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.46)} y1={Math.round(s*0.44)} x2={Math.round(s*0.54)} y2={Math.round(s*0.44)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.46)} y1={Math.round(s*0.52)} x2={Math.round(s*0.54)} y2={Math.round(s*0.52)} stroke="white" strokeWidth={Math.max(1.5, s/24)} strokeLinecap="round"/>
  </SingleBox>
);

const HtmlIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.html.bg1}>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.6)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.2)} fontWeight="bold" fontFamily="monospace">HTML</text>
  </SingleBox>
);

const CropIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.edit.bg1}>
    <line x1={Math.round(s*0.28)} y1={Math.round(s*0.2)} x2={Math.round(s*0.28)} y2={Math.round(s*0.72)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
    <line x1={Math.round(s*0.2)} y1={Math.round(s*0.72)} x2={Math.round(s*0.8)} y2={Math.round(s*0.72)} stroke="white" strokeWidth={Math.max(2, s/20)} strokeLinecap="round"/>
    <rect x={Math.round(s*0.38)} y={Math.round(s*0.28)} width={Math.round(s*0.35)} height={Math.round(s*0.35)} stroke="rgba(255,255,255,0.7)" strokeWidth={Math.max(1.5, s/24)} fill="none" strokeDasharray="3 2"/>
  </SingleBox>
);

const RedactIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.security.bg1}>
    <rect x={Math.round(s*0.22)} y={Math.round(s*0.38)} width={Math.round(s*0.56)} height={Math.round(s*0.12)} rx={Math.round(s*0.03)} fill="white"/>
    <rect x={Math.round(s*0.22)} y={Math.round(s*0.55)} width={Math.round(s*0.38)} height={Math.round(s*0.1)} rx={Math.round(s*0.03)} fill="rgba(255,255,255,0.5)"/>
  </SingleBox>
);

const DiffIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.security.bg1}>
    <line x1={Math.round(s*0.5)} y1={Math.round(s*0.2)} x2={Math.round(s*0.5)} y2={Math.round(s*0.8)} stroke="rgba(255,255,255,0.6)" strokeWidth={Math.max(1, s/28)} strokeLinecap="round" strokeDasharray="3 2"/>
    <rect x={Math.round(s*0.2)} y={Math.round(s*0.3)} width={Math.round(s*0.25)} height={Math.round(s*0.08)} rx="2" fill="white" opacity="0.9"/>
    <rect x={Math.round(s*0.55)} y={Math.round(s*0.3)} width={Math.round(s*0.25)} height={Math.round(s*0.08)} rx="2" fill="rgba(255,120,120,0.9)"/>
    <rect x={Math.round(s*0.2)} y={Math.round(s*0.44)} width={Math.round(s*0.25)} height={Math.round(s*0.08)} rx="2" fill="rgba(255,255,255,0.6)"/>
    <rect x={Math.round(s*0.55)} y={Math.round(s*0.44)} width={Math.round(s*0.18)} height={Math.round(s*0.08)} rx="2" fill="rgba(120,255,120,0.9)"/>
  </SingleBox>
);

const DocxIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.docs.bg1}>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.56)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.18)} fontWeight="bold" fontFamily="monospace">DOC</text>
  </SingleBox>
);

const MarkdownIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.docs.bg1}>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.6)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.3)} fontWeight="bold" fontFamily="monospace">M↓</text>
  </SingleBox>
);

const SpreadsheetIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.excel.bg1}>
    <rect x={Math.round(s*0.2)} y={Math.round(s*0.2)} width={Math.round(s*0.28)} height={Math.round(s*0.24)} rx="2" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.8)" strokeWidth="1"/>
    <rect x={Math.round(s*0.52)} y={Math.round(s*0.2)} width={Math.round(s*0.28)} height={Math.round(s*0.24)} rx="2" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.8)" strokeWidth="1"/>
    <rect x={Math.round(s*0.2)} y={Math.round(s*0.48)} width={Math.round(s*0.28)} height={Math.round(s*0.24)} rx="2" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.8)" strokeWidth="1"/>
    <rect x={Math.round(s*0.52)} y={Math.round(s*0.48)} width={Math.round(s*0.28)} height={Math.round(s*0.24)} rx="2" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.8)" strokeWidth="1"/>
  </SingleBox>
);

const RenameIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.archives.bg1}>
    <path d={`M ${Math.round(s*0.55)} ${Math.round(s*0.28)} L ${Math.round(s*0.7)} ${Math.round(s*0.42)} L ${Math.round(s*0.4)} ${Math.round(s*0.72)} L ${Math.round(s*0.25)} ${Math.round(s*0.72)} L ${Math.round(s*0.25)} ${Math.round(s*0.58)} Z`} fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth={Math.max(1.5, s/22)} strokeLinejoin="round"/>
  </SingleBox>
);

const JsonYamlIcon: React.FC<{ s: number }> = ({ s }) => (
  <SingleBox size={s} bg={COLORS.archives.bg1}>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.46)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.15)} fontWeight="bold" fontFamily="monospace">JSON</text>
    <text x={Math.round(s*0.5)} y={Math.round(s*0.64)} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={Math.round(s*0.14)} fontWeight="bold" fontFamily="monospace">YAML</text>
  </SingleBox>
);

// Health check / metadata / regex / unit
const ShieldCheckIcon: React.FC<{ s: number; color: string }> = ({ s, color }) => (
  <SingleBox size={s} bg={color}>
    <path d={`M ${Math.round(s*0.5)} ${Math.round(s*0.22)} L ${Math.round(s*0.72)} ${Math.round(s*0.32)} L ${Math.round(s*0.72)} ${Math.round(s*0.52)} Q ${Math.round(s*0.72)} ${Math.round(s*0.72)} ${Math.round(s*0.5)} ${Math.round(s*0.78)} Q ${Math.round(s*0.28)} ${Math.round(s*0.72)} ${Math.round(s*0.28)} ${Math.round(s*0.52)} L ${Math.round(s*0.28)} ${Math.round(s*0.32)} Z`} fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth={Math.max(1.5, s/22)} strokeLinejoin="round"/>
    <polyline points={`${Math.round(s*0.4)},${Math.round(s*0.52)} ${Math.round(s*0.48)},${Math.round(s*0.6)} ${Math.round(s*0.62)},${Math.round(s*0.44)}`} stroke="white" strokeWidth={Math.max(2, s/18)} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </SingleBox>
);

/**
 * Main export: renders the correct illustrated SVG icon for every tool ID
 */
export const ILovePdfToolIcon: React.FC<IconProps> = ({ toolId, size = 48 }) => {
  const s = size;
  switch (toolId) {
    // Organize PDF
    case 'pdf-merge':          return <MergePdfIcon s={s} />;
    case 'pdf-split':          return <SplitPdfIcon s={s} />;
    case 'pdf-remove-pages':   return <RemovePagesIcon s={s} />;
    case 'pdf-extract-pages':  return <ExtractPagesIcon s={s} />;
    case 'pdf-organize':       return <OrganizePdfIcon s={s} />;
    case 'pdf-rotate':         return <RotatePdfIcon s={s} />;
    // Optimize PDF
    case 'pdf-compress':       return <CompressPdfIcon s={s} />;
    case 'pdf-repair':         return <RepairPdfIcon s={s} />;
    case 'pdf-ocr':            return <OcrPdfIcon s={s} />;
    // Convert to PDF
    case 'images-to-pdf':      return <ImageToPdfIcon s={s} />;
    case 'word-to-pdf':        return <WordToPdfIcon s={s} />;
    case 'excel-to-pdf':       return <ExcelToPdfIcon s={s} />;
    case 'text-to-pdf':        return <TextToPdfIcon s={s} />;
    // Convert from PDF
    case 'pdf-to-images':      return <PdfToImageIcon s={s} />;
    case 'pdf-to-word':        return <PdfToWordIcon s={s} />;
    case 'pdf-to-excel':       return <PdfToExcelIcon s={s} />;
    case 'pdf-to-text':        return <PdfToTextIcon s={s} />;
    // Edit PDF
    case 'pdf-page-numbers':   return <PageNumIcon s={s} />;
    case 'pdf-watermark':      return <WatermarkIcon s={s} />;
    case 'pdf-crop':           return <CropIcon s={s} />;
    case 'pdf-edit':           return <EditPdfIcon s={s} />;
    case 'pdf-flatten':        return <GenericDocIcon s={s} color={COLORS.edit.bg1} letter="F" />;
    case 'pdf-forms':          return <GenericDocIcon s={s} color={COLORS.edit.bg1} letter="☑" />;
    // PDF Security
    case 'pdf-protect':        return <ProtectPdfIcon s={s} />;
    case 'pdf-unlock':         return <UnlockPdfIcon s={s} />;
    case 'pdf-sign':           return <SignPdfIcon s={s} />;
    case 'pdf-true-redaction': return <RedactIcon s={s} />;
    case 'pdf-visual-diff':    return <DiffIcon s={s} />;
    // Dev Tools
    case 'hash-checker':       return <HashIcon s={s} />;
    case 'base64-tool':        return <Base64Icon s={s} />;
    case 'metadata-scrubber':  return <ShieldCheckIcon s={s} color={COLORS.dev.bg1} />;
    case 'file-health-check':  return <ShieldCheckIcon s={s} color="#5C6BC0" />;
    case 'word-counter':       return <GenericDocIcon s={s} color={COLORS.dev.bg1} />;
    case 'diff-checker':       return <DiffIcon s={s} />;
    case 'regex-tester':       return <GenericDocIcon s={s} color={COLORS.dev.bg1} letter=".*" />;
    case 'unit-converter':     return <GenericDocIcon s={s} color={COLORS.dev.bg1} letter="≈" />;
    // Docs
    case 'docx-converter':     return <DocxIcon s={s} />;
    case 'markdown-html':      return <MarkdownIcon s={s} />;
    case 'spreadsheet-converter': return <SpreadsheetIcon s={s} />;
    // Archives
    case 'zip-create':
    case 'zip-extract':        return <ZipIcon s={s} />;
    case 'bulk-rename':        return <RenameIcon s={s} />;
    case 'json-yaml-converter':return <JsonYamlIcon s={s} />;
    case 'xml-json-converter': return <GenericDocIcon s={s} color={COLORS.archives.bg1} letter="XML" />;
    // Photos & Government Form Tools
    case 'passport-photo-maker':
      return (
        <SingleBox size={s} bg="#0D9488">
          <circle cx={Math.round(s*0.5)} cy={Math.round(s*0.38)} r={Math.round(s*0.16)} fill="white" />
          <path d={`M ${Math.round(s*0.22)} ${Math.round(s*0.78)} C ${Math.round(s*0.22)} ${Math.round(s*0.58)}, ${Math.round(s*0.78)} ${Math.round(s*0.58)}, ${Math.round(s*0.78)} ${Math.round(s*0.78)} Z`} fill="white" />
          <rect x={Math.round(s*0.14)} y={Math.round(s*0.14)} width={Math.round(s*0.72)} height={Math.round(s*0.72)} rx="4" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.8" />
        </SingleBox>
      );
    case 'custom-size-reducer':
      return (
        <SingleBox size={s} bg="#EA580C">
          <path d={`M ${Math.round(s*0.25)} ${Math.round(s*0.25)} L ${Math.round(s*0.75)} ${Math.round(s*0.25)} L ${Math.round(s*0.75)} ${Math.round(s*0.75)} L ${Math.round(s*0.25)} ${Math.round(s*0.75)} Z`} stroke="white" strokeWidth="1.5" strokeDasharray="2 2" fill="none" opacity="0.6" />
          <rect x={Math.round(s*0.35)} y={Math.round(s*0.35)} width={Math.round(s*0.3)} height={Math.round(s*0.3)} rx="2" fill="white" />
          <text x={Math.round(s*0.5)} y={Math.round(s*0.88)} textAnchor="middle" fill="white" fontSize={Math.round(s*0.16)} fontWeight="bold" fontFamily="monospace">KB</text>
        </SingleBox>
      );
    case 'image-resize':
      return (
        <SingleBox size={s} bg="#0284C7">
          <rect x={Math.round(s*0.2)} y={Math.round(s*0.2)} width={Math.round(s*0.6)} height={Math.round(s*0.6)} rx="3" stroke="white" strokeWidth="2" fill="none" />
          <polyline points={`${Math.round(s*0.6)},${Math.round(s*0.7)} ${Math.round(s*0.7)},${Math.round(s*0.7)} ${Math.round(s*0.7)},${Math.round(s*0.6)}`} stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        </SingleBox>
      );
    case 'image-compress':
      return <CompressPdfIcon s={s} />;
    case 'image-crop':
      return <CropIcon s={s} />;
    case 'image-remove-bg':
      return (
        <SingleBox size={s} bg="#8B5CF6">
          <circle cx={Math.round(s*0.5)} cy={Math.round(s*0.4)} r={Math.round(s*0.16)} fill="white" />
          <path d={`M ${Math.round(s*0.26)} ${Math.round(s*0.75)} C ${Math.round(s*0.26)} ${Math.round(s*0.6)}, ${Math.round(s*0.74)} ${Math.round(s*0.6)}, ${Math.round(s*0.74)} ${Math.round(s*0.75)} Z`} fill="white" />
          <path d={`M ${Math.round(s*0.7)} ${Math.round(s*0.25)} L ${Math.round(s*0.74)} ${Math.round(s*0.33)} L ${Math.round(s*0.82)} ${Math.round(s*0.35)} L ${Math.round(s*0.76)} ${Math.round(s*0.41)} L ${Math.round(s*0.78)} ${Math.round(s*0.49)} L ${Math.round(s*0.7)} ${Math.round(s*0.44)} Z`} fill="#FDE047" />
        </SingleBox>
      );

    // Default fallback
    default:
      return <GenericDocIcon s={s} color="#888888" />;
  }
};
