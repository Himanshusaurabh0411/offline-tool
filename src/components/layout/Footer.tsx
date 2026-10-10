import React from 'react';
import { 
  ShieldCheck, 
  Linkedin, 
  MessageCircle, 
  Phone, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  FileCheck 
} from 'lucide-react';

interface FooterProps {
  onOpenPrivacyPanel: () => void;
  onOpenCommandPalette: () => void;
  onOpenTool?: (toolId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyPanel, onOpenCommandPalette, onOpenTool }) => {
  return (
    <footer className="w-full border-t border-[#E8E8E8] bg-white dark:bg-[#141518] dark:border-slate-800 pt-16 pb-12 mt-20 relative z-10 transition-colors">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-12">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand, Creator Profile & Contacts */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E5322D] to-[#FF6B6B] flex items-center justify-center text-white shadow-sm">
                <span className="font-black text-sm">OT</span>
              </div>
              <span className="font-black text-2xl tracking-tight text-[#1A1A1A] dark:text-white">
                Offline<span className="text-[#E5322D]">Toolkit</span>
              </span>
              <span className="ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-50 text-[#E5322D] border border-red-200">
                100% In-Browser
              </span>
            </div>

            <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-relaxed max-w-sm">
              Industrial-grade document & PDF engineering workspace running 100% locally in your browser with zero telemetry and military-grade privacy.
            </p>

            {/* Himanshu Saurabh - Developer Card */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-[#1E2025] border border-[#E5E7EB] dark:border-slate-700/70 space-y-3 max-w-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                    Lead Engineer & Creator
                  </h4>
                  <p className="text-[14px] font-extrabold text-[#1F2937] dark:text-slate-100">
                    Himanshu Saurabh
                  </p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Available for projects" />
              </div>

              <p className="text-[12px] text-[#4B5563] dark:text-slate-400">
                Have suggestions, feature requests, or enterprise inquiries? Connect directly:
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* LinkedIn Link */}
                <a
                  href="https://www.linkedin.com/in/himanshu-saurabh-38515b381/?isSelfProfile=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2] text-white text-[12px] font-semibold hover:bg-[#084e96] transition-colors shadow-xs"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn Profile</span>
                </a>

                {/* WhatsApp Connect */}
                <a
                  href="https://wa.me/919318375856?text=Hi%20Himanshu,%20I%20have%20a%20query%20/%20suggestion%20about%20OfflineForge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-[12px] font-semibold hover:bg-[#20ba5a] transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp (+91 9318375856)</span>
                </a>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero-Server Architecture: Files never touch any remote server.</span>
            </div>
          </div>

          {/* Col 3: Organize PDF */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-black uppercase tracking-wider text-[#E5322D]">
              Organize PDF
            </h4>
            <ul className="text-[13px] text-[#555555] dark:text-slate-400 space-y-2 font-medium">
              <li><button onClick={() => onOpenTool?.('pdf-merge')} className="hover:text-[#E5322D] transition-colors cursor-pointer">Merge PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-split')} className="hover:text-[#E5322D] transition-colors cursor-pointer">Split PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-remove-pages')} className="hover:text-[#E5322D] transition-colors cursor-pointer">Remove Pages</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-extract-pages')} className="hover:text-[#E5322D] transition-colors cursor-pointer">Extract Pages</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-organize')} className="hover:text-[#E5322D] transition-colors cursor-pointer">Organize Pages</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-rotate')} className="hover:text-[#E5322D] transition-colors cursor-pointer">Rotate PDF</button></li>
            </ul>
          </div>

          {/* Col 4: Optimize & Convert */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-black uppercase tracking-wider text-[#4CAF82]">
              Optimize & Convert
            </h4>
            <ul className="text-[13px] text-[#555555] dark:text-slate-400 space-y-2 font-medium">
              <li><button onClick={() => onOpenTool?.('pdf-compress')} className="hover:text-[#4CAF82] transition-colors cursor-pointer">Compress PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-repair')} className="hover:text-[#4CAF82] transition-colors cursor-pointer">Repair Corrupt PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-ocr')} className="hover:text-[#4CAF82] transition-colors cursor-pointer">OCR PDF Engine</button></li>
              <li><button onClick={() => onOpenTool?.('images-to-pdf')} className="hover:text-[#F5A623] transition-colors cursor-pointer">JPG to PDF</button></li>
              <li><button onClick={() => onOpenTool?.('word-to-pdf')} className="hover:text-[#F5A623] transition-colors cursor-pointer">Word to PDF</button></li>
              <li><button onClick={() => onOpenTool?.('excel-to-pdf')} className="hover:text-[#F5A623] transition-colors cursor-pointer">Excel to PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-to-images')} className="hover:text-[#4A90D9] transition-colors cursor-pointer">PDF to JPG</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-to-word')} className="hover:text-[#4A90D9] transition-colors cursor-pointer">PDF to Word</button></li>
            </ul>
          </div>

          {/* Col 5: Security & Pro Utilities */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-black uppercase tracking-wider text-[#3B5998] dark:text-blue-400">
              Security & Pro Tools
            </h4>
            <ul className="text-[13px] text-[#555555] dark:text-slate-400 space-y-2 font-medium">
              <li><button onClick={() => onOpenTool?.('pdf-protect')} className="hover:text-[#3B5998] transition-colors cursor-pointer">Protect PDF (AES-256)</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-unlock')} className="hover:text-[#3B5998] transition-colors cursor-pointer">Unlock PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-sign')} className="hover:text-[#3B5998] transition-colors cursor-pointer">Sign PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-watermark')} className="hover:text-[#9B59B6] transition-colors cursor-pointer">Watermark PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-page-numbers')} className="hover:text-[#9B59B6] transition-colors cursor-pointer">Add Page Numbers</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-true-redaction')} className="hover:text-[#3B5998] transition-colors cursor-pointer">Sanitize & Redact</button></li>
              <li><button onClick={() => onOpenTool?.('hash-checker')} className="hover:text-[#26A69A] transition-colors cursor-pointer">Cryptographic Hashes</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#F0F0F0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#777777] dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} OfflineForge. Developed with ❤️ by <strong>Himanshu Saurabh</strong>.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onOpenPrivacyPanel} className="hover:text-[#111] dark:hover:text-white transition-colors cursor-pointer">
              Privacy Proof
            </button>
            <button onClick={onOpenCommandPalette} className="hover:text-[#111] dark:hover:text-white transition-colors cursor-pointer">
              Command Palette (⌘K)
            </button>
            <a 
              href="tel:9318375856" 
              className="hover:text-[#111] dark:hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              <Phone className="w-3 h-3 text-[#25D366]" /> +91 9318375856
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
