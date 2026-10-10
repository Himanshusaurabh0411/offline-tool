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
  FileCheck,
  Terminal,
  Cpu,
  ArrowUpRight
} from 'lucide-react';

interface FooterProps {
  onOpenPrivacyPanel: () => void;
  onOpenCommandPalette: () => void;
  onOpenTool?: (toolId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyPanel, onOpenCommandPalette, onOpenTool }) => {
  return (
    <footer className="w-full border-t border-[#E5E7EB] dark:border-slate-800/80 bg-white dark:bg-[#0B0C0E] pt-16 pb-12 mt-20 relative z-10 transition-colors">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 space-y-12">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand, Creator Profile & Contacts */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] shadow-xs">
                <span className="font-bold text-xs tracking-tight">OT</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#111827] dark:text-white">
                Offline Toolkit
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                100% Client-Side
              </span>
            </div>

            <p className="text-[13px] text-[#6B7280] dark:text-slate-400 leading-relaxed max-w-sm">
              Professional in-browser utility suite engineered for privacy, speed, and zero server egress. Powered by local WebAssembly engines.
            </p>

            {/* Himanshu Saurabh - Developer Card */}
            <div className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-[#141518] border border-[#E5E7EB] dark:border-slate-800 space-y-3 max-w-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Created & Maintained By
                  </h4>
                  <p className="text-[14px] font-extrabold text-[#111827] dark:text-white">
                    Himanshu Saurabh
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Available for developer feedback" />
              </div>

              <p className="text-[12px] text-slate-600 dark:text-slate-400">
                Direct developer contact for suggestions, custom offline workflows, and issues:
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* LinkedIn Link */}
                <a
                  href="https://www.linkedin.com/in/himanshu-saurabh-38515b381/?isSelfProfile=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2] text-white text-[12px] font-semibold hover:bg-[#084e96] transition-colors shadow-2xs"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </a>

                {/* WhatsApp Connect */}
                <a
                  href="https://wa.me/919318375856?text=Hi%20Himanshu,%20I'm%20using%20Offline%20Toolkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-[12px] font-semibold hover:bg-[#20ba5a] transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp (+91 9318375856)</span>
                </a>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero-Egress: Files are processed strictly in your local device RAM.</span>
            </div>
          </div>

          {/* Col 3: Organize PDF & Photos */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Photos & Organize
            </h4>
            <ul className="text-[13px] text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li><button onClick={() => onOpenTool?.('passport-photo-maker')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer font-bold text-teal-700 dark:text-teal-300">Passport Photo Maker</button></li>
              <li><button onClick={() => onOpenTool?.('custom-size-reducer')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer font-bold text-indigo-700 dark:text-indigo-300">Custom Size Reducer (KB)</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-merge')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Merge PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-split')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Split PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-remove-pages')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Remove Pages</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-rotate')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Rotate PDF</button></li>
            </ul>
          </div>

          {/* Col 4: Optimize & Convert */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Optimize & Convert
            </h4>
            <ul className="text-[13px] text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li><button onClick={() => onOpenTool?.('pdf-compress')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Compress PDF</button></li>
              <li><button onClick={() => onOpenTool?.('image-compress')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Compress Images</button></li>
              <li><button onClick={() => onOpenTool?.('images-to-pdf')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Photos to PDF</button></li>
              <li><button onClick={() => onOpenTool?.('word-to-pdf')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Word to PDF</button></li>
              <li><button onClick={() => onOpenTool?.('excel-to-pdf')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Excel to PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-to-images')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">PDF to JPG</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-to-word')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">PDF to Word</button></li>
            </ul>
          </div>

          {/* Col 5: Security & Dev Utilities */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Security & Dev
            </h4>
            <ul className="text-[13px] text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li><button onClick={() => onOpenTool?.('pdf-protect')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Protect PDF (AES-256)</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-unlock')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Unlock PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-sign')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Sign PDF</button></li>
              <li><button onClick={() => onOpenTool?.('pdf-watermark')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Watermark PDF</button></li>
              <li><button onClick={() => onOpenTool?.('hash-checker')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Cryptographic Hash</button></li>
              <li><button onClick={() => onOpenTool?.('base64-tool')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Base64 Encoder/Decoder</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5E7EB] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Offline Toolkit. Crafted by <strong>Himanshu Saurabh</strong>.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onOpenPrivacyPanel} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              Privacy Proof
            </button>
            <button onClick={onOpenCommandPalette} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              Command Palette (⌘K)
            </button>
            <a 
              href="tel:9318375856" 
              className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              <Phone className="w-3 h-3 text-[#25D366]" /> +91 9318375856
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
