import React, { useState, useRef } from 'react';
import { UploadCloud, File, ArrowRight, Sparkles, CheckCircle2, RefreshCw, FileText, FileCode, Image, Archive } from 'lucide-react';
import { detectFileFormat, DetectedFileType } from '../../core/detector/fileSniffer';
import { pluginRegistry } from '../../core/plugins/registry';
import { ToolPlugin } from '../../core/plugins/types';
import { useI18n } from '../../i18n';
import { getToolIcon } from '../common/iconSystem';

interface SmartDropZoneProps {
  onFilesSelected: (files: File[], recommendedTool?: ToolPlugin) => void;
}

export const SmartDropZone: React.FC<SmartDropZoneProps> = ({ onFilesSelected }) => {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{
    file: File;
    detection: DetectedFileType;
    suggestedTools: ToolPlugin[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const detection = await detectFileFormat(file);

    // Look up tools
    const tools = detection.suggestedToolIds
      .map(id => pluginRegistry.get(id))
      .filter((p): p is ToolPlugin => Boolean(p));

    setDetectedInfo({
      file,
      detection,
      suggestedTools: tools,
    });

    // If multiple files dropped, trigger batch mode
    if (files.length > 1) {
      onFilesSelected(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[26px] p-6 sm:p-8 lg:p-10 text-center cursor-pointer transition-all duration-200 group overflow-hidden ${
          isDragging
            ? 'border-rose-500 bg-rose-50/70 shadow-xl shadow-rose-500/10 scale-[1.01]'
            : 'border-rose-200/90 hover:border-rose-400 bg-white/95 hover:bg-rose-50/20 shadow-xs hover:shadow-lg hover:shadow-rose-500/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Flanked layout: Left Graphic | Center Action | Right Graphic */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 relative z-10">
          
          {/* Left Side Graphic: Stylized PDF icon with an action gear badge */}
          <div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-rose-50/70 to-white/90 border border-rose-100 shadow-md shadow-rose-500/5 w-52 shrink-0 group-hover:scale-102 transition-transform duration-300 select-none">
            <div className="relative w-20 h-24 mb-3">
              {/* PDF Document Graphic */}
              <div className="w-18 h-22 mx-auto bg-white rounded-xl border border-rose-200 shadow-sm relative overflow-hidden flex flex-col justify-between p-2">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider bg-rose-500 text-white shadow-2xs">
                    PDF
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-100" />
                </div>
                {/* Simulated doc lines */}
                <div className="space-y-1.5 px-0.5 my-1">
                  <div className="w-full h-1 bg-rose-100 rounded-full" />
                  <div className="w-4/5 h-1 bg-rose-100/70 rounded-full" />
                  <div className="w-3/5 h-1 bg-rose-100/50 rounded-full" />
                </div>
                {/* Red footer bar */}
                <div className="w-full h-1.5 bg-rose-500/20 rounded-full" />
              </div>

              {/* Action Gear Badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 border-2 border-white">
                <svg
                  className="w-4 h-4 animate-[spin_10s_linear_infinite]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            </div>
            <div className="font-bold text-xs text-slate-800 tracking-tight">PDF Engine Core</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Compress • Merge • OCR</div>
          </div>

          {/* Center: Main Smart Drop Zone upload action */}
          <div className="flex-1 max-w-md mx-auto space-y-4">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-all duration-300 shadow-sm ${
              isDragging
                ? 'bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/30'
                : 'bg-rose-50 border border-rose-200/80 text-rose-500 group-hover:scale-108 group-hover:bg-rose-500 group-hover:text-white shadow-rose-500/10'
            }`}>
              {isDragging ? (
                <RefreshCw className="w-8 h-8 animate-spin text-white" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div>
              <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight transition-colors ${
                isDragging ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {isDragging ? 'Drop Files to Convert Locally' : t('dropzone.title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {isDragging
                  ? 'Zero data leaves your computer. 100% private in-browser execution.'
                  : 'Drop any PDF, document, photo, video, or archive here to get instant smart tool recommendations.'}
              </p>

              {/* Dynamic reactive format pills when dragging */}
              {isDragging && (
                <div className="flex items-center justify-center gap-2 mt-3 animate-in fade-in zoom-in-95 duration-150">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100/90 text-rose-700 text-[10px] font-bold border border-rose-200">
                    <FileText className="w-3 h-3" /> PDF
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-700 text-[10px] font-bold border border-blue-200">
                    <FileCode className="w-3 h-3" /> Word / Docs
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <Image className="w-3 h-3" /> Images
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-700 text-[10px] font-bold border border-amber-200">
                    <Archive className="w-3 h-3" /> ZIP
                  </span>
                </div>
              )}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Choose Files</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">Or drag and drop files directly</p>
            </div>
          </div>

          {/* Right Side Graphic: Word document icon pointing via an arrow to a JPEG/Image icon */}
          <div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-white/90 border border-blue-100 shadow-md shadow-blue-500/5 w-52 shrink-0 group-hover:scale-102 transition-transform duration-300 select-none">
            <div className="flex items-center justify-center gap-2 mb-3">
              {/* Word Doc Icon */}
              <div className="w-14 h-18 bg-white rounded-xl border border-blue-200 shadow-xs flex flex-col justify-between p-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-1 py-0.2 rounded text-[8px] font-black tracking-wider bg-blue-600 text-white">
                    DOC
                  </span>
                </div>
                <div className="space-y-1 px-0.5">
                  <div className="w-full h-1 bg-blue-100 rounded-full" />
                  <div className="w-3/4 h-1 bg-blue-100/70 rounded-full" />
                  <div className="w-1/2 h-1 bg-blue-100/50 rounded-full" />
                </div>
                <div className="w-full h-1 bg-blue-500/20 rounded-full" />
              </div>

              {/* Conversion Arrow */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                </div>
              </div>

              {/* JPEG Image Icon */}
              <div className="w-14 h-18 bg-white rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between p-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-1 py-0.2 rounded text-[8px] font-black tracking-wider bg-emerald-600 text-white">
                    JPG
                  </span>
                </div>
                {/* Picture Vector (Mountain + Sun) */}
                <div className="w-full h-7 bg-emerald-50 rounded-lg flex items-center justify-center relative overflow-hidden my-auto border border-emerald-100/70">
                  <div className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1.5" />
                  <svg className="w-8 h-5 text-emerald-500 mt-2" viewBox="0 0 24 16" fill="currentColor">
                    <path d="M0 16L7 6L13 14L17 9L24 16H0Z" />
                  </svg>
                </div>
                <div className="w-full h-1 bg-emerald-500/20 rounded-full" />
              </div>
            </div>
            <div className="font-bold text-xs text-slate-800 tracking-tight">Format Converter</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Word • Excel ➔ PDF & Images</div>
          </div>

        </div>
      </div>

      {/* Real-time Sniffer Quick Recommendation Card */}
      {detectedInfo && (
        <div className="mt-4 p-5 rounded-[20px] bg-white border border-rose-200/80 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs">
                <File className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  {detectedInfo.file.name}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                    {(detectedInfo.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Detected format: <strong className="text-slate-800 font-bold">{detectedInfo.detection.readableName}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onFilesSelected([detectedInfo.file])}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Choose another tool manually
            </button>
          </div>

          <div className="pt-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Recommended actions for your file:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {detectedInfo.suggestedTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onFilesSelected([detectedInfo.file], tool)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/40 text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-rose-200">
                      {getToolIcon(tool.id, tool.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                        {tool.name}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
