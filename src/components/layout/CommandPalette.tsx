import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, FileText, Image, Film, Archive, Terminal, FileCode, Camera } from 'lucide-react';
import { pluginRegistry } from '../../core/plugins/registry';
import { ToolPlugin, ToolCategory } from '../../core/plugins/types';
import { useI18n } from '../../i18n';
import { ILovePdfToolIcon } from '../common/ILovePdfIcons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolPlugin) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectTool }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allTools = pluginRegistry.search(query);
  const tools = React.useMemo(() => {
    if (query.trim()) return allTools;
    const priority = [
      'pdf-merge',
      'pdf-split',
      'pdf-compress',
      'pdf-to-word',
      'word-to-pdf',
      'passport-photo-maker',
      'custom-size-reducer',
      'pdf-to-excel',
      'excel-to-pdf',
      'images-to-pdf',
      'pdf-to-images',
      'pdf-to-text',
      'text-to-pdf',
      'image-compress',
      'image-resize',
      'docx-converter',
      'spreadsheet-converter',
      'pdf-protect',
      'pdf-edit',
      'zip-create',
    ];
    return [...allTools].sort((a, b) => {
      const idxA = priority.indexOf(a.id);
      const idxB = priority.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [allTools, query]);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#141518] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141518]">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tools by name, format, or task (e.g. passport, merge, compress)..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Listing */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {tools.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No tools matching "{query}"
            </div>
          ) : (
            tools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors
                    ${isSelected 
                      ? 'bg-red-50/60 dark:bg-slate-800 text-slate-900 dark:text-white' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="shrink-0 flex items-center justify-center">
                      <ILovePdfToolIcon toolId={tool.id} size={30} />
                    </div>
                    <div className="truncate">
                      <div className="text-[14.5px] font-bold truncate text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{tool.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {tool.description}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-opacity ${isSelected ? 'opacity-100 text-[#E5322D]' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono">↑↓</kbd> to navigate</span>
            <span><kbd className="font-mono">↵</kbd> to select</span>
          </div>
          <span>Offline Toolkit Quick Launcher</span>
        </div>

      </div>
    </div>
  );
};
