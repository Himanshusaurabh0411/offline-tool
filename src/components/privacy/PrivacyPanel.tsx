import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, RefreshCw, Trash2, AlertTriangle, CheckCircle, WifiOff, HardDrive, Database, Lock } from 'lucide-react';
import { useI18n } from '../../i18n';
import { networkMonitor, NetworkStats } from '../../core/privacy/networkMonitor';
import { inspectStorage, wipeEverythingNow, MemoryStorageReport } from '../../core/privacy/storageWiper';

interface PrivacyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPanel: React.FC<PrivacyPanelProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [stats, setStats] = useState<NetworkStats>(networkMonitor.getStats());
  const [storageReport, setStorageReport] = useState<MemoryStorageReport | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  useEffect(() => {
    const unsub = networkMonitor.subscribe(setStats);
    if (isOpen) {
      loadStorageReport();
    }
    return () => unsub();
  }, [isOpen]);

  const loadStorageReport = async () => {
    const rep = await inspectStorage();
    setStorageReport(rep);
  };

  const handleWipeEverything = async () => {
    if (!window.confirm(t('privacy.wipe_confirm'))) return;
    setIsWiping(true);
    await wipeEverythingNow();
    await loadStorageReport();
    setIsWiping(false);
    setWipeSuccess(true);
    setTimeout(() => setWipeSuccess(false), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {t('privacy.proof_title')}
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  0 Egress Active
                </span>
              </h2>
              <p className="text-xs text-slate-500">{t('privacy.egress_desc')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Live Network Metrics Cards */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              {t('privacy.network_monitor')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-emerald-200 relative overflow-hidden">
                <div className="text-2xl font-mono font-bold text-emerald-700">{stats.bytesSent} B</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">{t('privacy.bytes_sent')}</div>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-2xl font-mono font-bold text-slate-900">{stats.blockedRequests}</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">Blocked Egress Calls</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-2xl font-mono font-bold text-blue-700">{stats.allowedLocalRequests}</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">Local Browser Worker Calls</div>
              </div>
            </div>
          </div>

          {/* Airplane Mode Test Card */}
          <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950">
            <div className="flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-xs text-blue-900">{t('privacy.airplane_title')}</h4>
                <p className="text-blue-800">{t('privacy.airplane_step1')}</p>
                <p className="text-blue-800">{t('privacy.airplane_step2')}</p>
                <p className="text-blue-800">{t('privacy.airplane_step3')}</p>
              </div>
            </div>
          </div>

          {/* Memory & Storage Inspection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                {t('privacy.memory_title')}
              </h3>
              <button
                onClick={loadStorageReport}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {storageReport && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-md bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">IndexedDB Stores</span>
                    <span className="font-mono font-semibold text-slate-900 text-sm">
                      {storageReport.indexedDbDatabases.length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Cache Storage</span>
                    <span className="font-mono font-semibold text-slate-900 text-sm">
                      {storageReport.cacheNames.length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">OPFS Streaming</span>
                    <span className="font-mono font-semibold text-emerald-700 text-sm">
                      {storageReport.opfsSupported ? 'Available' : 'Emulated'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Storage Used</span>
                    <span className="font-mono font-semibold text-slate-900 text-sm">
                      {(storageReport.estimatedQuotaUsedBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wipe Everything Danger Zone */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Wipe Local Cache & Memory
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Instantly purges all IndexedDB files, temporary timeline undo caches, and local session data.
              </p>
            </div>
            <button
              onClick={handleWipeEverything}
              disabled={isWiping}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isWiping ? 'Wiping...' : t('privacy.wipe_button')}
            </button>
          </div>

          {wipeSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {t('privacy.wipe_success')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
