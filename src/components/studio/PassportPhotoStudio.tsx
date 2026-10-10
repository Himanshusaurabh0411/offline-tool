import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  Move, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Layers, 
  Sliders, 
  ArrowLeft,
  Camera,
  Scissors
} from 'lucide-react';
import { ToolInputFile } from '../../core/plugins/types';
import { removeOrReplaceBackground } from '../../tools/images/bgRemovalHelper';

interface PassportPhotoStudioProps {
  file: File | ToolInputFile;
  onBack: () => void;
}

type CountryFormat = 'in-35x45' | 'us-2x2' | 'ca-50x70' | 'schengen';

interface FormatConfig {
  name: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  sheetCols: number;
  sheetRows: number;
}

const FORMATS: Record<CountryFormat, FormatConfig> = {
  'in-35x45': {
    name: 'India / UK / Europe (35 × 45 mm)',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    sheetCols: 4,
    sheetRows: 2,
  },
  'us-2x2': {
    name: 'US Passport & Visa (2 × 2 inches / 51 × 51 mm)',
    widthMm: 51,
    heightMm: 51,
    widthPx: 600,
    heightPx: 600,
    sheetCols: 2,
    sheetRows: 2,
  },
  'ca-50x70': {
    name: 'Canada Passport (50 × 70 mm)',
    widthMm: 50,
    heightMm: 70,
    widthPx: 590,
    heightPx: 826,
    sheetCols: 2,
    sheetRows: 2,
  },
  'schengen': {
    name: 'Schengen Visa (35 × 45 mm)',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    sheetCols: 4,
    sheetRows: 2,
  },
};

const BG_PRESETS = [
  { id: 'white', name: 'White', color: '#FFFFFF', desc: 'US, UK, Schengen, Passport India' },
  { id: 'lightblue', name: 'Light Blue', color: '#CAE8FF', desc: 'SSC, UPSC, Govt Exams' },
  { id: 'blue', name: 'Royal Blue', color: '#2563EB', desc: 'Corporate / ID Badges' },
  { id: 'red', name: 'Classic Red', color: '#DC2626', desc: 'Asian Passports / ID' },
  { id: 'lightgrey', name: 'Light Grey', color: '#F3F4F6', desc: 'Canada & EU Standard' },
  { id: 'original', name: 'Original', color: 'transparent', desc: 'Keep original background' },
];

