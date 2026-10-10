import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Moon, 
  Sun, 
  Grid3X3, 
  X, 
  Menu, 
  Search, 
  Sparkles, 
  Share2, 
  ShieldCheck, 
  Linkedin, 
  MessageCircle,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';

interface HeaderProps {
  onOpenPrivacyPanel: () => void;
  onOpenCommandPalette: () => void;
  onOpenOfflineShare: () => void;
  onSelectCategory: (category: string) => void;
  currentCategory: string;
  onSelectWorkflowBuilder: () => void;
  onOpenTool: (toolId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPrivacyPanel,
  onOpenCommandPalette,
  onOpenOfflineShare,
  onSelectCategory,
  onSelectWorkflowBuilder,
  onOpenTool,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('offlineforge_theme') === 'dark'
  );
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isAllToolsOpen, setIsAllToolsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const convertRef = useRef<HTMLDivElement>(null);
  const allToolsRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('offlineforge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('offlineforge_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (convertRef.current && !convertRef.current.contains(e.target as Node)) setIsConvertOpen(false);
      if (allToolsRef.current && !allToolsRef.current.contains(e.target as Node)) setIsAllToolsOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkCls = `
    px-3.5 py-2 text-[13.5px] font-extrabold uppercase tracking-wide rounded-lg
    text-[#1F2937] dark:text-slate-200
    hover:text-[#E5322D] dark:hover:text-[#E5322D]
    hover:bg-red-50/40 dark:hover:bg-slate-800/60
    transition-all duration-150 cursor-pointer whitespace-nowrap
  `;

  const dropdownPanelCls = `
    absolute top-[calc(100%+8px)] left-0
    bg-white dark:bg-[#1E2025]
    border border-[#E5E7EB] dark:border-slate-700
    rounded-2xl shadow-2xl py-2.5 z-50
    animate-in fade-in zoom-in-95 duration-100
  `;

  const dropdownItemCls = `
    w-full text-left px-4 py-2.5 text-[14px] font-medium
    text-[#374151] dark:text-slate-200
    hover:bg-[#F3F4F6] dark:hover:bg-slate-800
    hover:text-[#111827] dark:hover:text-white
    transition-colors cursor-pointer
    flex items-center justify-between gap-3
  `;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0E1013]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-slate-800 transition-colors">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-4">

