import React, { useState } from 'react';
import { Download, Play, XCircle, RotateCcw, Archive, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import JSZip from 'jszip';
import { ToolPlugin, BatchItem, ToolOutputItem } from '../../core/plugins/types';
import { executeTool, ExecutionController } from '../../core/plugins/runner';
import { useI18n } from '../../i18n';

interface BatchQueueProps {
  files: File[];
  plugin: ToolPlugin;
  options: Record<string, any>;
  onClear: () => void;
  onSendToTool?: (outputFiles: File[]) => void;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  files,
  plugin,
  options,
  onClear,
  onSendToTool,
}) => {
  const { t } = useI18n();
  const [items, setItems] = useState<BatchItem[]>(() =>
    files.map((f, i) => ({
      id: `${i}-${f.name}`,
      file: f,
      status: 'queued',
      progress: 0,
    }))
  );
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [activeControllers, setActiveControllers] = useState<Map<string, ExecutionController>>(new Map());

  // Run single item
  const processItem = async (item: BatchItem) => {
    const controller = new ExecutionController();
    setActiveControllers(prev => new Map(prev).set(item.id, controller));

    setItems(prev =>
      prev.map(i =>
        i.id === item.id ? { ...i, status: 'processing', progress: 5, error: undefined } : i
      )
    );

    const startTime = performance.now();
    try {
      const output = await executeTool(
        plugin,
        [item.file],
        options,
        (progress, msg) => {
          setItems(prev =>
            prev.map(i =>
              i.id === item.id ? { ...i, progress, statusMessage: msg } : i
            )
          );
        },
        controller
      );

      const durationMs = performance.now() - startTime;
      setItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, status: 'completed', progress: 100, output, durationMs }
            : i
        )
      );
    } catch (err: any) {
      if (controller.isCancelled()) {
        setItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, status: 'cancelled' } : i))
        );
      } else {
        setItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, status: 'error', error: err.message || 'Operation failed' }
              : i
          )
        );
      }
    } finally {
      setActiveControllers(prev => {
        const next = new Map(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  // Run all sequentially / concurrently
  const handleProcessAll = async () => {
    setIsProcessingAll(true);
    for (const item of items) {
      if (item.status === 'queued' || item.status === 'error') {
        await processItem(item);
      }
    }
    setIsProcessingAll(false);
  };

  const handleCancelItem = (id: string) => {
    const controller = activeControllers.get(id);
    if (controller) {
      controller.cancel();
    }
  };

  const handleDownloadItem = (output: ToolOutputItem) => {
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

  // 1-Click "Download all as ZIP"
  const handleDownloadAllZip = async () => {
    const zip = new JSZip();
    let hasOutputs = false;

    for (const item of items) {
      if (item.output) {
        for (const out of item.output) {
          hasOutputs = true;
          let fileData: Uint8Array | Blob | string = out.data;
          zip.file(out.downloadName || out.name, fileData);
        }
      }
    }

    if (!hasOutputs) return;

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

  const completedCount = items.filter(i => i.status === 'completed').length;

  return (
    <div className="space-y-3.5">
      {/* Batch Header & Global Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
            <span>{t('tool.batch_queue')}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {completedCount} / {items.length} Completed
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Process multiple files concurrently directly in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <button
              onClick={handleDownloadAllZip}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Archive className="w-3.5 h-3.5" />
              {t('tool.download_all_zip')}
            </button>
          )}

          <button
            onClick={handleProcessAll}
            disabled={isProcessingAll || items.every(i => i.status === 'completed')}
            className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {isProcessingAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Process All
              </>
            )}
          </button>

          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Queue items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col gap-2 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {item.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                {item.status === 'processing' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
                {item.status === 'queued' && <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                {item.status === 'cancelled' && <XCircle className="w-4 h-4 text-amber-600 shrink-0" />}

                <div className="truncate">
                  <div className="font-medium text-xs text-slate-900 truncate">{item.file.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                    {item.durationMs && ` • ${(item.durationMs / 1000).toFixed(2)}s`}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {item.status === 'processing' && (
                  <button
                    onClick={() => handleCancelItem(item.id)}
                    className="px-2 py-0.5 rounded text-red-700 hover:bg-red-50 border border-red-200 text-xs font-medium flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" /> Cancel
                  </button>
                )}

                {item.status === 'error' && (
                  <button
                    onClick={() => processItem(item)}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                    title="Retry"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {item.status === 'completed' && item.output && (
                  <div className="flex items-center gap-1.5">
                    {item.output.map((out, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDownloadItem(out)}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {item.status === 'processing' && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-150"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}

            {item.error && (
              <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
                {item.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
