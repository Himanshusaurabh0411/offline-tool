import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Sliders,
  Check,
  Split,
  Columns,
  Upload,
  AlertCircle,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ToolInputFile } from '../../core/plugins/types';
import {
  removeImageBackground,
  compositeCutoutOnColor,
  RemovalProgressCallback
} from '../../core/ai/backgroundRemovalService';

interface AiBackgroundRemoverStudioProps {
  file: File | ToolInputFile;
  onBack: () => void;
}

type ViewMode = 'split' | 'side-by-side';
type ProcessingStatus = 'idle' | 'downloading' | 'processing' | 'success' | 'error';

interface BgPreset {
  id: string;
  name: string;
  color: string;
  desc: string;
}

const BG_PRESETS: BgPreset[] = [
  { id: 'transparent', name: 'Transparent', color: 'transparent', desc: 'Alpha PNG cutout' },
  { id: 'white', name: 'Plain White', color: '#FFFFFF', desc: 'Standard eCommerce & ID' },
  { id: 'black', name: 'Solid Black', color: '#000000', desc: 'High-contrast studio' },
  { id: 'lightgrey', name: 'Studio Grey', color: '#F3F4F6', desc: 'Clean product backdrop' },
  { id: 'lightblue', name: 'Light Blue', color: '#CAE8FF', desc: 'Biometric passport & exams' },
  { id: 'blue', name: 'Royal Blue', color: '#2563EB', desc: 'Corporate & LinkedIn' },
  { id: 'red', name: 'Classic Red', color: '#DC2626', desc: 'Official Asian ID' },
];