        {/* ── Brand Logo: Offline Toolkit ────────────────────────────── */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
          onClick={() => onSelectCategory('all')}
          title="Offline Toolkit"
        >
          <div className="w-9 h-9 rounded-lg bg-[#E5322D] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-5" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
          </div>
          <span className="font-black text-[22px] tracking-tight text-[#111827] dark:text-white">
            Offline<span className="text-[#E5322D]">Toolkit</span>
          </span>
        </div>

        {/* ── Primary Navigation ─────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {/* PASSPORT & PHOTOS (Prominent human-need feature) */}
          <button 
            onClick={() => onSelectCategory('photos')} 
            className="px-4 py-2 text-[14.5px] font-black text-teal-800 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-teal-200/60 dark:border-teal-800"
          >
            <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Passport & Photos</span>
          </button>

          <button onClick={() => onOpenTool('pdf-merge')} className={navLinkCls}>
            Merge PDF
          </button>

          <button onClick={() => onOpenTool('pdf-split')} className={navLinkCls}>
            Split PDF
          </button>

          <button onClick={() => onOpenTool('pdf-compress')} className={navLinkCls}>
            Compress PDF
          </button>

          {/* Convert PDF dropdown */}
          <div className="relative" ref={convertRef}>
            <button
              onClick={() => { setIsConvertOpen(p => !p); setIsAllToolsOpen(false); setIsMoreOpen(false); }}
              className={`${navLinkCls} inline-flex items-center gap-1`}
            >
              <span>Convert PDF</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${isConvertOpen ? 'rotate-180' : ''}`} />
            </button>
            {isConvertOpen && (
              <div className={`${dropdownPanelCls} w-[280px]`}>
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Convert to PDF
                </div>
                {[
                  { id: 'images-to-pdf', label: 'JPG & PNG to PDF', desc: 'Photos to PDF' },
                  { id: 'word-to-pdf', label: 'Word to PDF', desc: '.docx to .pdf' },
                  { id: 'excel-to-pdf', label: 'Excel to PDF', desc: '.xlsx spreadsheets' },
                  { id: 'text-to-pdf', label: 'Text to PDF', desc: 'Notes to PDF' },
                ].map(item => (
                  <button key={item.id} onClick={() => { onOpenTool(item.id); setIsConvertOpen(false); }} className={dropdownItemCls}>
                    <div>
                      <div className="font-bold text-[14px] text-slate-900 dark:text-white">{item.label}</div>
                      <div className="text-[11.5px] text-slate-500">{item.desc}</div>
                    </div>
                  </button>
                ))}
                <div className="mx-3 my-1.5 border-t border-slate-100 dark:border-slate-800" />
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Convert from PDF
                </div>
                {[
                  { id: 'pdf-to-images', label: 'PDF to JPG', desc: 'Extract pages as images' },
                  { id: 'pdf-to-word', label: 'PDF to Word', desc: 'Extract to editable Word' },
                  { id: 'pdf-to-excel', label: 'PDF to Excel', desc: 'Extract tables to Excel' },
                  { id: 'pdf-to-text', label: 'PDF to Text', desc: 'Extract plain text' },
                ].map(item => (
                  <button key={item.id} onClick={() => { onOpenTool(item.id); setIsConvertOpen(false); }} className={dropdownItemCls}>
                    <div>
                      <div className="font-bold text-[14px] text-slate-900 dark:text-white">{item.label}</div>
                      <div className="text-[11.5px] text-slate-500">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All Tools mega dropdown */}
          <div className="relative" ref={allToolsRef}>
            <button
              onClick={() => { setIsAllToolsOpen(p => !p); setIsConvertOpen(false); setIsMoreOpen(false); }}
              className={`${navLinkCls} inline-flex items-center gap-1`}
            >
              <span>All Tools ▾</span>
            </button>
            {isAllToolsOpen && (
              <div className={`${dropdownPanelCls} w-[380px] p-3 grid grid-cols-2 gap-1.5`}>
                {[
                  { id: 'photos', label: 'Passport & Photos', sub: 'Gov size, 4x6 print sheet', color: 'text-teal-600' },
                  { id: 'organize', label: 'Organize PDF', sub: 'Merge, split, rotate pages', color: 'text-red-600' },
                  { id: 'optimize', label: 'Optimize PDF', sub: 'Compress, repair, OCR', color: 'text-emerald-600' },
                  { id: 'edit', label: 'Edit & Annotate', sub: 'Watermark, crop, numbers', color: 'text-purple-600' },
                  { id: 'security', label: 'Privacy & Security', sub: 'Protect, sign, redact', color: 'text-blue-600' },
                  { id: 'dev', label: 'Developer Tools', sub: 'Hashes, Base64, regex, diff', color: 'text-slate-700 dark:text-slate-300' },
                ].map(cat => (
                  <button key={cat.id} onClick={() => { onSelectCategory(cat.id); setIsAllToolsOpen(false); }}
                    className="text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className={`text-[13px] font-extrabold ${cat.color}`}>{cat.label}</div>
                    <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{cat.sub}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── Right Actions: Search + Support + Mode ─────────────────── */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5E7EB] dark:border-slate-800 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900 transition-all cursor-pointer shadow-2xs"
            title="Search tools (⌘K)"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">⌘K</kbd>
          </button>

          {/* Himanshu WhatsApp Direct Help */}
          <a
            href="https://wa.me/919318375856?text=Hi%20Himanshu,%20I'm%20using%20Offline%20Toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] text-white text-[13px] font-bold hover:bg-[#20ba5a] transition-colors shadow-2xs"
            title="Questions or feedback? Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden md:inline">Support</span>
          </a>

          {/* Theme Switcher */}
          <button
            onClick={() => setIsDark(p => !p)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-[#E5E7EB] dark:border-slate-800"
            title="Toggle color theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(p => !p)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer rounded-xl border border-slate-200"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-[#111215] px-4 py-4 space-y-2 animate-in fade-in duration-150">
          {/* Mobile Quick Search Bar */}
          <button
            onClick={() => { onOpenCommandPalette(); setIsMobileOpen(false); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold cursor-pointer mb-2"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search any tool...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">⌘K</kbd>
          </button>

          {/* Passport & Photos Suite Banner */}
          <button 
            onClick={() => { onSelectCategory('photos'); setIsMobileOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-xl font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 flex items-center justify-between text-[14px] border border-teal-200/80 dark:border-teal-800"
          >
            <div className="flex items-center gap-2.5">
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Passport & Biometric Photos</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-200/60 dark:bg-teal-800 text-teal-900 dark:text-teal-100">
              Govt Standard
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { id: 'pdf-merge', label: 'Merge PDF' },
              { id: 'pdf-split', label: 'Split PDF' },
              { id: 'pdf-compress', label: 'Compress PDF' },
              { id: 'pdf-to-word', label: 'PDF to Word' },
              { id: 'word-to-pdf', label: 'Word to PDF' },
              { id: 'custom-size-reducer', label: 'Reduce KB Size' },
              { id: 'image-remove-bg', label: 'Remove Background' },
              { id: 'images-to-pdf', label: 'JPG to PDF' },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => { onOpenTool(tool.id); setIsMobileOpen(false); }}
                className="w-full text-left p-3 rounded-xl font-bold text-[13px] text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#E5322D]" />
                <span className="truncate">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
