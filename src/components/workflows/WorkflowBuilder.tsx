import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Download,
  Upload,
  Play,
  RotateCcw,
  CheckCircle,
  FileCheck,
  Archive,
  Loader2,
  File as FileIcon,
  Layers,
  Settings,
  Shield,
  Image as ImageIcon,
  FileText,
  Sliders,
  Check,
  Zap,
  HelpCircle,
  Copy,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import JSZip from 'jszip';
import { WorkflowDefinition, WorkflowStep, WorkflowExecutionStatus } from '../../workflows/types';
import { workflowPresets } from '../../workflows/presets';
import { WorkflowEngine } from '../../workflows/engine';
import { pluginRegistry } from '../../core/plugins/registry';
import { ToolOutputItem } from '../../core/plugins/types';
import { useI18n } from '../../i18n';

interface WorkflowBuilderProps {
  onBack: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onBack }) => {
  const { t } = useI18n();
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(workflowPresets[0]);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [execStatus, setExecStatus] = useState<WorkflowExecutionStatus | null>(null);
  const [finalOutputs, setFinalOutputs] = useState<ToolOutputItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStepTab, setActiveStepTab] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');
  const [isToolPaletteOpen, setIsToolPaletteOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const allAvailableTools = pluginRegistry.getAll();

  const handleAddStep = (toolId: string) => {
    const plugin = pluginRegistry.get(toolId);
    if (!plugin) return;

    const initialOptions: Record<string, any> = {};
    for (const opt of plugin.optionsSchema) {
      initialOptions[opt.id] = opt.defaultValue;
    }

    const newStep: WorkflowStep = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      toolId: plugin.id,
      name: plugin.name,
      options: initialOptions,
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      updatedAt: Date.now(),
    }));
    setActiveStepTab(newStep.id);
  };

  const handleRemoveStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId),
      updatedAt: Date.now(),
    }));
    if (activeStepTab === stepId) setActiveStepTab(null);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...workflow.steps];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSteps.length) return;

    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;

    setWorkflow(prev => ({ ...prev, steps: newSteps, updatedAt: Date.now() }));
  };

  const handleOptionChange = (stepId: string, optionKey: string, val: any) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(s =>
        s.id === stepId ? { ...s, options: { ...s.options, [optionKey]: val } } : s
      ),
      updatedAt: Date.now(),
    }));
  };

  // Run Pipeline on staged files
  const handleRunPipeline = async () => {
    if (stagedFiles.length === 0) {
      setError('Please select or drop at least one file to execute the pipeline.');
      return;
    }
    if (workflow.steps.length === 0) {
      setError('Your workflow requires at least 1 processing step.');
      return;
    }
    setIsRunning(true);
    setError(null);
    setFinalOutputs(null);

    try {
      const results = await WorkflowEngine.execute(workflow, stagedFiles, (status) => {
        setExecStatus(status);
      });
      setFinalOutputs(results);
    } catch (err: any) {
      setError(err.message || 'Workflow pipeline execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  // Create sample dummy image for instant 1-click test
  const handleLoadSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(0, 0, 600, 600);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Test Image', 300, 280);
      ctx.font = '22px sans-serif';
      ctx.fillText('Offline Toolkit Flow', 300, 330);
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'offline-sample.png', { type: 'image/png' });
        setStagedFiles([file]);
      }
    }, 'image/png');
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(workflow, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, '-')}-workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.steps && Array.isArray(parsed.steps)) {
          setWorkflow(parsed);
        } else {
          alert('Invalid workflow JSON file.');
        }
      } catch {
        alert('Could not parse workflow JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    if (!finalOutputs || finalOutputs.length === 0) return;
    const zip = new JSZip();
    for (const out of finalOutputs) {
      zip.file(out.downloadName || out.name, out.data as any);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, '-')}-results.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* ── Studio Hero Header ────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111317] border border-stone-200/90 dark:border-stone-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Visual Drag & Drop Workflow Studio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% In-Browser</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-stone-900 dark:text-white">
              Chain Any Tools into a <span className="text-amber-600 dark:text-amber-400">1-Click Pipeline</span>
            </h1>
            
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
              Connect image, PDF, and privacy tools sequentially. Drop batches of files and let your browser transform them step-by-step with zero cloud uploads.
            </p>
          </div>

          {/* Quick Actions & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setViewMode('canvas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'canvas'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Canvas Graph
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Step List
              </button>
            </div>

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Export Recipe as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Import Recipe JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJson}
            />

            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold transition-colors"
            >
              Back to Tools
            </button>
          </div>
        </div>
      </div>

      {/* ── Preset Recipes Carousel ────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Instant 1-Click Recipe Templates
          </span>
          <span className="text-xs text-stone-400">Click any recipe to load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {workflowPresets.map((preset) => {
            const isSelected = workflow.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setWorkflow(preset);
                  setFinalOutputs(null);
                  setError(null);
                }}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-xs ring-2 ring-amber-400/20'
                    : 'bg-white dark:bg-[#111317] border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {preset.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shrink-0">
                    {preset.steps.length} Steps
                  </span>
                </div>
                <p className="text-[11.5px] text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 text-[11px] font-semibold text-stone-600 dark:text-stone-400 overflow-hidden">
                  {preset.steps.map((st, i) => (
                    <React.Fragment key={st.id}>
                      <span className="truncate max-w-[90px]">{st.name}</span>
                      {i < preset.steps.length - 1 && <span className="text-amber-500 font-bold">➔</span>}
                    </React.Fragment>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Workflow Toolbar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#111317] border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="text"
            value={workflow.name}
            onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
            className="w-full max-w-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            placeholder="Workflow Name"
          />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 shrink-0">
            {workflow.steps.length} Nodes Configured
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsToolPaletteOpen(p => !p)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tool to Chain</span>
          </button>
        </div>
      </div>

      {/* ── Tool Palette Drawer (When Open) ───────────────────────────── */}
      {isToolPaletteOpen && (
        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#13161c] border-2 border-amber-400 dark:border-amber-600 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">
                Select a Tool to Append to Pipeline:
              </h3>
            </div>
            <button
              onClick={() => setIsToolPaletteOpen(false)}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {allAvailableTools.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  handleAddStep(t.id);
                  setIsToolPaletteOpen(false);
                }}
                className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 text-left transition-all hover:scale-[1.02] shadow-2xs group cursor-pointer"
              >
                <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                  {t.name}
                </div>
                <div className="text-[10.5px] uppercase font-bold text-stone-400 mt-1">
                  {t.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CANVAS VIEW: Interactive Visual Pipeline Graph ─────────────── */}
      {viewMode === 'canvas' ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-stone-50/70 dark:bg-[#0c0e12] border border-stone-200 dark:border-stone-800 min-h-[460px] relative overflow-x-auto shadow-inner">
          
          {/* Subtle Canvas Dot Grid Background */}
          <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="flex flex-col lg:flex-row items-center justify-start gap-6 relative z-10 min-w-full pb-4">
            
            {/* NODE 0: INPUT SOURCE (Dropzone & Staging) */}
            <div className="w-full lg:w-72 shrink-0 bg-white dark:bg-[#15181f] rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 p-5 shadow-sm relative group hover:border-amber-400 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-black text-xs text-stone-700 dark:text-stone-300">
                    IN
                  </div>
                  <span className="font-extrabold text-xs text-stone-900 dark:text-white">Batch Input</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                  {stagedFiles.length} Staged
                </span>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-3.5 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-center cursor-pointer hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) setStagedFiles(Array.from(e.target.files));
                  }}
                />
                <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5 group-hover:text-amber-500 transition-colors" />
                <span className="font-bold text-xs text-stone-800 dark:text-stone-200 block">
                  {stagedFiles.length > 0 ? `${stagedFiles.length} file(s) ready` : 'Drop input files here'}
                </span>
                <span className="text-[10.5px] text-stone-400 block mt-0.5">
                  or click to select
                </span>
              </div>

              {/* Sample loader button */}
              <button
                onClick={handleLoadSampleImage}
                className="w-full mt-2.5 py-1.5 rounded-lg text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800 transition-colors"
              >
                + Load Sample Test Image
              </button>

              {stagedFiles.length > 0 && (
                <div className="mt-3 space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                  {stagedFiles.map((f, i) => (
                    <div key={i} className="text-[11px] text-stone-600 dark:text-stone-400 truncate flex items-center gap-1.5">
                      <FileIcon className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FLOW CABLE / CONNECTOR */}
            <div className="flex items-center justify-center text-amber-500 font-black rotate-90 lg:rotate-0">
              <div className="w-8 h-1 bg-amber-400 dark:bg-amber-600 rounded-full relative overflow-hidden">
                {isRunning && <div className="absolute inset-0 bg-white animate-pulse" />}
              </div>
              <ArrowRight className="w-5 h-5 -ml-1 text-amber-500" />
            </div>

            {/* INTERMEDIATE STEP NODES */}
            {workflow.steps.map((step, idx) => {
              const plugin = pluginRegistry.get(step.toolId);
              const isCurrentStep = isRunning && execStatus?.currentStepIndex === idx;
              const isCompletedStep = execStatus?.isCompleted || (isRunning && (execStatus?.currentStepIndex ?? 0) > idx);

              return (
                <React.Fragment key={step.id}>
                  <div className={`w-full lg:w-72 shrink-0 rounded-2xl border transition-all relative ${
                    isCurrentStep
                      ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                      : isCompletedStep
                      ? 'bg-white dark:bg-[#15181f] border-emerald-400 dark:border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-[#15181f] border-stone-200 dark:border-stone-800 shadow-sm'
                  }`}>
                    
                    {/* Node Header */}
                    <div className="p-4 pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md font-mono font-black text-xs flex items-center justify-center ${
                          isCompletedStep
                            ? 'bg-emerald-500 text-white'
                            : isCurrentStep
                            ? 'bg-amber-500 text-white animate-bounce'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}>
                          {isCompletedStep ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white leading-tight">
                            {step.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-stone-400">
                            {plugin?.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20"
                          title="Move Left"
                        >
                          <ArrowUp className="w-3.5 h-3.5 lg:-rotate-90" />
                        </button>
                        <button
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === workflow.steps.length - 1}
                          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20"
                          title="Move Right"
                        >
                          <ArrowDown className="w-3.5 h-3.5 lg:-rotate-90" />
                        </button>
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="Delete Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Step Options / Controls */}
                    <div className="p-4 space-y-2.5 max-h-48 overflow-y-auto no-scrollbar">
                      {plugin && plugin.optionsSchema.length > 0 ? (
                        plugin.optionsSchema.map((opt) => (
                          <div key={opt.id} className="space-y-1">
                            <label className="text-[11px] text-stone-600 dark:text-stone-400 font-bold block">
                              {opt.label}
                            </label>

                            {opt.type === 'select' && (
                              <select
                                value={step.options[opt.id]}
                                onChange={(e) => handleOptionChange(step.id, opt.id, e.target.value)}
                                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-900 dark:text-white shadow-2xs font-medium"
                              >
                                {opt.options?.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            {opt.type === 'string' && (
                              <input
                                type="text"
                                value={step.options[opt.id] ?? ''}
                                onChange={(e) => handleOptionChange(step.id, opt.id, e.target.value)}
                                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-900 dark:text-white shadow-2xs font-medium"
                              />
                            )}

                            {opt.type === 'number' && (
                              <input
                                type="number"
                                value={step.options[opt.id] ?? opt.defaultValue}
                                onChange={(e) => handleOptionChange(step.id, opt.id, Number(e.target.value))}
                                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-900 dark:text-white shadow-2xs font-medium"
                              />
                            )}

                            {opt.type === 'boolean' && (
                              <label className="flex items-center gap-2 cursor-pointer pt-0.5 text-stone-700 dark:text-stone-300 text-xs">
                                <input
                                  type="checkbox"
                                  checked={Boolean(step.options[opt.id])}
                                  onChange={(e) => handleOptionChange(step.id, opt.id, e.target.checked)}
                                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-[11px] font-medium">{opt.label}</span>
                              </label>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-stone-400 italic py-2 text-center">
                          Default smart auto-settings applied
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flow Cable */}
                  <div className="flex items-center justify-center text-amber-500 font-black rotate-90 lg:rotate-0">
                    <div className="w-8 h-1 bg-amber-400 dark:bg-amber-600 rounded-full relative overflow-hidden">
                      {isRunning && <div className="absolute inset-0 bg-white animate-pulse" />}
                    </div>
                    <ArrowRight className="w-5 h-5 -ml-1 text-amber-500" />
                  </div>
                </React.Fragment>
              );
            })}

            {/* NODE END: OUTPUT BUNDLE */}
            <div className={`w-full lg:w-72 shrink-0 rounded-2xl border-2 p-5 shadow-sm transition-all ${
              finalOutputs
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600'
                : 'bg-white dark:bg-[#15181f] border-stone-200 dark:border-stone-800'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${
                    finalOutputs ? 'bg-emerald-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}>
                    OUT
                  </div>
                  <span className="font-extrabold text-xs text-stone-900 dark:text-white">Output Dock</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                  {finalOutputs ? `${finalOutputs.length} ready` : 'Pending'}
                </span>
              </div>

              <div className="mt-3.5 space-y-2 text-center">
                {finalOutputs ? (
                  <>
                    <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto" />
                    <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 block">
                      Pipeline Complete!
                    </span>
                    <button
                      onClick={handleDownloadAllZip}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Download ZIP ({finalOutputs.length})
                    </button>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-stone-400 text-xs">
                    Run pipeline to generate outputs
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-3.5">
          {workflow.steps.map((step, idx) => {
            const plugin = pluginRegistry.get(step.toolId);
            return (
              <div key={step.id} className="p-4 rounded-2xl bg-white dark:bg-[#111317] border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono font-black text-xs text-stone-700 dark:text-stone-300 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">{step.name}</h4>
                    <span className="text-[11px] uppercase font-bold text-stone-400">{plugin?.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => handleMoveStep(idx, 'up')} disabled={idx === 0} className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-20">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleMoveStep(idx, 'down')} disabled={idx === workflow.steps.length - 1} className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-20">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleRemoveStep(step.id)} className="p-1.5 text-rose-500 hover:text-rose-700 ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pipeline Execution Controller & Live Log ─────────────────── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111317] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-500" />
              Execute Pipeline on Staged Files
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Files will flow sequentially through all {workflow.steps.length} steps in browser memory.
            </p>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning || workflow.steps.length === 0}
            className="px-6 py-3 rounded-2xl bg-[#E5322D] hover:bg-[#c92420] disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run {workflow.name} ({stagedFiles.length} files)</span>
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {isRunning && execStatus && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
              <span>{execStatus.statusMessage}</span>
              <span className="font-mono">{execStatus.stepProgress}%</span>
            </div>
            <div className="w-full bg-amber-200/60 dark:bg-amber-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-200"
                style={{ width: `${execStatus.stepProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Output list */}
        {finalOutputs && (
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
              <span className="font-extrabold text-xs text-stone-900 dark:text-white">
                Generated Artifacts ({finalOutputs.length})
              </span>
              <button
                onClick={handleDownloadAllZip}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Archive className="w-3.5 h-3.5" />
                Download All as ZIP
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {finalOutputs.map((out, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-xs text-stone-800 dark:text-stone-200 truncate">
                      {out.downloadName || out.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      let blob = out.data instanceof Blob ? out.data : new Blob([out.data as any], { type: out.type });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = out.downloadName || out.name;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }}
                    className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 text-xs font-bold"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