export const AiBackgroundRemoverStudio: React.FC<AiBackgroundRemoverStudioProps> = ({ file, onBack }) => {
  const [currentFile, setCurrentFile] = useState<File | ToolInputFile>(file);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('Initializing AI engine...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Images URLs
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);

  // Interactive View Modes
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  // Background Customization
  const [selectedBg, setSelectedBg] = useState<string>('transparent');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');
  const [previewCompositeUrl, setPreviewCompositeUrl] = useState<string | null>(null);

  // Engine indicator
  const [usedEngine, setUsedEngine] = useState<'ai' | 'fallback'>('ai');

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and prepare original image
  useEffect(() => {
    const rawBlob = currentFile instanceof Blob ? currentFile : new Blob([(currentFile as any).data], { type: currentFile.type });
    const url = URL.createObjectURL(rawBlob);
    setOriginalUrl(url);

    // Run AI processing
    processImageWithAI(rawBlob);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentFile]);

  // Main processing pipeline
  const processImageWithAI = async (blob: Blob) => {
    setStatus('downloading');
    setProgress(5);
    setProgressMessage('Loading AI neural network (MODNet ONNX)...');
    setErrorMessage(null);
    abortControllerRef.current = false;

    const onProgress: RemovalProgressCallback = (stage, pct, detail) => {
      if (abortControllerRef.current) return;
      if (stage === 'downloading') {
        setStatus('downloading');
        setProgress(pct);
        setProgressMessage(detail || `Downloading AI weights (${pct}%)...`);
      } else if (stage === 'processing') {
        setStatus('processing');
        setProgress(pct);
        setProgressMessage(detail || 'Executing neural matting inference...');
      } else if (stage === 'finishing') {
        setProgress(pct);
        setProgressMessage(detail || 'Refining alpha matte...');
      }
    };

    try {
      const { blob: outputBlob, engine } = await removeImageBackground(blob, onProgress);
      if (abortControllerRef.current) return;

      const url = URL.createObjectURL(outputBlob);
      setCutoutBlob(outputBlob);
      setCutoutUrl(url);
      setUsedEngine(engine);
      setProgress(100);
      setStatus('success');
      setProgressMessage('Background removed successfully!');
    } catch (err: any) {
      if (abortControllerRef.current) return;
      setStatus('error');
      setErrorMessage(
        err.message || 'Background removal encountered an error. Please try again or upload a different image.'
      );
    }
  };

  // Update composite preview when background selection changes
  useEffect(() => {
    if (!cutoutBlob) {
      setPreviewCompositeUrl(null);
      return;
    }

    if (selectedBg === 'transparent') {
      setPreviewCompositeUrl(cutoutUrl);
      return;
    }

    const activeColor = selectedBg === 'custom' ? customColor : selectedBg;
    compositeCutoutOnColor(cutoutBlob, activeColor)
      .then((compBlob) => {
        const compUrl = URL.createObjectURL(compBlob);
        setPreviewCompositeUrl(compUrl);
      })
      .catch((err) => console.error('Compositing failed:', err));
  }, [cutoutBlob, cutoutUrl, selectedBg, customColor]);

  // Handle slider drag interaction
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = () => setIsDraggingSlider(true);
  const handleMouseUp = () => setIsDraggingSlider(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches.length > 0) handleSliderMove(e.touches[0].clientX);
    };
    const onEnd = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDraggingSlider, handleSliderMove]);

  // Download Output
  const handleDownload = () => {
    const isTrans = selectedBg === 'transparent';
    const activeUrl = isTrans ? cutoutUrl : previewCompositeUrl;
    if (!activeUrl) return;

    const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = activeUrl;
    a.download = `${baseName}-${isTrans ? 'nobg' : selectedBg}.png`;
    a.click();
  };

  // Replace image handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#E5322D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center gap-3">
          {usedEngine === 'ai' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Cpu className="w-3.5 h-3.5" />
              <span>MODNet Neural Matting Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline Matting Fallback</span>
            </span>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Replace Image</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Stage & Comparison Slider */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            
            {/* View Mode Toolbar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-[#E5322D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Before / After Slider</span>
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'side-by-side'
                      ? 'bg-white dark:bg-slate-900 text-[#E5322D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Side by Side</span>
                </button>
              </div>

              {status === 'success' && (
                <button
                  onClick={() => {
                    const rawBlob = currentFile instanceof Blob ? currentFile : new Blob([(currentFile as any).data], { type: currentFile.type });
                    processImageWithAI(rawBlob);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#E5322D] transition-colors cursor-pointer"
                  title="Re-run AI inference"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-process</span>
                </button>
              )}
            </div>

            {/* Display Stage */}
            <div className="relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/60 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 select-none">
              
              {/* Processing Overlay State */}
              {(status === 'downloading' || status === 'processing') && (
                <div className="absolute inset-0 bg-white/90 dark:bg-[#141518]/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#E5322D] flex items-center justify-center mb-4 shadow-sm animate-pulse">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    {progressMessage}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                    Inference executes 100% locally on your machine via WebAssembly & WebGPU.
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#E5322D] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 mt-2">{progress}%</span>
                </div>
              )}

              {/* Error State */}
              {status === 'error' && (
                <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
                    Processing Could Not Complete
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => {
                      const rawBlob = currentFile instanceof Blob ? currentFile : new Blob([(currentFile as any).data], { type: currentFile.type });
                      processImageWithAI(rawBlob);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E5322D] text-white text-xs font-bold shadow-md hover:bg-[#c92520] transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Success: Split Slider Mode */}
              {status === 'success' && viewMode === 'split' && originalUrl && cutoutUrl && (
                <div
                  ref={containerRef}
                  className="relative w-full max-w-xl aspect-4/3 sm:aspect-16/10 rounded-xl overflow-hidden shadow-xl cursor-ew-resize select-none"
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                >
                  {/* Background Layer: Cutout with selected background or checkerboard */}
                  <div 
                    className={`absolute inset-0 w-full h-full flex items-center justify-center ${
                      selectedBg === 'transparent' ? 'bg-checkerboard' : ''
                    }`}
                    style={{
                      backgroundColor: selectedBg !== 'transparent' ? (selectedBg === 'custom' ? customColor : BG_PRESETS.find(p => p.id === selectedBg)?.color) : undefined
                    }}
                  >
                    <img
                      src={previewCompositeUrl || cutoutUrl}
                      alt="Processed foreground"
                      className="max-h-full max-w-full object-contain pointer-events-none"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] font-black uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                      Removed Background
                    </span>
                  </div>

                  {/* Foreground Layer: Original image clipped by slider position */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <div 
                      className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900"
                      style={{
                        width: containerRef.current?.clientWidth || '100%',
                        height: containerRef.current?.clientHeight || '100%',
                      }}
                    >
                      <img
                        src={originalUrl}
                        alt="Original source"
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                      <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                        Original
                      </span>
                    </div>
                  </div>

                  {/* Divider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700">
                      <Split className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Success: Side-by-Side Mode */}
              {status === 'success' && viewMode === 'side-by-side' && originalUrl && cutoutUrl && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Original card */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original</span>
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-2 shadow-md">
                      <img src={originalUrl} alt="Original" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>

                  {/* Cutout card */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Cutout</span>
                    <div 
                      className={`w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center p-2 shadow-md ${
                        selectedBg === 'transparent' ? 'bg-checkerboard' : ''
                      }`}
                      style={{
                        backgroundColor: selectedBg !== 'transparent' ? (selectedBg === 'custom' ? customColor : BG_PRESETS.find(p => p.id === selectedBg)?.color) : undefined
                      }}
                    >
                      <img src={previewCompositeUrl || cutoutUrl} alt="Cutout" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Slider Drag Hint */}
            {status === 'success' && viewMode === 'split' && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Drag the slider left or right to inspect cut edges and fine details.
              </p>
            )}

          </div>
        </div>

        {/* Right Column: Instant Color Changer & One-Click Download */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Background Replacement Card */}
          <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#E5322D]" />
                <span>Replace Background Color</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Instant live change with zero re-inference</p>
            </div>

            {/* Color Presets Grid */}
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
                      className={`w-5 h-5 rounded-full border border-slate-300 shrink-0 shadow-2xs ${
                        preset.id === 'transparent' ? 'bg-checkerboard' : ''
                      }`}
                      style={{
                        backgroundColor: preset.id !== 'transparent' ? preset.color : undefined,
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {preset.desc.split(' ')[0]}
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

          {/* Download Action Button */}
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              disabled={status !== 'success'}
              className={`w-full h-14 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                status === 'success'
                  ? 'bg-[#E5322D] hover:bg-[#c92520] text-white shadow-red-500/25 hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>
                {selectedBg === 'transparent'
                  ? 'Download Transparent PNG'
                  : `Download with ${BG_PRESETS.find(p => p.id === selectedBg)?.name || 'Custom'} Background`}
              </span>
            </button>

            {/* Details badge */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11.5px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Output Format:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {selectedBg === 'transparent' ? 'PNG (32-bit RGBA)' : 'PNG (Opaque)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inference:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {usedEngine === 'ai' ? 'MODNet Neural Matting' : 'Perceptual Boundary'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Privacy:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Zero Data Egress (100% In-Browser)
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
