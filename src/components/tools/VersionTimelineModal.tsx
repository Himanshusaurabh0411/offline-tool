import React, { useState, useEffect } from 'react';
import { History, X, Download, RotateCcw, Clock, Trash2, FileCheck } from 'lucide-react';
import { VersionTimeline, FileVersion } from '../../core/storage/timeline';
import { useI18n } from '../../i18n';

interface VersionTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  onRestoreVersion: (file: File) => void;
}

export const VersionTimelineModal: React.FC<VersionTimelineModalProps> = ({
  isOpen,
  onClose,
  fileName,
  onRestoreVersion,
}) => {
  const { t } = useI18n();
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, fileName]);

  const loadVersions = async () => {
    setIsLoading(true);
    if (fileName) {
      const history = await VersionTimeline.getHistory(fileName);
      setVersions(history);
    } else {
      const all = await VersionTimeline.getAllVersions();
      setVersions(all);
    }
    setIsLoading(false);
  };

  const handleDownload = (v: FileVersion) => {
    const url = URL.createObjectURL(v.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${v.stepName.toLowerCase().replace(/\s+/g, '-')}-${v.originalFileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleRestore = (v: FileVersion) => {
    const file = new File([v.blob], v.originalFileName, { type: v.blob.type });
    onRestoreVersion(file);
    onClose();
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all version timeline snapshots?')) return;
    await VersionTimeline.clearHistory();
    setVersions([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">
              {t('tool.history_versions')} {fileName && `for ${fileName}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-2.5">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500 text-xs">Loading history...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs leading-relaxed">
              No previous version snapshots found. Every action you run creates an instant rollback snapshot here!
            </div>
          ) : (
            versions.map((v, idx) => (
              <div
                key={v.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold font-mono shadow-2xs">
                    #{versions.length - idx}
                  </div>
                  <div>
                    <div className="font-medium text-xs text-slate-900 flex items-center gap-2">
                      <span>{v.stepName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                        {(v.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(v.timestamp).toLocaleTimeString()} • {new Date(v.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownload(v)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
                    title="Download this version"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRestore(v)}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs flex items-center gap-1 transition-colors"
                    title="Rollback/Restore"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" /> Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {versions.length > 0 && (
          <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">{versions.length} snapshots stored locally</span>
            <button
              onClick={handleClear}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
