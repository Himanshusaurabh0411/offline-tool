import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
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
  Save,
  File
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
  };

  const handleRemoveStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId),
      updatedAt: Date.now(),
    }));
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

  // Run Pipeline on dropped files
  const handleRunPipeline = async () => {
    if (stagedFiles.length === 0) return;
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Banner */}
      <div className="p-6 sm:p-7 rounded-[22px] bg-white border border-stone-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-100/50 via-rose-100/30 to-transparent rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Offline Pipeline Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-2.5">{t('workflow.title')}</h1>
            <p className="text-sm text-stone-500 mt-1 max-w-xl leading-relaxed">
              {t('workflow.subtitle')}
            </p>
          </div>

          {/* Preset Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-stone-500 font-semibold">Load Preset Pipeline</span>
            <select
              value={workflow.id}
              onChange={(e) => {
                const found = workflowPresets.find(p => p.id === e.target.value);
                if (found) setWorkflow(found);
              }}
              className="bg-stone-50/70 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs transition-all"
            >
              {workflowPresets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[20px] bg-white border border-stone-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={workflow.name}
            onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
            className="bg-stone-50/70 border border-stone-200 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs transition-all"
          />
          <span className="text-xs text-stone-500 font-semibold px-2.5 py-1 rounded-full bg-stone-100">
            {workflow.steps.length} Steps
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/80 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            {t('workflow.export_json')}
          </button>

          <button
            onClick={() => importInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/80 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            {t('workflow.import_json')}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportJson}
          />
        </div>
      </div>

      {/* Visual Pipeline Steps Chain */}
      <div className="space-y-3.5">
        {workflow.steps.map((step, idx) => {
          const plugin = pluginRegistry.get(step.toolId);
          return (
            <React.Fragment key={step.id}>
              <div className="relative p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs">
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center border border-slate-200">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{step.name}</h4>
                      <span className="text-[10px] uppercase font-semibold text-slate-500">
                        {plugin?.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveStep(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveStep(idx, 'down')}
                      disabled={idx === workflow.steps.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveStep(step.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 ml-1.5"
                      title="Delete step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Step options */}
                {plugin && plugin.optionsSchema.length > 0 && (
                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {plugin.optionsSchema.map((opt) => (
                      <div key={opt.id} className="space-y-1">
                        <label className="text-[11px] text-slate-600 font-medium block">
                          {opt.label}
                        </label>
                        {opt.type === 'select' && (
                          <select
                            value={step.options[opt.id]}
                            onChange={(e) => handleOptionChange(step.id, opt.id, e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-900 shadow-2xs"
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
                            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-900 shadow-2xs"
                          />
                        )}
                        {opt.type === 'number' && (
                          <input
                            type="number"
                            value={step.options[opt.id] ?? opt.defaultValue}
                            onChange={(e) => handleOptionChange(step.id, opt.id, Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-900 shadow-2xs"
                          />
                        )}
                        {opt.type === 'boolean' && (
                          <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-700">
                            <input
                              type="checkbox"
                              checked={Boolean(step.options[opt.id])}
                              onChange={(e) => handleOptionChange(step.id, opt.id, e.target.checked)}
                              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span>{opt.label}</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Connecting Pipe Indicator */}
              {idx < workflow.steps.length - 1 && (
                <div className="flex items-center justify-center -my-1">
                  <div className="p-1 rounded-full bg-white border border-slate-200 text-slate-400 shadow-2xs">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Add Step Dropdown */}
        <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center gap-2.5 shadow-2xs">
          <Plus className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-700">Add Next Pipeline Step:</span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddStep(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
          >
            <option value="" disabled>
              Select tool to add...
            </option>
            {allAvailableTools.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline Input & Execution Section */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
          <File className="w-4 h-4 text-slate-600" />
          Run Pipeline on Batch of Files
        </h3>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 transition-all"
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
          <span className="text-xs text-slate-700 font-medium block">
            {stagedFiles.length > 0
              ? `${stagedFiles.length} file(s) staged: ${stagedFiles.map(f => f.name).join(', ')}`
              : 'Drop files here or click to select files for the pipeline'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Each file will pass through all {workflow.steps.length} steps sequentially in-browser.
          </span>
        </div>

        {stagedFiles.length > 0 && !finalOutputs && (
          <div className="space-y-3">
            <button
              onClick={handleRunPipeline}
              disabled={isRunning || workflow.steps.length === 0}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  {t('workflow.run_pipeline')} ({stagedFiles.length} Files)
                </>
              )}
            </button>

            {isRunning && execStatus && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{execStatus.statusMessage}</span>
                  <span className="font-mono font-medium">{execStatus.stepProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-150"
                    style={{ width: `${execStatus.stepProgress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Final Pipeline Outputs */}
        {finalOutputs && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900">Pipeline Execution Succeeded</h4>
              </div>
              <button
                onClick={handleDownloadAllZip}
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Archive className="w-3.5 h-3.5" />
                Download All as ZIP
              </button>
            </div>

            <div className="space-y-1.5">
              {finalOutputs.map((out, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-900 truncate">{out.downloadName || out.name}</span>
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
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setFinalOutputs(null);
                setStagedFiles([]);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 pt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Run Another Batch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
