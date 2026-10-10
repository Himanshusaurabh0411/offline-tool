import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, Image, Check, FileCheck } from 'lucide-react';
import { useI18n } from '../../i18n';

interface QualitySliderProps {
  originalFile?: File;
  initialQuality?: number;
  onChange: (quality: number, scale: number) => void;
}

export const QualitySlider: React.FC<QualitySliderProps> = ({
  originalFile,
  initialQuality = 80,
  onChange,
}) => {
  const { t } = useI18n();
  const [quality, setQuality] = useState(initialQuality);
  const [scale, setScale] = useState(100);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (originalFile && originalFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(originalFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [originalFile]);

  const handleQualityChange = (q: number) => {
    setQuality(q);
    onChange(q, scale);
  };

  const handleScaleChange = (s: number) => {
    setScale(s);
    onChange(quality, s);
  };

  // Estimate output size: based on original size, resolution scale squared and quality factor
  const originalSize = originalFile?.size || 1024 * 1024; // fallback 1MB
  const estimatedSize = Math.max(
    1024,
    Math.round(originalSize * (scale / 100) * (scale / 100) * (quality / 100) * 0.75)
  );
  const savingsPercent = Math.max(0, Math.round(((originalSize - estimatedSize) / originalSize) * 100));

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          {t('tool.quality_size')}
        </h4>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          ~{savingsPercent}% Estimated Reduction
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quality Controls */}
        <div className="space-y-3.5">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-700">Compression Quality</span>
              <span className="font-mono text-slate-900 font-semibold">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Smallest File</span>
              <span>Balanced</span>
              <span>Max Quality</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-700">Resolution Scale</span>
              <span className="font-mono text-slate-900 font-semibold">{scale}%</span>
            </div>
            <input
              type="range"
              min="25"
              max="100"
              step="5"
              value={scale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>

          {/* Size Comparison Badge */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">{t('tool.original_size')}</span>
              <span className="font-mono font-semibold text-slate-800">
                {(originalSize / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="text-slate-400">➔</div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">{t('tool.estimated_size')}</span>
              <span className="font-mono font-bold text-emerald-700">
                {(estimatedSize / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        </div>

        {/* Live Preview (if image) */}
        {previewUrl && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex flex-col items-center justify-center overflow-hidden">
            <div className="text-[11px] text-slate-500 mb-2 font-medium">Live Canvas Preview</div>
            <div className="max-h-44 max-w-full overflow-hidden rounded flex items-center justify-center bg-white p-1 border border-slate-200">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-36 object-contain rounded"
                style={{
                  filter: `contrast(${100 - (100 - quality) * 0.1}%) blur(${scale < 50 ? '0.5px' : '0px'})`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
