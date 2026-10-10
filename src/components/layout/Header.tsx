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
    px-3.5 py-1.5 text-[13px] font-semibold tracking-normal rounded-lg
    text-[#374151] dark:text-slate-200
    hover:text-[#111827] dark:hover:text-white
    hover:bg-[#F3F4F6] dark:hover:bg-slate-800
    transition-all duration-150 cursor-pointer whitespace-nowrap
  `;

  const dropdownPanelCls = `
    absolute top-[calc(100%+8px)] left-0
    bg-white dark:bg-[#1E2025]
    border border-[#E5E7EB] dark:border-slate-700
    rounded-2xl shadow-xl py-2 z-50
    animate-in fade-in zoom-in-95 duration-100
  `;

  const dropdownItemCls = `
    w-full text-left px-4 py-2.5 text-[13px] font-medium
    text-[#374151] dark:text-slate-200
    hover:bg-[#F3F4F6] dark:hover:bg-slate-800
    hover:text-[#111827] dark:hover:text-white
    transition-colors cursor-pointer
    flex items-center justify-between gap-3
  `;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#111215]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-slate-800 transition-colors">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between gap-4">

        {/* ── Brand Logo: Offline Toolkit ────────────────────────────── */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
          onClick={() => onSelectCategory('all')}
          title="Offline Toolkit Homepage"
        >
          <div className="w-9 h-9 rounded-xl bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] shadow-sm transition-transform group-hover:scale-105">
            <span className="font-bold text-sm tracking-tight">OT</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[17px] text-[#111827] dark:text-white leading-tight tracking-tight">
                Offline Toolkit
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                Local
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#6B7280] dark:text-slate-400">
              Private In-Browser File Studio
            </span>
          </div>
        </div>

        {/* ── Primary Navigation ─────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* PASSPORT & PHOTOS (Prominent human-need feature) */}
          <button 
            onClick={() => onSelectCategory('photos')} 
            className="px-3.5 py-1.5 text-[13px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
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
              <span>Convert</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isConvertOpen ? 'rotate-180' : ''}`} />
            </button>
            {isConvertOpen && (
              <div className={`${dropdownPanelCls} w-[260px]`}>
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Convert to PDF
                </div>
                {[
                  { id: 'images-to-pdf', label: 'JPG & PNG to PDF', desc: 'Photos to document' },
                  { id: 'word-to-pdf', label: 'Word to PDF', desc: '.docx to .pdf' },
                  { id: 'excel-to-pdf', label: 'Excel to PDF', desc: '.xlsx tables' },
                  { id: 'text-to-pdf', label: 'Text to PDF', desc: 'Raw notes' },
                ].map(item => (
                  <button key={item.id} onClick={() => { onOpenTool(item.id); setIsConvertOpen(false); }} className={dropdownItemCls}>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                  </button>
                ))}
                <div className="mx-3 my-1.5 border-t border-slate-100 dark:border-slate-800" />
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Convert from PDF
                </div>
                {[
                  { id: 'pdf-to-images', label: 'PDF to JPG', desc: 'Extract pages as images' },
                  { id: 'pdf-to-word', label: 'PDF to Word', desc: 'Extract text to .docx' },
                  { id: 'pdf-to-excel', label: 'PDF to Excel', desc: 'Extract tables to .xlsx' },
                  { id: 'pdf-to-text', label: 'PDF to Text', desc: 'Plain text extraction' },
                ].map(item => (
                  <button key={item.id} onClick={() => { onOpenTool(item.id); setIsConvertOpen(false); }} className={dropdownItemCls}>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
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
              <span>All 30+ Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isAllToolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAllToolsOpen && (
              <div className={`${dropdownPanelCls} w-[360px] p-3 grid grid-cols-2 gap-1.5`}>
                {[
                  { id: 'photos', label: 'Passport & Photos', sub: 'Gov size, 4x6 print sheet', color: 'text-teal-600' },
                  { id: 'organize', label: 'Organize PDF', sub: 'Merge, split, rotate pages', color: 'text-red-600' },
                  { id: 'optimize', label: 'Optimize PDF', sub: 'Compress, repair, OCR', color: 'text-emerald-600' },
                  { id: 'edit', label: 'Edit & Annotate', sub: 'Watermark, crop, numbers', color: 'text-purple-600' },
                  { id: 'security', label: 'Privacy & Security', sub: 'Protect, sign, redact', color: 'text-blue-600' },
                  { id: 'dev', label: 'Developer Tools', sub: 'Hashes, Base64, regex, diff', color: 'text-slate-700 dark:text-slate-300' },
                ].map(cat => (
                  <button key={cat.id} onClick={() => { onSelectCategory(cat.id); setIsAllToolsOpen(false); }}
                    className="text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className={`text-[12px] font-bold ${cat.color}`}>{cat.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{cat.sub}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── Right Actions: Search + Connect + Tools ───────────────── */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-800 text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-all cursor-pointer"
            title="Search all tools (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline px-1 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">⌘K</kbd>
          </button>

          {/* Himanshu WhatsApp Direct Help */}
          <a
            href="https://wa.me/919318375856?text=Hi%20Himanshu,%20I'm%20using%20Offline%20Toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366] text-[12px] font-bold hover:bg-[#25D366]/20 transition-colors"
            title="Questions or feedback? Chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Support</span>
          </a>

          {/* Theme Switcher */}
          <button
            onClick={() => setIsDark(p => !p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle color theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* More Menu */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setIsMoreOpen(p => !p)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-[#E5E7EB] dark:border-slate-800"
              title="More workspace tools"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            {isMoreOpen && (
              <div className={`${dropdownPanelCls} right-0 left-auto w-64`}>
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Workspace Features
                </div>
                <button onClick={() => { onSelectWorkflowBuilder(); setIsMoreOpen(false); }} className={dropdownItemCls}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Visual Workflow Builder</span>
                  </div>
                </button>
                <button onClick={() => { onOpenOfflineShare(); setIsMoreOpen(false); }} className={dropdownItemCls}>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>P2P AirDrop-like Share</span>
                  </div>
                </button>
                <button onClick={() => { onOpenPrivacyPanel(); setIsMoreOpen(false); }} className={dropdownItemCls}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Privacy Network Monitor</span>
                  </div>
                </button>

                <div className="mx-3 my-1.5 border-t border-slate-100 dark:border-slate-800" />
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Developer Direct
                </div>
                <a 
                  href="https://www.linkedin.com/in/himanshu-saurabh-38515b381/?isSelfProfile=true" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={dropdownItemCls}
                >
                  <div className="flex items-center gap-2 text-[#0A66C2]">
                    <Linkedin className="w-4 h-4" />
                    <span>Himanshu Saurabh (LinkedIn)</span>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(p => !p)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-[#111215] px-5 py-4 space-y-1">
          <button 
            onClick={() => { onSelectCategory('photos'); setIsMobileOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Passport & Photos Suite</span>
          </button>
          {[
            { id: 'pdf-merge', label: 'Merge PDF' },
            { id: 'pdf-split', label: 'Split PDF' },
            { id: 'pdf-compress', label: 'Compress PDF' },
            { id: 'custom-size-reducer', label: 'Custom Target Size Reducer' },
            { id: 'images-to-pdf', label: 'Photos to PDF' },
            { id: 'pdf-protect', label: 'Protect PDF' },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => { onOpenTool(tool.id); setIsMobileOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-[13px] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {tool.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
