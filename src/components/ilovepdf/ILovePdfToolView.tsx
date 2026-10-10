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
  Sliders,
  Archive,
  Layers,
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { ToolPlugin, ToolOutputItem } from '../../core/plugins/types';
import { executeTool, ExecutionController } from '../../core/plugins/runner';
import { getToolCategoryTheme, SUGGESTED_NEXT_TOOLS } from '../../core/ilovepdf/categories';
import { ILovePdfToolIcon } from '../common/ILovePdfIcons';
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
        `"${large.name}" is over 100MB. Processing runs purely in your local RAM without server upload limits, but large tasks may take a few moments.`
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
    setStatusMessage('Preparing local execution in browser memory...');
    setError(null);
    setResults(null);

    const controller = new ExecutionController();
    activeControllerRef.current = controller;

    try {
      const output = await executeTool(
        plugin,
        files,
        options,
        (percent, msg) => {
          setProgress(percent);
          if (msg) setStatusMessage(msg);
        },
        controller
      );
      setResults(output);
      setProgress(100);
      setStatusMessage('Complete');
    } catch (err: any) {
      if (err.message !== 'Operation cancelled by user.') {
        setError(err.message || 'Operation failed during execution.');
      }
    } finally {
      setIsProcessing(false);
      activeControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.cancel();
      setIsProcessing(false);
      setStatusMessage('Cancelled');
    }
  };

  const handleDownload = (item: ToolOutputItem) => {
    let url: string;
    if (item.data instanceof Blob) {
      url = URL.createObjectURL(item.data);
    } else if (item.data instanceof Uint8Array) {
      const blob = new Blob([item.data as any], { type: item.type });
      url = URL.createObjectURL(blob);
    } else {
      const blob = new Blob([String(item.data)], { type: item.type });
      url = URL.createObjectURL(blob);
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = item.downloadName || item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadAll = () => {
    if (!results) return;
    results.forEach(r => handleDownload(r));
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const suggestedTools = (SUGGESTED_NEXT_TOOLS[plugin.id] || [])
    .map(id => pluginRegistry.get(id))
    .filter(Boolean) as ToolPlugin[];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-[75vh] flex flex-col transition-colors ${
        isDragOver ? 'ring-2 ring-indigo-500 rounded-3xl bg-indigo-50/20 dark:bg-indigo-950/20' : ''
      }`}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
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

      {/* Navigation Breadcrumb Bar */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Local Execution Active
          </span>
        </div>
      </div>

      {/* Large File Warning */}
      {fileSizeWarning && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{fileSizeWarning}</span>
        </div>
      )}

      {/* STATE 1: Empty Selection - Clear Human Hero */}
      {files.length === 0 && (
        <div className="max-w-2xl mx-auto my-auto text-center py-16 sm:py-24 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto shadow-sm">
            <ILovePdfToolIcon toolId={plugin.id} size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {plugin.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              {plugin.description}
            </p>
          </div>

          <div className="pt-4 max-w-md mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4.5 sm:py-5 rounded-2xl bg-[#E5322D] hover:bg-[#c92520] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-red-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Select {plugin.acceptedExtensions.includes('pdf') ? 'PDF files' : 'files'}</span>
            </button>
            <p className="mt-3 text-xs sm:text-sm text-slate-400 font-medium">
              or drop {plugin.acceptedExtensions.includes('pdf') ? 'PDFs' : 'files'} here
            </p>
          </div>
        </div>
      )}

      {/* STATE 2: Files Staged - Workspace Columns */}
      {files.length > 0 && !results && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
          
          {/* Left Column: File Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Files Selected
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
                    setFiles(sorted);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sort A-Z
                </button>

                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add File</span>
                </button>
              </div>
            </div>

            {/* Grid of File Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between min-h-[170px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="my-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveFile(idx, idx - 1)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span>Order {idx + 1}</span>
                    <button
                      disabled={idx === files.length - 1}
                      onClick={() => handleMoveFile(idx, idx + 1)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Settings & Execution */}
          <div className="lg:col-span-4 bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5 sticky top-24">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{plugin.name} Options</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure processing settings</p>
            </div>

            {/* Dynamic Schema Options */}
            {plugin.optionsSchema.length > 0 && (
              <div className="space-y-4 pt-1">
                {plugin.optionsSchema.map(opt => (
                  <div key={opt.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {opt.label}
                    </label>

                    {opt.type === 'select' && (
                      <select
                        value={options[opt.id] ?? opt.defaultValue}
                        onChange={e => handleOptionChange(opt.id, e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        {opt.options?.map(o => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {opt.type === 'range' && (
                      <div className="space-y-1">
                        <input
                          type="range"
                          min={opt.min ?? 0}
                          max={opt.max ?? 100}
                          value={options[opt.id] ?? opt.defaultValue}
                          onChange={e => handleOptionChange(opt.id, Number(e.target.value))}
                          className="w-full accent-slate-900 dark:accent-white"
                        />
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>{opt.min ?? 0}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{options[opt.id]}</span>
                          <span>{opt.max ?? 100}</span>
                        </div>
                      </div>
                    )}

                    {opt.type === 'boolean' && (
                      <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={Boolean(options[opt.id])}
                          onChange={e => handleOptionChange(opt.id, e.target.checked)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
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
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <span>{statusMessage}</span>
                  <span className="font-mono font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleRun}
                disabled={isProcessing}
                className="w-full h-13 px-6 rounded-xl bg-[#E5322D] hover:bg-[#c92520] disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing in browser...</span>
                  </>
                ) : (
                  <>
                    <span>Execute {plugin.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {isProcessing && (
                <button
                  onClick={handleCancel}
                  className="w-full py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* STATE 3: Success Screen */}
      {results && (
        <div className="max-w-2xl mx-auto my-auto text-center py-12 space-y-8 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Task Completed Successfully
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated locally on your device without transmitting data over the internet.
            </p>
          </div>

          {/* Results List */}
          <div className="space-y-2.5 max-w-lg mx-auto">
            {results.map((res, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {res.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {res.data instanceof Blob ? `${(res.data.size / 1024).toFixed(1)} KB` : res.type}
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(res)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E5322D] hover:bg-[#c92520] text-white text-xs font-bold transition-all shadow-sm shadow-red-500/20 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>

          {/* Recovery Actions */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setResults(null);
                setFiles([]);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Start Another Task
            </button>

            {results.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Download All ({results.length})
              </button>
            )}
          </div>

          {/* Suggested Next Tools */}
          {suggestedTools.length > 0 && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Suggested Next Step
              </div>
              <div className="flex items-center justify-center flex-wrap gap-2">
                {suggestedTools.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      const downloadedFiles: File[] = results.map(
                        r => new File([r.data as any], r.name, { type: r.type })
                      );
                      onNavigateToTool(st.id, downloadedFiles);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ILovePdfToolIcon toolId={st.id} size={14} />
                    <span>{st.name}</span>
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
