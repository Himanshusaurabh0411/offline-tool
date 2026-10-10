import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  Sparkles,
  Camera,
  Layers,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PrivacyPanel } from './components/privacy/PrivacyPanel';
import { CommandPalette } from './components/layout/CommandPalette';
import { ILovePdfToolView } from './components/ilovepdf/ILovePdfToolView';
import { WorkflowBuilder } from './components/workflows/WorkflowBuilder';
import { OfflineShareModal } from './components/p2p/OfflineShareModal';
import { pluginRegistry } from './core/plugins/registry';
import { ToolPlugin } from './core/plugins/types';
import {
  ILovePdfCategoryId,
  TOOL_CATEGORY_MAP,
  getToolRoute,
  getToolIdFromRoute,
} from './core/ilovepdf/categories';
import { ILovePdfToolIcon } from './components/common/ILovePdfIcons';

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ILovePdfCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ToolPlugin | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOfflineShareOpen, setIsOfflineShareOpen] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('offlineforge_favs') || '[]'); } catch { return []; }
  });
  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('offlineforge_recent') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\/+/, '');
      if (path === 'workflow') { setActiveTool(null); }
      else if (path) {
        const toolId = getToolIdFromRoute(path);
        const tool = pluginRegistry.get(toolId);
        setActiveTool(tool || null);
      } else { setActiveTool(null); }
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setIsCommandPaletteOpen(p => !p);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false); setIsPrivacyOpen(false); setIsOfflineShareOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const toggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId) : [...favorites, toolId];
    setFavorites(next);
    localStorage.setItem('offlineforge_favs', JSON.stringify(next));
  };

  const openTool = (tool: ToolPlugin, files: File[] = []) => {
    setActiveTool(tool); setStagedFiles(files);
    window.history.pushState({ toolId: tool.id }, '', `/${getToolRoute(tool.id)}`);
    const updated = [tool.id, ...recentToolIds.filter(id => id !== tool.id)].slice(0, 8);
    setRecentToolIds(updated);
    localStorage.setItem('offlineforge_recent', JSON.stringify(updated));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openToolById = (toolId: string, files: File[] = []) => {
    const tool = pluginRegistry.get(toolId);
    if (tool) openTool(tool, files);
  };

  const backToHome = () => {
    setActiveTool(null); setStagedFiles([]);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // High-value tools ordered logically for real human workflow
  const TOOL_ORDER = [
    'passport-photo-maker',
    'custom-size-reducer',
    'pdf-merge',
    'pdf-split',
    'pdf-compress',
    'image-resize',
    'image-compress',
    'pdf-to-word',
    'word-to-pdf',
    'images-to-pdf',
    'pdf-to-images',
    'excel-to-pdf',
    'pdf-to-excel',
    'pdf-edit',
    'pdf-sign',
    'pdf-watermark',
    'pdf-rotate',
    'pdf-protect',
    'pdf-unlock',
    'pdf-organize',
    'pdf-page-numbers',
    'pdf-ocr',
    'pdf-repair',
    'pdf-true-redaction',
    'pdf-visual-diff',
  ];

  const allTools = pluginRegistry.getAll();
  const filteredTools = allTools
    .filter(tool => {
      const matchesSearch = !searchQuery ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedCategory === 'all') return true;
      return TOOL_CATEGORY_MAP[tool.id] === selectedCategory;
    })
    .sort((a, b) => {
      const idxA = TOOL_ORDER.indexOf(a.id);
      const idxB = TOOL_ORDER.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

  // Natural humanized categories
  const categoryTabs: { id: ILovePdfCategoryId; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'photos', label: 'Passport & Photos' },
    { id: 'organize', label: 'Organize PDF' },
    { id: 'optimize', label: 'Compress & Optimize' },
    { id: 'to-pdf', label: 'Convert to PDF' },
    { id: 'from-pdf', label: 'Convert from PDF' },
    { id: 'edit', label: 'Edit & Watermark' },
    { id: 'security', label: 'Security & Sign' },
    { id: 'dev', label: 'Dev Utilities' },
    { id: 'docs', label: 'Office Docs' },
    { id: 'archives', label: 'ZIP & Files' },
  ];

  const isWorkflow = window.location.pathname.includes('/workflow');

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#0B0C0E] text-[#111827] dark:text-[#F3F4F6] selection:bg-red-500 selection:text-white transition-colors">
      <Header
        onOpenPrivacyPanel={() => setIsPrivacyOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenOfflineShare={() => setIsOfflineShareOpen(true)}
        onSelectCategory={(cat) => { setSelectedCategory(cat as ILovePdfCategoryId); backToHome(); }}
        currentCategory={selectedCategory}
        onSelectWorkflowBuilder={() => { setActiveTool(null); window.history.pushState({}, '', '/workflow'); }}
        onOpenTool={openToolById}
      />

      <main className="flex-1">
        {isWorkflow ? (
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-10">
            <WorkflowBuilder onBack={backToHome} />
          </div>
        ) : activeTool ? (
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-10">
            <ILovePdfToolView
              plugin={activeTool}
              initialFiles={stagedFiles}
              onBack={backToHome}
              onNavigateToTool={(id, files) => openToolById(id, files)}
            />
          </div>
        ) : (
          <>
            {/* ── Hero Section: Professional, Clean, Purpose-Driven ─── */}
            <section className="bg-white dark:bg-[#111215] border-b border-[#E5E7EB] dark:border-slate-800 pt-16 pb-14">
              <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6">
                
                {/* Genuine architecture trust indicator */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[12px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Runs 100% locally on your device via WebAssembly</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-400">Zero file uploads</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-[1.15]">
                  Every tool you need to work with files,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                    privately in your browser.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-[#4B5563] dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
                  Convert PDFs, generate official passport photos, compress to custom government file size limits, and edit documents without exposing personal data to any server.
                </p>

                {/* Practical Search & Quick Filters Container */}
                <div className="pt-2 max-w-xl mx-auto">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search any tool (e.g., passport photo, merge pdf, reduce kb, sign)..."
                      className="w-full h-12 bg-[#F9FAFB] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-24 text-[14px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all shadow-xs"
                    />
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 text-xs font-semibold px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                      >
                        Clear
                      </button>
                    ) : (
                      <div className="absolute right-3 hidden sm:flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">⌘K</kbd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Humanized Category Tabs */}
                <div className="pt-4 flex items-center justify-center flex-wrap gap-1.5">
                  {categoryTabs.map((tab) => {
                    const isActive = selectedCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`
                          px-3.5 py-1.5 rounded-lg text-[13px] font-semibold
                          transition-all duration-150 cursor-pointer whitespace-nowrap
                          ${isActive
                            ? 'bg-[#111827] dark:bg-white text-white dark:text-[#111827] shadow-xs'
                            : 'bg-white dark:bg-slate-900/60 text-[#4B5563] dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

              </div>
            </section>

            {/* ── Main Workspace Body ──────────────────────────────────── */}
            <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-10">

              {/* Dynamic Recently Used Tools Bar */}
              {recentToolIds.length > 0 && searchQuery === '' && selectedCategory === 'all' && (
                <div className="mb-8 p-3.5 rounded-xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Recent Tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {recentToolIds.slice(0, 5).map(id => {
                      const tool = pluginRegistry.get(id);
                      if (!tool) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => openTool(tool)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-[12px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <ILovePdfToolIcon toolId={tool.id} size={16} />
                          <span>{tool.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tools Counter & Active Filter Status */}
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}</span>
                  {selectedCategory !== 'all' && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Filtered by: {categoryTabs.find(c => c.id === selectedCategory)?.label}
                    </span>
                  )}
                </div>
                {selectedCategory !== 'all' && (
                  <button 
                    onClick={() => setSelectedCategory('all')} 
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {filteredTools.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-[#141518] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No tools found</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    No tool matched "{searchQuery.trim()}". Try searching for "passport", "compress", or "merge".
                  </p>
                  <button onClick={() => setSearchQuery('')} className="mt-4 px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer">
                    Clear Search Query
                  </button>
                </div>
              ) : (
                /* High-Quality Commercial Card Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                  {filteredTools.map((tool) => {
                    const isFav = favorites.includes(tool.id);
                    return (
                      <div
                        key={tool.id}
                        onClick={() => openTool(tool)}
                        className="
                          group relative bg-white dark:bg-[#141518]
                          border border-slate-200 dark:border-slate-800
                          hover:border-slate-400 dark:hover:border-slate-600
                          rounded-xl p-5
                          cursor-pointer
                          transition-all duration-150
                          hover:shadow-md hover:-translate-y-0.5
                          flex flex-col justify-between
                          min-h-[160px] select-none
                        "
                      >
                        <div>
                          {/* Top row: Icon + Favorite toggle */}
                          <div className="flex items-start justify-between mb-3.5">
                            <div className="transition-transform group-hover:scale-105">
                              <ILovePdfToolIcon toolId={tool.id} size={42} />
                            </div>
                            <button
                              onClick={(e) => toggleFavorite(tool.id, e)}
                              className={`p-1 rounded-md text-slate-300 hover:text-amber-400 transition-colors ${
                                isFav ? '!text-amber-400' : 'opacity-0 group-hover:opacity-100'
                              }`}
                              title="Star favorite tool"
                            >
                              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>
                          </div>

                          {/* Tool Name */}
                          <h3 className="font-bold text-[14.5px] text-slate-900 dark:text-white leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {tool.name}
                          </h3>

                          {/* Tool Description */}
                          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                            {tool.description}
                          </p>
                        </div>

                        {/* Hover hint */}
                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                          <span className="truncate max-w-[120px] font-mono text-[10px]">
                            {tool.acceptedExtensions.slice(0, 3).map(e => `.${e}`).join(' ')}
                          </span>
                          <span className="flex items-center gap-1 text-slate-900 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                            Open <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Practical Hardware & Privacy Facts Strip ─────────── */}
              <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Engineered for high security and offline privacy
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Unlike ordinary cloud tools, Offline Toolkit performs heavy operations natively in your browser thread.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">True Zero-Telemetry</h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Your identity cards, bank statements, and biometric photos remain solely in your device memory. Disconnect your Wi-Fi and every tool continues running flawlessly.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">WebAssembly Powered</h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Using compiled WebAssembly engines (`pdf-lib`, `pdf.js`, canvas quantization, and Web Workers), file parsing executes at near-native C/C++ computational speeds.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">No File Size Restrictions</h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Process 100MB+ architectural drawings and 500-page scanned documents without encountering upload throttles or paywall blockers.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </main>

      <Footer
        onOpenPrivacyPanel={() => setIsPrivacyOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTool={openToolById}
      />

      <PrivacyPanel isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={(tool) => openTool(tool)}
      />
      <OfflineShareModal isOpen={isOfflineShareOpen} onClose={() => setIsOfflineShareOpen(false)} />
    </div>
  );
};
