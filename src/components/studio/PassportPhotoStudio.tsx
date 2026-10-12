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
  Sliders, 
  ArrowLeft,
  Camera,
  Scissors,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ToolInputFile } from '../../core/plugins/types';
import { 
  removeImageBackground, 
  RemovalProgressCallback 
} from '../../core/ai/backgroundRemovalService';

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
    name: 'US Passport & Visa (2 × 2 in / 51 × 51 mm)',
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
  { id: 'transparent', name: 'Transparent (PNG)', color: 'transparent', desc: 'Alpha cutout without background' },
  { id: 'original', name: 'Original', color: 'transparent', desc: 'Keep original background' },
];

export const PassportPhotoStudio: React.FC<PassportPhotoStudioProps> = ({ file, onBack }) => {
  const [selectedFormat, setSelectedFormat] = useState<CountryFormat>('in-35x45');
  const [selectedBg, setSelectedBg] = useState<string>('white');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');
  const [removeBg, setRemoveBg] = useState<boolean>(true);

  // AI Matting State
  const [isSegmenting, setIsSegmenting] = useState<boolean>(false);
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [aiMessage, setAiMessage] = useState<string>('Initializing AI neural network...');
  const [aiEngine, setAiEngine] = useState<'rmbg' | 'modnet' | 'fallback' | null>(null);
  const [segmentationError, setSegmentationError] = useState<string | null>(null);

  // Interactive Alignment Controls
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'single' | 'sheet'>('single');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const rawImageRef = useRef<HTMLImageElement | null>(null);
  const rawBlobRef = useRef<Blob | null>(null);
  const cutoutDrawableRef = useRef<ImageBitmap | HTMLImageElement | null>(null);
  const isAbortedRef = useRef<boolean>(false);

  // Drag & Touch interaction refs
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  const cfg = FORMATS[selectedFormat];

  // Render 4x6 print sheet (1800 x 1200 px at 300 DPI)
  const renderSheetCanvas = useCallback((sourceCanvas: HTMLCanvasElement) => {
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
  }, [cfg]);

  // Render the single photo onto canvas with face transform and background replacement
  const renderLiveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = rawImageRef.current;
    if (!canvas || !img) return;

    const w = cfg.widthPx;
    const h = cfg.heightPx;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
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

    // 3. Draw background color if background removal is active and not original
    const shouldUseCutout = removeBg && selectedBg !== 'original' && cutoutDrawableRef.current;
    if (shouldUseCutout && selectedBg !== 'transparent') {
      let bgFill = '#FFFFFF';
      if (selectedBg === 'white') bgFill = '#FFFFFF';
      else if (selectedBg === 'lightblue') bgFill = '#CAE8FF';
      else if (selectedBg === 'blue') bgFill = '#2563EB';
      else if (selectedBg === 'red') bgFill = '#DC2626';
      else if (selectedBg === 'lightgrey') bgFill = '#F3F4F6';
      else if (selectedBg === 'custom') bgFill = customColor;

      ctx.fillStyle = bgFill;
      ctx.fillRect(0, 0, w, h);
    }

    // 4. Source image element to draw: cleanly segmented AI cutout OR original image
    const sourceDrawable: CanvasImageSource = shouldUseCutout ? cutoutDrawableRef.current! : img;

    // 5. Draw image centered with user transform (Zoom, Pan, Rotation)
    ctx.save();
    ctx.translate(w / 2 + panX, h / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceDrawable, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();

    // 6. Subtle outer boundary cut guide
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    // Update 4x6 print sheet
    renderSheetCanvas(canvas);
  }, [cfg, panX, panY, zoom, rotation, removeBg, selectedBg, customColor, renderSheetCanvas]);

  // Execute AI background segmentation using RMBG-1.4 model
  const runBackgroundSegmentation = useCallback(async (blobToUse?: Blob) => {
    const b = blobToUse || rawBlobRef.current;
    if (!b) return;

    setIsSegmenting(true);
    setAiProgress(8);
    setAiMessage('Loading RMBG-1.4 AI neural network...');
    setSegmentationError(null);

    const onProgress: RemovalProgressCallback = (stage, pct, detail) => {
      if (isAbortedRef.current) return;
      setAiProgress(pct);
      if (stage === 'downloading') {
        setAiMessage(detail || `Downloading AI weights (${pct}%)...`);
      } else if (stage === 'processing') {
        setAiMessage(detail || 'Executing deep neural matting at 1024×1024...');
      } else if (stage === 'finishing') {
        setAiMessage(detail || 'Refining alpha matte & edges...');
      }
    };

    try {
      const { blob: outputBlob, engine } = await removeImageBackground(b, onProgress);
      if (isAbortedRef.current) return;

      const bmp = await createImageBitmap(outputBlob);
      cutoutDrawableRef.current = bmp;
      setAiEngine(engine);
      setAiProgress(100);
      setIsSegmenting(false);
      renderLiveCanvas();
    } catch (err: any) {
      console.error('Passport studio AI segmentation error:', err);
      if (!isAbortedRef.current) {
        setSegmentationError(err?.message || 'AI background removal failed. You can retry.');
        setIsSegmenting(false);
      }
    }
  }, [renderLiveCanvas]);

  // Initial load of image element & kick off AI segmentation
  useEffect(() => {
    isAbortedRef.current = false;
    const rawBlob = file instanceof Blob ? file : new Blob([(file as any).data], { type: file.type });
    rawBlobRef.current = rawBlob;

    const img = new Image();
    const url = URL.createObjectURL(rawBlob);
    img.onload = () => {
      rawImageRef.current = img;
      renderLiveCanvas();
      if (removeBg) {
        runBackgroundSegmentation(rawBlob);
      }
    };
    img.src = url;

    return () => {
      isAbortedRef.current = true;
      URL.revokeObjectURL(url);
    };
  }, [file]); // run once per file

  // Trigger render when relevant state changes
  useEffect(() => {
    renderLiveCanvas();
  }, [renderLiveCanvas, isSegmenting, aiEngine, removeBg, selectedBg, customColor, zoom, panX, panY, rotation, selectedFormat]);

  // Handle toggle of background removal checkbox
  const handleToggleRemoveBg = (checked: boolean) => {
    setRemoveBg(checked);
    if (checked && !cutoutDrawableRef.current && !isSegmenting) {
      runBackgroundSegmentation();
    }
  };

  // Mouse drag handlers on canvas stage
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: panX, y: panY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(panStartRef.current.x + dx);
    setPanY(panStartRef.current.y + dy);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan & pinch-zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { x: panX, y: panY };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPanX(panStartRef.current.x + dx);
      setPanY(panStartRef.current.y + dy);
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = newDist / touchDistanceRef.current;
      touchDistanceRef.current = newDist;
      setZoom((z) => Math.min(3.5, Math.max(0.4, Number((z * ratio).toFixed(2)))));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((z) => Math.min(3.5, Math.max(0.4, Number((z + delta).toFixed(2)))));
  };

  // Download Single Photo
  const handleDownloadSingle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isPng = selectedBg === 'transparent';
    const mime = isPng ? 'image/png' : 'image/jpeg';
    const ext = isPng ? 'png' : 'jpg';

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passport-photo-${cfg.widthMm}x${cfg.heightMm}mm.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }, mime, 0.98);
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

  // Auto-center / fit reset
  const handleResetAlignment = () => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setRotation(0);
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

        <div className="flex flex-wrap items-center gap-3">
          {/* AI Segmentation Status Indicator */}
          {isSegmenting ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E5322D]" />
              <span>AI Matting: {aiProgress}%</span>
            </span>
          ) : aiEngine ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>{aiEngine === 'rmbg' ? 'RMBG-1.4 AI (1024px)' : aiEngine === 'modnet' ? 'MODNet AI' : 'Boundary Matting'}</span>
            </span>
          ) : null}

          {/* Privacy badge */}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% In-Browser & Private</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Interactive Canvas Stage */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            
            {/* View Mode Toggle: Single vs 4x6 Sheet */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
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
            <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/60 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 select-none">
              
              {/* AI Processing Overlay */}
              {isSegmenting && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-20 animate-in fade-in duration-200 rounded-xl">
                  <div className="w-full max-w-xs space-y-3.5 text-center">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-[#E5322D] shadow-md border border-red-200/50 dark:border-red-800/50">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#E5322D]" />
                        <span>AI Deep Neural Matting</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {aiMessage}
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/40">
                      <div 
                        className="bg-linear-to-r from-red-500 to-[#E5322D] h-full transition-all duration-300 rounded-full" 
                        style={{ width: `${Math.max(6, aiProgress)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                      <span>RMBG-1.4 1024px</span>
                      <span className="font-bold text-[#E5322D]">{aiProgress}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {segmentationError && (
                <div className="absolute top-4 left-4 right-4 z-20 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-between text-xs text-red-600 dark:text-red-400 shadow-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{segmentationError}</span>
                  </div>
                  <button
                    onClick={() => runBackgroundSegmentation()}
                    className="px-2.5 py-1 rounded bg-[#E5322D] text-white font-bold hover:bg-[#c92520] transition-colors cursor-pointer shrink-0"
                  >
                    Retry AI
                  </button>
                </div>
              )}

              {/* Single Photo Stage with Direct Drag & Wheel Zoom */}
              <div 
                className={`relative flex items-center justify-center ${activeTab === 'single' ? '' : 'hidden'}`}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheel}
                  className={`rounded-lg shadow-2xl max-h-[360px] sm:max-h-[400px] w-auto border border-white dark:border-slate-700 touch-none ${
                    selectedBg === 'transparent' ? 'bg-checkerboard' : ''
                  } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                />

                {/* Biometric Head, Eyes & Chin Alignment Overlay */}
                {showBiometricGuide && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-[62%] h-[68%] rounded-full border-2 border-dashed border-red-500/80 shadow-xs flex flex-col justify-between items-center py-6">
                      <div className="w-full border-t border-dotted border-red-400/90 relative">
                        <span className="absolute -top-3.5 left-2 text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight bg-white/90 dark:bg-slate-900/90 px-1 rounded shadow-2xs">
                          Eye Level
                        </span>
                      </div>
                      <div className="w-4/5 border-t border-dotted border-red-400/90 relative">
                        <span className="absolute -top-3.5 right-2 text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight bg-white/90 dark:bg-slate-900/90 px-1 rounded shadow-2xs">
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

            {/* Quick interactive dragging hint */}
            <div className="mt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Move className="w-3.5 h-3.5" />
              <span><strong>Tip:</strong> Drag image with mouse or finger to position face in oval. Scroll or pinch to zoom.</span>
            </div>

            {/* Interactive Face Adjusters (Zoom, Pan, Rotate) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="0.4"
                      max="3.5"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#E5322D]"
                    />
                    <button
                      onClick={() => setZoom(z => Math.min(3.5, Number((z + 0.1).toFixed(2))))}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                    min="-400"
                    max="400"
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
                    min="-400"
                    max="400"
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
                  onClick={handleResetAlignment}
                  className="text-xs text-slate-500 hover:text-[#E5322D] transition-colors cursor-pointer font-semibold"
                >
                  Reset Alignment & Fit
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Biometric Controls & One-Click Download */}
        <div className="lg:col-span-5 space-y-5">
          
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

          {/* AI Background Remover & Color Palette */}
          <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#E5322D]" />
                  <span>AI Background Remover & Color</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Deep neural network subject matting</p>
              </div>

              {/* Toggle switch */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={removeBg}
                  onChange={(e) => handleToggleRemoveBg(e.target.checked)}
                  className="rounded text-[#E5322D] focus:ring-[#E5322D] cursor-pointer"
                />
                <span>Enable AI</span>
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
                          style={{ 
                            backgroundColor: preset.color === 'transparent' ? '#F3F4F6' : preset.color,
                            backgroundImage: preset.id === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined,
                            backgroundSize: '6px 6px'
                          }}
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

                {/* AI Model Controls & Re-run */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5322D]" />
                    <span>
                      {aiEngine === 'rmbg' 
                        ? 'Bria RMBG-1.4 (1024px)' 
                        : aiEngine === 'modnet' 
                        ? 'MODNet Neural AI' 
                        : 'Neural Matting'}
                    </span>
                  </div>
                  <button
                    onClick={() => runBackgroundSegmentation()}
                    disabled={isSegmenting}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 font-bold hover:text-[#E5322D] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSegmenting ? 'animate-spin' : ''}`} />
                    <span>Re-run AI</span>
                  </button>
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
