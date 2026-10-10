import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Download,
  RotateCcw,
  History,
  XCircle,
  FileCheck,
  Loader2,
  Share2,
  Sliders,
  CheckCircle2,
  UploadCloud,
  File
} from 'lucide-react';
import { ToolPlugin, ToolOutputItem } from '../../core/plugins/types';
import { executeTool, ExecutionController } from '../../core/plugins/runner';
import { BatchQueue } from './BatchQueue';
import { QualitySlider } from './QualitySlider';
import { VersionTimelineModal } from './VersionTimelineModal';
import { useI18n } from '../../i18n';
import { getToolIcon, CategoryBadge } from '../common/iconSystem';

interface ToolViewProps {
  plugin: ToolPlugin;
  initialFiles?: File[];
  onBack: () => void;
  onSendToTool: (files: File[]) => void;
}

export const ToolView: React.FC<ToolViewProps> = ({
  plugin,
  initialFiles = [],
  onBack,
  onSendToTool,
}) => {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [options, setOptions] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const opt of plugin.optionsSchema) {
      initial[opt.id] = opt.defaultValue;
    }
    return initial;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [results, setResults] = useState<ToolOutputItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeControllerRef = useRef<ExecutionController | null>(null);

  useEffect(() => {
    setFiles(initialFiles);
    setResults(null);
    setError(null);
  }, [plugin, initialFiles]);

  const handleOptionChange = (id: string, value: any) => {
    setOptions(prev => ({ ...prev, [id]: value }));
  };

  const handleRun = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Starting processing...');
    setError(null);
    setResults(null);

    const controller = new ExecutionController();
    activeControllerRef.current = controller;

    try {
      const output = await executeTool(
        plugin,
        files,
        options,
        (pct, msg) => {
          setProgress(pct);
          if (msg) setStatusMessage(msg);
        },
        controller
      );
      setResults(output);
      setProgress(100);
      setStatusMessage('Completed successfully!');
    } catch (err: any) {
      if (controller.isCancelled()) {
        setStatusMessage('Cancelled by user');
      } else {
        setError(err.message || 'Operation failed');
      }
    } finally {
      setIsProcessing(false);
      activeControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.cancel();
      setStatusMessage('Cancelling...');
    }
  };

  const handleDownload = (output: ToolOutputItem) => {
    let blob: Blob;
    if (output.data instanceof Blob) {
      blob = output.data;
    } else if (output.data instanceof Uint8Array) {
      blob = new Blob([output.data as any], { type: output.type });
    } else {
      blob = new Blob([String(output.data)], { type: output.type });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = output.downloadName || output.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleSendToNextTool = () => {
    if (!results || results.length === 0) return;
    const outputFiles = results.map(r => {
      const blob = r.data instanceof Blob ? r.data : new Blob([r.data as any], { type: r.type });
      return new (window as any).File([blob], r.downloadName || r.name, { type: r.type }) as File;
    });
    onSendToTool(outputFiles);
  };

  const isCompressTool = plugin.id.includes('compress');

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'pdf':
        return { badge: 'bg-rose-50 text-rose-600 border-rose-200', btn: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/25' };
      case 'documents':
        return { badge: 'bg-blue-50 text-blue-600 border-blue-200', btn: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25' };
      case 'images':
        return { badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', btn: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25' };
      case 'media':
        return { badge: 'bg-purple-50 text-purple-600 border-purple-200', btn: 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-purple-500/25' };
      case 'archives':
        return { badge: 'bg-amber-50 text-amber-700 border-amber-200', btn: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25' };
      default:
        return { badge: 'bg-indigo-50 text-indigo-600 border-indigo-200', btn: 'from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25' };
    }
  };

  const theme = getCategoryTheme(plugin.category);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white border border-stone-200/80 transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tools</span>
        </button>

        <button
          onClick={() => setIsTimelineOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-stone-200/80 text-xs font-semibold text-stone-700 hover:bg-white transition-all shadow-xs"
        >
          <History className="w-3.5 h-3.5 text-stone-500" />
          <span>{t('tool.history_versions')}</span>
        </button>
      </div>

      {/* Tool Header Banner */}
      <div className="p-6 sm:p-7 rounded-[22px] bg-white border border-stone-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-100/50 via-amber-100/30 to-transparent rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              {getToolIcon(plugin.id, plugin.category)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <CategoryBadge category={plugin.category} />
                <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  100% Client-Side WebAssembly
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-1">{plugin.name}</h1>
              <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">{plugin.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Files Mode -> Direct Batch Queue */}
      {files.length > 1 && (
        <BatchQueue
          files={files}
          plugin={plugin}
          options={options}
          onClear={() => setFiles([])}
          onSendToTool={onSendToTool}
        />
      )}

      {/* Single File Mode */}
      {files.length <= 1 && (
        <div className="space-y-6">
          {/* File Picker or Card */}
          {files.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-rose-200/90 hover:border-rose-400 rounded-[22px] p-8 sm:p-12 text-center cursor-pointer bg-white/80 hover:bg-rose-50/20 transition-all group shadow-sm hover:shadow-md"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) setFiles(Array.from(e.target.files));
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-rose-50 group-hover:bg-rose-100 text-rose-500 mx-auto flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mt-4">Select or drop file to process</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Files are processed entirely in memory on your device.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100/80 text-[11px] font-mono text-stone-600">
                {plugin.acceptedExtensions.join(', ') || 'All supported files'}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-[20px] bg-white border border-stone-200/80 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-stone-900">{files[0].name}</div>
                  <div className="text-xs text-stone-500 font-mono">
                    {(files[0].size / (1024 * 1024)).toFixed(2)} MB • {files[0].type || 'Binary'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setFiles([]);
                  setResults(null);
                }}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3.5 py-1.5 rounded-full border border-stone-200/80 hover:bg-stone-50 transition-colors shadow-2xs"
              >
                Change File
              </button>
            </div>
          )}

          {/* Optional: Quality vs Size Slider */}
          {isCompressTool && files.length === 1 && (
            <QualitySlider
              originalFile={files[0]}
              initialQuality={options.quality || 80}
              onChange={(q, scale) => {
                handleOptionChange('quality', q);
                handleOptionChange('scale', scale);
              }}
            />
          )}

          {/* Options Schema Form */}
          {plugin.optionsSchema.length > 0 && (
            <div className="p-5 sm:p-6 rounded-[22px] bg-white border border-stone-200/80 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-rose-500" /> Options & Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plugin.optionsSchema.map((opt) => (
                  <div key={opt.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">{opt.label}</label>
                    {opt.type === 'select' && (
                      <select
                        value={options[opt.id]}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs transition-all"
                      >
                        {opt.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {opt.type === 'string' && (
                      <input
                        type="text"
                        value={options[opt.id] ?? ''}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs transition-all"
                        placeholder={opt.description}
                      />
                    )}
                    {opt.type === 'boolean' && (
                      <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(options[opt.id])}
                          onChange={(e) => handleOptionChange(opt.id, e.target.checked)}
                          className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-medium">{opt.description || opt.label}</span>
                      </label>
                    )}
                    {opt.type === 'number' && (
                      <input
                        type="number"
                        min={opt.min}
                        max={opt.max}
                        step={opt.step || 1}
                        value={options[opt.id] ?? opt.defaultValue}
                        onChange={(e) => handleOptionChange(opt.id, Number(e.target.value))}
                        className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger & Progress Bar */}
          {files.length > 0 && !results && (
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRun}
                  disabled={isProcessing}
                  className={`flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r ${theme.btn} disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2.5`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('tool.processing')}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      {t('tool.run')}
                    </>
                  )}
                </button>

                {isProcessing && (
                  <button
                    onClick={handleCancel}
                    className="py-3 px-5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('tool.cancel')}
                  </button>
                )}
              </div>

              {isProcessing && (
                <div className="space-y-2 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="flex justify-between text-xs text-stone-600 font-medium">
                    <span>{statusMessage}</span>
                    <span className="font-mono font-bold text-rose-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Result Presentation */}
          {results && (
            <div className="p-6 sm:p-7 rounded-[22px] bg-white border border-stone-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">Processing Complete</h3>
                  <p className="text-xs text-stone-500">
                    Your output was generated 100% locally on your machine.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {results.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-stone-900">{res.downloadName || res.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{res.type}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(res)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t('tool.download')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Steps: Send to next tool or Process another */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                <button
                  onClick={handleSendToNextTool}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/70 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  {t('tool.send_to_next')}
                </button>

                <button
                  onClick={() => {
                    setResults(null);
                    setFiles([]);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  Process Another File
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Version Timeline Modal */}
      <VersionTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        fileName={files[0]?.name}
        onRestoreVersion={(restoredFile) => {
          setFiles([restoredFile]);
          setResults(null);
        }}
      />
    </div>
  );
};
