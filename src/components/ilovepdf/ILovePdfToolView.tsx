import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  RefreshCw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCheck,
  File,
  Sliders,
  Archive,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ToolPlugin, ToolOutputItem } from '../../core/plugins/types';
import { executeTool, ExecutionController } from '../../core/plugins/runner';
import { getToolCategoryTheme, SUGGESTED_NEXT_TOOLS } from '../../core/ilovepdf/categories';
import { getToolIcon, CategoryBadge } from '../common/iconSystem';
import { pluginRegistry } from '../../core/plugins/registry';

interface ILovePdfToolViewProps {
  plugin: ToolPlugin;
  initialFiles?: File[];
  onBack: () => void;
  onNavigateToTool: (toolId: string, preloadedFiles?: File[]) => void;
}

export const ILovePdfToolView: React.FC<ILovePdfToolViewProps> = ({
  plugin,
  initialFiles = [],
  onBack,
  onNavigateToTool,
}) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [options, setOptions] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    for (const opt of plugin.optionsSchema) {
      init[opt.id] = opt.defaultValue;
    }
    return init;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState<ToolOutputItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const activeControllerRef = useRef<ExecutionController | null>(null);

  const theme = getToolCategoryTheme(plugin.id);

  useEffect(() => {
    setFiles(initialFiles);
    setResults(null);
    setError(null);
    checkFileSizeWarnings(initialFiles);
  }, [plugin, initialFiles]);

  const checkFileSizeWarnings = (fileList: File[]) => {
    const large = fileList.find(f => f.size > 100 * 1024 * 1024);
    if (large) {
      setFileSizeWarning(
        `"${large.name}" is over 100MB. OfflineForge processes all files 100% locally on your machine without server limits, but heavy operations may take longer.`
      );
    } else {
      setFileSizeWarning(null);
    }
  };

  const handleFilesAdded = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const added = Array.from(newFiles);
    const updated = [...files, ...added];
    setFiles(updated);
    checkFileSizeWarnings(updated);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    checkFileSizeWarnings(updated);
    if (updated.length === 0) {
      setResults(null);
    }
  };

  const handleMoveFile = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const reordered = [...files];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setFiles(reordered);
  };

  const handleOptionChange = (id: string, value: any) => {
    setOptions(prev => ({ ...prev, [id]: value }));
  };

  const handleRun = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Preparing local execution in Web Worker...');
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
        setError(err.message || 'Operation failed. Please ensure the file is not corrupted or password-protected.');
      }
    } finally {
      setIsProcessing(false);
      activeControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.cancel();
      setStatusMessage('Cancelling operation...');
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

  const handleDownloadAllAsZip = async () => {
    if (!results || results.length === 0) return;
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    for (const res of results) {
      let data: any = res.data;
      if (data instanceof Blob) {
        data = await data.arrayBuffer();
      }
      zip.file(res.downloadName || res.name, data);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plugin.id}-results.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleSendToSuggestedTool = (targetToolId: string) => {
    if (!results || results.length === 0) return;
    const outputFiles = results.map(r => {
      const blob = r.data instanceof Blob ? r.data : new Blob([r.data as any], { type: r.type });
      return new (window as any).File([blob], r.downloadName || r.name, { type: r.type }) as File;
    });
    onNavigateToTool(targetToolId, outputFiles);
  };

  const suggestedToolIds = SUGGESTED_NEXT_TOOLS[plugin.id] || ['pdf-compress', 'pdf-split', 'pdf-protect'];
  const suggestedPlugins = suggestedToolIds
    .map(id => pluginRegistry.get(id))
    .filter((p): p is ToolPlugin => Boolean(p));

  // Drag and drop global handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-[80vh] flex flex-col justify-between"
    >
      {/* Hidden file pickers */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={plugin.id === 'pdf-merge' || plugin.id === 'images-to-pdf'}
        accept={plugin.acceptedExtensions.map(e => `.${e}`).join(',')}
        className="hidden"
        onChange={e => handleFilesAdded(e.target.files)}
      />
      <input
        ref={addMoreInputRef}
        type="file"
        multiple
        accept={plugin.acceptedExtensions.map(e => `.${e}`).join(',')}
        className="hidden"
        onChange={e => handleFilesAdded(e.target.files)}
      />

      {/* Global Drag Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl border-4 border-dashed border-red-500 max-w-md w-full animate-in zoom-in-95 duration-150">
            <Upload className="w-16 h-16 text-red-500 mx-auto animate-bounce mb-4" />
            <h3 className="text-2xl font-black text-slate-900">Drop files to add</h3>
            <p className="text-sm text-slate-500 mt-2">Files are processed 100% locally on your device.</p>
          </div>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All PDF Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs font-semibold text-slate-500">100% Client-Side • Zero Server Upload</span>
        </div>
      </div>

      {/* File Size Warning */}
      {fileSizeWarning && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{fileSizeWarning}</span>
        </div>
      )}

      {/* STATE 1: Initial Empty State – iLovePDF exact layout */}
      {files.length === 0 && (
        <div className="max-w-2xl mx-auto my-auto text-center py-16 sm:py-24">
          {/* Tool icon badge */}
          <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${theme.bgColor}`}>
            <div className="[&_svg]:w-10 [&_svg]:h-10">
              {getToolIcon(plugin.id, plugin.category)}
            </div>
          </div>

          {/* Title & description */}
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] dark:text-white tracking-tight mb-3">
            {plugin.name}
          </h1>
          <p className="text-base text-[#888888] dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-10">
            {plugin.description}
          </p>

          {/* Big action button – iLovePDF style */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`
              inline-flex items-center justify-center gap-3
              px-10 py-4 rounded-2xl
              ${theme.buttonBg} ${theme.buttonHover}
              text-white font-bold text-[15px]
              shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
              transition-all duration-150 cursor-pointer
              min-h-[52px] min-w-[220px]
            `}
          >
            <Upload className="w-5 h-5" />
            Select {plugin.acceptedExtensions.includes('pdf') ? 'PDF files' : 'files'}
          </button>

          <p className="mt-4 text-[13px] text-[#BBBBBB] dark:text-slate-500">
            or <span className="font-semibold">drop files here</span>
          </p>

          {/* Trust badges */}
          <div className="mt-12 flex items-center justify-center gap-6 text-[12px] text-[#AAAAAA] dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Private</span>
            </div>
            <span>·</span>
            <div>No file size limits</div>
            <span>·</span>
            <div>Works Offline</div>
          </div>
        </div>
      )}

      {/* STATE 2: Files Selected - Two Column Layout (Files on Left, Sidebar on Right) */}
      {files.length > 0 && !results && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
          {/* Left Column: File Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-[#33333B] dark:text-white">
                  {plugin.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
                    setFiles(sorted);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Order by name (A-Z)"
                >
                  <span>Sort A-Z</span>
                </button>

                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E5322D] hover:bg-[#D42B26] text-white text-xs font-black shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add files</span>
                </button>
              </div>
            </div>

            {/* Grid of File Cards with Drag-to-Reorder & Page Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="group relative bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[#E5322D] rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[220px] select-none"
                >
                  {/* Card Header: Order Badge + Delete Button */}
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>

                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 dark:bg-slate-700 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Document Sheet Illustration */}
                  <div className="my-2 flex flex-col items-center text-center">
                    <div className="relative w-20 h-26 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex flex-col justify-between p-2 group-hover:scale-103 transition-transform">
                      {/* Top Red PDF Ribbon */}
                      <div className="flex items-center justify-between">
                        <span className="px-1 py-0.2 rounded text-[8px] font-black tracking-wider bg-[#E5322D] text-white shadow-2xs">
                          PDF
                        </span>
                        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      </div>
                      {/* Document lines simulation */}
                      <div className="space-y-1.5 px-0.5">
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="w-4/5 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="w-3/5 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      </div>
                      <div className="w-full h-1 bg-[#E5322D]/30 rounded-full" />
                    </div>

                    <div className="font-extrabold text-xs text-[#33333B] dark:text-white mt-2.5 line-clamp-1 max-w-[170px]" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>

                  {/* Card Bottom: Move Left, Page, Move Right */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveFile(idx, idx - 1)}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#E5322D] hover:bg-red-50 disabled:opacity-20 cursor-pointer transition-colors"
                      title="Move left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400">Position {idx + 1}</span>
                    <button
                      disabled={idx === files.length - 1}
                      onClick={() => handleMoveFile(idx, idx + 1)}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#E5322D] hover:bg-red-50 disabled:opacity-20 cursor-pointer transition-colors"
                      title="Move right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add more files card */}
              <div
                onClick={() => addMoreInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#E5322D] bg-slate-50/50 hover:bg-red-50/20 dark:bg-slate-800/50 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[#E5322D] shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-white">Add another file</div>
                <div className="text-[10px] text-slate-400 mt-0.5">or drop files here</div>
              </div>
            </div>
          </div>

          {/* Right Column: iLovePDF Sidebar with Big Red Action Button (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xl space-y-6 sticky top-24">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E5322D]" />
                <h3 className="text-xl font-black text-[#33333B] dark:text-white">{plugin.name}</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plugin.description}</p>
            </div>

            {/* Special Compress Options (Low / Recommended / Extreme) */}
            {plugin.id === 'pdf-compress' && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Compression Level
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'high', title: 'Extreme Compression', desc: 'Less quality, high compression' },
                    { id: 'medium', title: 'Recommended Compression', desc: 'Good quality, good compression' },
                    { id: 'low', title: 'Less Compression', desc: 'High quality, less compression' },
                  ].map(lvl => (
                    <label
                      key={lvl.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        options.quality === lvl.id
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="compression-level"
                        checked={options.quality === lvl.id}
                        onChange={() => handleOptionChange('quality', lvl.id)}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{lvl.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Generic Plugin Options Form */}
            {plugin.id !== 'pdf-compress' && plugin.optionsSchema.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Options</span>
                </div>
                {plugin.optionsSchema.map(opt => (
                  <div key={opt.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">{opt.label}</label>
                    {opt.type === 'select' && (
                      <select
                        value={options[opt.id]}
                        onChange={e => handleOptionChange(opt.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      >
                        {opt.options?.map(o => (
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
                        onChange={e => handleOptionChange(opt.id, e.target.value)}
                        placeholder={opt.description}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    )}
                    {opt.type === 'boolean' && (
                      <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer pt-1 font-medium">
                        <input
                          type="checkbox"
                          checked={Boolean(options[opt.id])}
                          onChange={e => handleOptionChange(opt.id, e.target.checked)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span>{opt.description || opt.label}</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs text-slate-600 font-semibold">
                  <span>{statusMessage}</span>
                  <span className="font-mono font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${theme.buttonBg}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleRun}
                disabled={isProcessing}
                className={`w-full min-h-[52px] px-6 py-3.5 rounded-2xl ${theme.buttonBg} ${theme.buttonHover} disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{plugin.name}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {isProcessing && (
                <button
                  onClick={handleCancel}
                  className="w-full py-2 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                  Cancel operation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: Success Result Screen */}
      {results && (
        <div className="max-w-2xl mx-auto my-auto text-center py-12 sm:py-16 space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Your file is ready!
            </h2>
            <p className="text-sm text-slate-500">
              Processed 100% locally on your device in airplane mode.
            </p>
          </div>

          {/* Compressed stats reduction badge */}
          {results[0]?.metadata?.reductionPercent !== undefined && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>
                PDF is {results[0].metadata.reductionPercent}% smaller! (
                {(results[0].metadata.originalSize / (1024 * 1024)).toFixed(2)} MB ➔{' '}
                {(results[0].metadata.newSize / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          )}

          {/* Big Download Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {results.length === 1 ? (
              <button
                onClick={() => handleDownload(results[0])}
                className="w-full sm:w-auto min-h-[56px] px-10 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg shadow-xl shadow-red-500/25 hover:scale-102 active:scale-98 transition-all inline-flex items-center justify-center gap-3 cursor-pointer"
              >
                <Download className="w-6 h-6" />
                <span>Download {results[0].downloadName || 'PDF'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleDownloadAllAsZip}
                  className="w-full sm:w-auto min-h-[56px] px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-xl shadow-red-500/25 hover:scale-102 active:scale-98 transition-all inline-flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Archive className="w-5 h-5" />
                  <span>Download all as ZIP</span>
                </button>
                <button
                  onClick={() => handleDownload(results[0])}
                  className="w-full sm:w-auto min-h-[56px] px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download file 1</span>
                </button>
              </>
            )}
          </div>

          <div>
            <button
              onClick={() => {
                setResults(null);
                setFiles([]);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              Start over with another file
            </button>
          </div>

          {/* Suggested Next Tools */}
          {suggestedPlugins.length > 0 && (
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Continue with your new PDF:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {suggestedPlugins.map(target => (
                  <button
                    key={target.id}
                    onClick={() => handleSendToSuggestedTool(target.id)}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-red-50/50 border border-slate-200 hover:border-red-200 text-left transition-all group shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        {getToolIcon(target.id, target.category)}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <div className="font-bold text-xs text-slate-800 group-hover:text-red-600 transition-colors">
                      {target.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
