export type ToolCategory =
  | 'pdf'
  | 'documents'
  | 'images'
  | 'media'
  | 'archives'
  | 'dev';

export type OptionType = 'string' | 'number' | 'boolean' | 'select' | 'range' | 'color';

export interface ToolOptionDefinition {
  id: string;
  label: string;
  type: OptionType;
  defaultValue: any;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[]; // For select types
}

export interface ToolInputFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: Uint8Array;
}

export interface ToolOutputItem {
  name: string;
  type: string;
  data: Uint8Array | Blob | string;
  downloadName?: string;
  previewUrl?: string;
  metadata?: Record<string, any>;
}

export interface ToolExecutionContext {
  reportProgress: (percent: number, message?: string) => void;
  isCancelled: () => boolean;
}

export interface ToolPlugin<TOptions = Record<string, any>> {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string; // Lucide icon identifier
  acceptedMimeTypes: string[];
  acceptedExtensions: string[];
  optionsSchema: ToolOptionDefinition[];
  run: (
    files: ToolInputFile[],
    options: TOptions,
    context: ToolExecutionContext
  ) => Promise<ToolOutputItem[]>;
}

export interface BatchItem {
  id: string;
  file: File;
  status: 'queued' | 'processing' | 'completed' | 'error' | 'cancelled';
  progress: number;
  statusMessage?: string;
  output?: ToolOutputItem[];
  error?: string;
  durationMs?: number;
}
