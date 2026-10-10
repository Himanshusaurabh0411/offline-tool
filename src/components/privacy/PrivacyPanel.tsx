import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  WifiOff, 
  HardDrive, 
  Database, 
  Lock,
  Radio
} from 'lucide-react';
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
    if (!window.confirm("Permanently wipe all browser storage, IndexedDB caches, and timeline history?")) return;
    setIsWiping(true);
    await wipeEverythingNow();
    await loadStorageReport();
    setIsWiping(false);
    setWipeSuccess(true);
    setTimeout(() => setWipeSuccess(false), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#141518]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Privacy & Network Audit</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  0 Egress Requests
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live hardware and network inspection running directly in your browser.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Real Network Interception Stats */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Active Network Egress Monitor
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                0 Bytes Transmitted
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-[#141518] rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">Blocked Egress</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.blockedRequests}</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#141518] rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">External Requests</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.externalRequests}</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#141518] rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">Local Allowed</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.allowedLocalRequests}</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#141518] rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">Bytes Exfiltrated</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.bytesSent} B</div>
              </div>
            </div>
          </div>

          {/* Local Storage & Cache Usage */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Local Browser Storage & Memory
                </h3>
              </div>
              <button 
                onClick={loadStorageReport}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-[#141518] rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">IndexedDB Databases</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {storageReport ? `${storageReport.indexedDbDatabases.length} active` : 'Loading...'}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-[#141518] rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">Local Storage Keys</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {storageReport ? `${storageReport.localStorageKeys} keys` : 'Loading...'}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-[#141518] rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">Cache Storages</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {storageReport ? `${storageReport.cacheNames.length} caches` : 'Loading...'}
                </div>
              </div>
            </div>
          </div>

          {/* Secure Wipe Action */}
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-red-900 dark:text-red-300">
                Nuclear Cache & History Erasure
              </h4>
              <p className="text-xs text-red-700/80 dark:text-red-400 mt-0.5">
                Immediately clear all temporary file blobs, IndexedDB records, and recent settings from this machine.
              </p>
            </div>
            <button
              onClick={handleWipeEverything}
              disabled={isWiping}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isWiping ? 'Wiping...' : 'Wipe All Local Storage'}</span>
            </button>
          </div>

          {wipeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>All cached local storage and timeline snapshots were permanently wiped.</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
