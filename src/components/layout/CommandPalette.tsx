import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, FileText, Image, Film, Archive, Terminal, FileCode } from 'lucide-react';
import { pluginRegistry } from '../../core/plugins/registry';
import { ToolPlugin, ToolCategory } from '../../core/plugins/types';
import { useI18n } from '../../i18n';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolPlugin) => void;
}

const categoryIcons: Record<ToolCategory, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-400" />,
  documents: <FileCode className="w-4 h-4 text-blue-400" />,
  images: <Image className="w-4 h-4 text-emerald-400" />,
  media: <Film className="w-4 h-4 text-purple-400" />,
  archives: <Archive className="w-4 h-4 text-amber-400" />,
  dev: <Terminal className="w-4 h-4 text-cyan-400" />,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectTool }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tools = pluginRegistry.search(query);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSelectedIndex(0);
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < tools.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : tools.length - 1));
      } else if (e.key === 'Enter' && tools[selectedIndex]) {
        e.preventDefault();
        onSelectTool(tools[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, tools, selectedIndex, onClose, onSelectTool]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-white">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t('search.placeholder')}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results listing */}
        <div className="max-h-96 overflow-y-auto p-1.5 space-y-0.5">
          {tools.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {t('search.no_results')} "{query}"
            </div>
          ) : (
            tools.map((tool, idx) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool);
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                  selectedIndex === idx
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                    {categoryIcons[tool.category] || <FileText className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div>
                    <div className="font-medium text-xs text-slate-900 flex items-center gap-2">
                      {tool.name}
                      <span className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {tool.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{tool.description}</div>
                  </div>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 ${selectedIndex === idx ? 'text-slate-900' : 'text-slate-300'}`} />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>OfflineForge Quick Launcher</span>
        </div>
      </div>
    </div>
  );
};