export const PassportPhotoStudio: React.FC<PassportPhotoStudioProps> = ({ file, onBack }) => {
  const [selectedFormat, setSelectedFormat] = useState<CountryFormat>('in-35x45');
  const [selectedBg, setSelectedBg] = useState<string>('white');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');
  const [removeBg, setRemoveBg] = useState<boolean>(true);
  
  // Interactive Alignment Controls
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'single' | 'sheet'>('single');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const rawImageRef = useRef<HTMLImageElement | null>(null);

  // Load image element
  useEffect(() => {
    const img = new Image();
    const blob = file instanceof Blob ? file : new Blob([(file as any).data], { type: file.type });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      rawImageRef.current = img;
      renderLiveCanvas();
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const cfg = FORMATS[selectedFormat];

  // Render the single photo onto canvas with face transform and background replacement
  const renderLiveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = rawImageRef.current;
    if (!canvas || !img) return;

    const w = cfg.widthPx;
    const h = cfg.heightPx;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // 1. Calculate base cover fit
    const targetRatio = w / h;
    const imgRatio = img.width / img.height;
    let baseW = w;
    let baseH = h;
    if (imgRatio > targetRatio) {
      baseW = h * imgRatio;
    } else {
      baseH = w / imgRatio;
    }

    // 2. Clear canvas
    ctx.clearRect(0, 0, w, h);

    // 3. Draw image centered with user transform (Zoom, Pan, Rotation)
    ctx.save();
    ctx.translate(w / 2 + panX, h / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();

    // 4. Background removal & replacement if requested
    if (removeBg && selectedBg !== 'original') {
      const activeColor = selectedBg === 'custom' ? customColor : selectedBg;
      removeOrReplaceBackground(ctx, w, h, {
        tolerance: 30,
        replaceBgColor: activeColor,
      });
    }

    // 5. Delicate outer cut boundary guide
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    // Update 4x6 sheet canvas
    renderSheetCanvas(canvas);
  }, [cfg, panX, panY, zoom, rotation, removeBg, selectedBg, customColor]);

  // Render 4x6 print sheet (1800 x 1200 px)
  const renderSheetCanvas = (sourceCanvas: HTMLCanvasElement) => {
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;

    sheetCanvas.width = 1800; // 6 inches @ 300 DPI
    sheetCanvas.height = 1200; // 4 inches @ 300 DPI
    const sCtx = sheetCanvas.getContext('2d');
    if (!sCtx) return;

    sCtx.fillStyle = '#FFFFFF';
    sCtx.fillRect(0, 0, 1800, 1200);

    const cols = cfg.sheetCols;
    const rows = cfg.sheetRows;
    const pw = cfg.widthPx;
    const ph = cfg.heightPx;

    const gapX = Math.round((1800 - (cols * pw)) / (cols + 1));
    const gapY = Math.round((1200 - (rows * ph)) / (rows + 1));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gapX + c * (pw + gapX);
        const y = gapY + r * (ph + gapY);
        sCtx.drawImage(sourceCanvas, x, y);
        // Cutting guide dashed borders
        sCtx.strokeStyle = '#E5E7EB';
        sCtx.lineWidth = 1;
        sCtx.strokeRect(x, y, pw, ph);
      }
    }
  };

  useEffect(() => {
    renderLiveCanvas();
  }, [renderLiveCanvas]);

  // Download Single Photo
  const handleDownloadSingle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passport-photo-${cfg.widthMm}x${cfg.heightMm}mm.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.98);
  };

  // Download Printable 4x6 Sheet
  const handleDownloadSheet = () => {
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;

    sheetCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passport-4x6-print-sheet-${cfg.sheetCols * cfg.sheetRows}-photos.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.98);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#E5322D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Live Biometric Studio Active (100% In-Browser)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Interactive Canvas Stage */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            
            {/* View Mode Toggle: Single vs 4x6 Sheet */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'single'
                      ? 'bg-white dark:bg-slate-900 text-[#E5322D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Single Biometric Photo
                </button>
                <button
                  onClick={() => setActiveTab('sheet')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'sheet'
                      ? 'bg-white dark:bg-slate-900 text-[#E5322D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  4×6 Studio Print Sheet ({cfg.sheetCols * cfg.sheetRows} Copies)
                </button>
              </div>

              {activeTab === 'single' && (
                <button
                  onClick={() => setShowBiometricGuide(p => !p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    showBiometricGuide
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Toggle official biometric eye & chin alignment guide"
                >
                  {showBiometricGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Biometric Guide</span>
                </button>
              )}
            </div>

            {/* Canvas Display Stage */}
            <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/60 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
              
              {/* Single Photo Stage */}
              <div className={`relative flex items-center justify-center ${activeTab === 'single' ? '' : 'hidden'}`}>
                <canvas
                  ref={canvasRef}
                  className="rounded-lg shadow-2xl max-h-[360px] sm:max-h-[400px] w-auto border border-white dark:border-slate-700 select-none"
                />

                {/* Biometric Head, Eyes & Chin Alignment Overlay */}
                {showBiometricGuide && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    {/* Head oval */}
                    <div className="w-[62%] h-[68%] rounded-full border-2 border-dashed border-red-500/80 shadow-xs flex flex-col justify-between items-center py-6">
                      {/* Eyes guide line */}
                      <div className="w-full border-t border-dotted border-red-400/90 relative">
                        <span className="absolute -top-3.5 left-2 text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight bg-white/80 dark:bg-slate-900/80 px-1 rounded">
                          Eye Level
                        </span>
                      </div>
                      {/* Chin guide line */}
                      <div className="w-4/5 border-t border-dotted border-red-400/90 relative">
                        <span className="absolute -top-3.5 right-2 text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight bg-white/80 dark:bg-slate-900/80 px-1 rounded">
                          Chin Bottom
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4x6 Printable Sheet Stage */}
              <div className={`relative flex items-center justify-center ${activeTab === 'sheet' ? '' : 'hidden'}`}>
                <canvas
                  ref={sheetCanvasRef}
                  className="rounded-lg shadow-2xl max-h-[360px] sm:max-h-[400px] w-auto border border-white dark:border-slate-700 select-none"
                />
              </div>

            </div>

            {/* Quick Interactive Face Adjusters (Zoom, Pan, Rotate) */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                
                {/* Zoom */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                      <span>Zoom Face</span>
                    </span>
                    <span className="font-mono text-slate-400">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#E5322D]"
                  />
                </div>

                {/* Pan X */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-slate-400" />
                      <span>Horizontal (Pan X)</span>
                    </span>
                    <span className="font-mono text-slate-400">{panX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={panX}
                    onChange={(e) => setPanX(parseInt(e.target.value))}
                    className="w-full accent-[#E5322D]"
                  />
                </div>

                {/* Pan Y */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-slate-400" />
                      <span>Vertical (Pan Y)</span>
                    </span>
                    <span className="font-mono text-slate-400">{panY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={panY}
                    onChange={(e) => setPanY(parseInt(e.target.value))}
                    className="w-full accent-[#E5322D]"
                  />
                </div>

              </div>

              {/* Reset & Rotate Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  onClick={() => {
                    setZoom(1.0);
                    setPanX(0);
                    setPanY(0);
                    setRotation(0);
                  }}
                  className="text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer font-semibold"
                >
                  Reset Alignment
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Biometric Controls & One-Click Download */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Format Selection Card */}
          <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#E5322D]" />
              <span>Standard Biometric Country Format</span>
            </h3>
            
            <div className="space-y-2">
              {(Object.keys(FORMATS) as CountryFormat[]).map((fKey) => {
                const f = FORMATS[fKey];
                const isSelected = selectedFormat === fKey;
                return (
                  <button
                    key={fKey}
                    onClick={() => setSelectedFormat(fKey)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#E5322D] bg-red-50/40 dark:bg-red-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[13.5px] text-slate-900 dark:text-white">
                        {f.name}
                      </div>
                      <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {f.widthMm} × {f.heightMm} mm ({f.widthPx} × {f.heightPx} px @ 300 DPI)
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#E5322D] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Remover & Color Palette */}
          <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#E5322D]" />
                  <span>Background Color Changer</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">1-click offline background color replacement</p>
              </div>

              {/* Toggle switch */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={removeBg}
                  onChange={(e) => setRemoveBg(e.target.checked)}
                  className="rounded text-[#E5322D] focus:ring-[#E5322D] cursor-pointer"
                />
                <span>Enable</span>
              </label>
            </div>

            {removeBg && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {BG_PRESETS.map((preset) => {
                    const isSelected = selectedBg === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedBg(preset.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-[#E5322D] bg-red-50/50 dark:bg-red-950/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: preset.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {preset.desc.split(',')[0]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Picker */}
                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bgType"
                      checked={selectedBg === 'custom'}
                      onChange={() => setSelectedBg('custom')}
                      className="text-[#E5322D] focus:ring-[#E5322D]"
                    />
                    <span>Custom Color</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedBg('custom');
                      }}
                      className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-400">{customColor}</span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Action Download Buttons */}
          <div className="space-y-3 pt-2">
            
            {/* Primary Action Button: Single Photo */}
            <button
              onClick={handleDownloadSingle}
              className="w-full h-14 rounded-2xl bg-[#E5322D] hover:bg-[#c92520] text-white font-black text-base shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="w-5 h-5" />
              <span>Download Passport Photo ({cfg.widthMm}×{cfg.heightMm}mm)</span>
            </button>

            {/* Secondary Action Button: 4x6 Print Sheet */}
            <button
              onClick={handleDownloadSheet}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Layers className="w-4 h-4" />
              <span>Download 4×6 Print Sheet ({cfg.sheetCols * cfg.sheetRows} Copies)</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
