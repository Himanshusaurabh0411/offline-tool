import { WorkflowDefinition, WorkflowExecutionStatus } from './types';
import { pluginRegistry } from '../core/plugins/registry';
import { executeTool, ExecutionController } from '../core/plugins/runner';
import { ToolOutputItem } from '../core/plugins/types';

export class WorkflowEngine {
  public static async execute(
    workflow: WorkflowDefinition,
    initialFiles: File[],
    onProgress: (status: WorkflowExecutionStatus) => void,
    controller?: ExecutionController
  ): Promise<ToolOutputItem[]> {
    if (workflow.steps.length === 0) {
      throw new Error('Workflow has no steps configured.');
    }
    if (initialFiles.length === 0) {
      throw new Error('Please select at least one file to run the workflow on.');
    }

    let currentFiles: File[] = [...initialFiles];
    let lastOutputs: ToolOutputItem[] = [];

    const totalSteps = workflow.steps.length;

    for (let stepIdx = 0; stepIdx < totalSteps; stepIdx++) {
      if (controller?.isCancelled()) {
        throw new Error('Workflow cancelled by user.');
      }

      const step = workflow.steps[stepIdx];
      const plugin = pluginRegistry.get(step.toolId);

      if (!plugin) {
        throw new Error(`Plugin "${step.toolId}" not found in registry.`);
      }

      onProgress({
        currentStepIndex: stepIdx,
        totalSteps,
        stepProgress: 10,
        statusMessage: `Executing Step ${stepIdx + 1}/${totalSteps}: ${plugin.name}...`,
        isCompleted: false,
        isError: false,
      });

      // Execute plugin on current batch of files
      const stepOutputs = await executeTool(
        plugin,
        currentFiles,
        step.options,
        (progress, msg) => {
          onProgress({
            currentStepIndex: stepIdx,
            totalSteps,
            stepProgress: progress,
            statusMessage: msg || `Processing ${plugin.name}...`,
            isCompleted: false,
            isError: false,
          });
        },
        controller
      );

      lastOutputs = stepOutputs;

      // Prepare files for the next step (if there are more steps)
      if (stepIdx < totalSteps - 1) {
        currentFiles = stepOutputs.map((out) => {
          let blob: Blob;
          if (out.data instanceof Blob) {
            blob = out.data;
          } else if (out.data instanceof Uint8Array) {
            blob = new Blob([out.data as any], { type: out.type });
          } else {
            blob = new Blob([String(out.data)], { type: out.type });
          }
          const FileConstructor = typeof window !== 'undefined' ? (window as any).File : (globalThis as any).File;
          return new FileConstructor([blob as any], out.downloadName || out.name, {
            type: out.type,
          }) as File;
        });
      }
    }

    onProgress({
      currentStepIndex: totalSteps,
      totalSteps,
      stepProgress: 100,
      statusMessage: 'Workflow completed successfully!',
      isCompleted: true,
      isError: false,
    });

    return lastOutputs;
  }
}
