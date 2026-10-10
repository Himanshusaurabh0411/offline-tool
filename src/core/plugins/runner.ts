import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext, BatchItem } from './types';
import { VersionTimeline } from '../storage/timeline';

export class ExecutionController {
  private cancelled = false;

  public cancel(): void {
    this.cancelled = true;
  }

  public isCancelled(): boolean {
    return this.cancelled;
  }
}

export async function fileToToolInput(file: File): Promise<ToolInputFile> {
  const buffer = await file.arrayBuffer();
  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    data: new Uint8Array(buffer),
  };
}

export async function executeTool(
  plugin: ToolPlugin,
  files: File[],
  options: Record<string, any>,
  onProgress?: (percent: number, message?: string) => void,
  controller?: ExecutionController
): Promise<ToolOutputItem[]> {
  const inputs: ToolInputFile[] = [];
  for (const f of files) {
    if (controller?.isCancelled()) {
      throw new Error('Operation cancelled by user.');
    }
    inputs.push(await fileToToolInput(f));
  }

  const context: ToolExecutionContext = {
    reportProgress: (percent, msg) => {
      if (onProgress) onProgress(percent, msg);
    },
    isCancelled: () => controller?.isCancelled() ?? false,
  };

  if (controller?.isCancelled()) {
    throw new Error('Operation cancelled by user.');
  }

  const results = await plugin.run(inputs, options, context);

  // Automatically record each output in Version Timeline for undo/rollback capability!
  for (const out of results) {
    let blob: Blob;
    if (out.data instanceof Blob) {
      blob = out.data;
    } else if (out.data instanceof Uint8Array) {
      blob = new Blob([out.data as any], { type: out.type });
    } else {
      blob = new Blob([String(out.data)], { type: out.type });
    }

    const originalName = files[0]?.name || out.name;
    await VersionTimeline.recordVersion(originalName, plugin.name, blob);
  }

  return results;
}
