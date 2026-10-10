import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Camera,
  CheckCircle2,
  Lock,
  Layers,
  FileType,
  Scissors
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

  // Natural humanized categories with readable font sizing
  const categoryTabs: { id: ILovePdfCategoryId; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'photos', label: 'Passport & Photos' },
    { id: 'organize', label: 'Organize PDF' },
    { id: 'optimize', label: 'Compress PDF' },
    { id: 'to-pdf', label: 'Convert to PDF' },
    { id: 'from-pdf', label: 'Convert from PDF' },
    { id: 'edit', label: 'Edit PDF' },
    { id: 'security', label: 'PDF Security' },
    { id: 'dev', label: 'Dev Utilities' },
    { id: 'docs', label: 'Office Docs' },
    { id: 'archives', label: 'ZIP Archives' },
  ];

  const isWorkflow = window.location.pathname.includes('/workflow');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0E1013] text-[#1A1A1A] dark:text-[#F3F4F6] selection:bg-red-500 selection:text-white transition-colors">
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
            {/* ── Hero Section: Friendly, High-Clarity Header ────────── */}
            <section className="bg-white dark:bg-[#111317] border-b border-[#E5E7EB] dark:border-slate-800 pt-16 pb-14">
              <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6">
                
                {/* Genuine architecture trust indicator */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-[13.5px] font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% In-Browser & Private</span>
                  <span className="text-emerald-300 dark:text-emerald-700">•</span>
                  <span>Files never leave your computer</span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-5xl font-black text-[#111827] dark:text-white tracking-tight leading-[1.2]">
                  Every tool you need to work with PDFs & Photos,{' '}
                  <span className="text-[#E5322D]">
                    in one place.
                  </span>
                </h1>

                <p className="text-[17px] sm:text-[19px] text-[#4B5563] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                  Free, fast, and completely private. Merge, split, compress PDFs, or create instant passport photos for government job forms right in your browser.
                </p>

                {/* Practical Search Box with Large Clear Input */}
                <div className="pt-2 max-w-xl mx-auto">
                  <div className="relative flex items-center">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tools (e.g., merge pdf, passport photo, compress to 50kb)..."
                      className="w-full h-14 bg-[#F8F9FA] dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-24 text-[16px] font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#E5322D] dark:focus:border-[#E5322D] transition-all shadow-xs"
                    />
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 text-xs font-bold px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                      >
                        Clear
                      </button>
                    ) : (
                      <div className="absolute right-3.5 hidden sm:flex items-center gap-1">
                        <kbd className="px-2 py-1 text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">⌘K</kbd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clean, Readable Category Pills */}
                <div className="pt-4 flex items-center justify-center flex-wrap gap-2">
                  {categoryTabs.map((tab) => {
                    const isActive = selectedCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`
                          px-4 py-2 rounded-xl text-[14.5px] font-bold
                          transition-all duration-150 cursor-pointer whitespace-nowrap
                          ${isActive
                            ? 'bg-[#E5322D] text-white shadow-sm shadow-red-500/20'
                            : 'bg-white dark:bg-slate-900 text-[#4B5563] dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
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
            <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-12">

              {/* Tools Counter & Active Filter Status */}
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-[14px] font-bold text-slate-600 dark:text-slate-400">
                  <span>Available Tools ({filteredTools.length})</span>
                  {selectedCategory !== 'all' && (
                    <span className="px-2.5 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-[#E5322D] font-bold text-xs border border-red-200/60 dark:border-red-900">
                      Showing: {categoryTabs.find(c => c.id === selectedCategory)?.label}
                    </span>
                  )}
                </div>
                {selectedCategory !== 'all' && (
                  <button 
                    onClick={() => setSelectedCategory('all')} 
                    className="text-xs font-bold text-[#E5322D] hover:underline cursor-pointer"
                  >
                    View All Tools
                  </button>
                )}
              </div>

              {filteredTools.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#141518] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tools found</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    No tools matched "{searchQuery.trim()}". Try searching for "merge", "compress", or "passport".
                  </p>
                  <button onClick={() => setSearchQuery('')} className="mt-4 px-4 py-2 text-xs font-bold bg-[#E5322D] text-white rounded-xl hover:bg-red-700 cursor-pointer">
                    Clear Search
                  </button>
                </div>
              ) : (
                /* Authentic iLovePDF Responsive 6-Column Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
                  {filteredTools.map((tool) => {
                    const isFav = favorites.includes(tool.id);
                    return (
                      <div
                        key={tool.id}
                        onClick={() => openTool(tool)}
                        className="
                          group relative bg-white dark:bg-[#141518]
                          border-2 border-transparent hover:border-[#E5322D]
                          shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-xl
                          rounded-2xl p-5
                          cursor-pointer
                          transition-all duration-200
                          hover:-translate-y-1.5
                          flex flex-col justify-between
                          min-h-[185px] select-none
                        "
                      >
                        <div>
                          {/* Top row: Authentic iLovePDF Icon + Star */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="transition-transform group-hover:scale-105">
                              <ILovePdfToolIcon toolId={tool.id} size={48} />
                            </div>
                            <button
                              onClick={(e) => toggleFavorite(tool.id, e)}
                              className={`p-1.5 rounded-lg text-slate-300 hover:text-amber-400 transition-colors ${
                                isFav ? '!text-amber-400 opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                              title="Star favorite tool"
                            >
                              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>
                          </div>

                          {/* Tool Name - Larger, bold font */}
                          <h3 className="font-extrabold text-[16px] text-[#111827] dark:text-white leading-snug group-hover:text-[#E5322D] transition-colors">
                            {tool.name}
                          </h3>

                          {/* Tool Description - Readable, gentle gray */}
                          <p className="text-[13px] text-[#6B7280] dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            {tool.description}
                          </p>
                        </div>

                        {/* Format extension tag */}
                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                          <span className="truncate max-w-[120px] font-mono text-[11px] text-slate-400">
                            {tool.acceptedExtensions.slice(0, 3).map(e => `.${e}`).join(' ')}
                          </span>
                          <span className="text-[#E5322D] font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Use Tool →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── 3-Step Simple How It Works Banner for New Users ─── */}
              <div className="mt-20 pt-14 border-t border-slate-200 dark:border-slate-800">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    How it works in 3 easy steps
                  </h3>
                  <p className="text-[14.5px] text-slate-500 dark:text-slate-400 mt-1.5">
                    No sign-up, no software installation, and no file uploads required.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 text-center">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E5322D] font-black text-lg flex items-center justify-center mx-auto">
                      1
                    </div>
                    <h4 className="text-[16px] font-bold text-slate-900 dark:text-white">Choose a Tool</h4>
                    <p className="text-[13.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Select any tool from the grid above, such as Merge PDF, Passport Photo Maker, or Compress.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 text-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-black text-lg flex items-center justify-center mx-auto">
                      2
                    </div>
                    <h4 className="text-[16px] font-bold text-slate-900 dark:text-white">Pick or Drop Files</h4>
                    <p className="text-[13.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Click the big select button or drop your file. Files stay entirely in your browser RAM.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center mx-auto">
                      3
                    </div>
                    <h4 className="text-[16px] font-bold text-slate-900 dark:text-white">Instant Download</h4>
                    <p className="text-[13.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Your files convert in seconds. Click download to save your new file immediately.
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
