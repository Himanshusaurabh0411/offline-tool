import { ToolOptionDefinition } from '../core/plugins/types';

export interface WorkflowStep {
  id: string; // Unique instance ID in this pipeline
  toolId: string;
  name: string;
  options: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowExecutionStatus {
  currentStepIndex: number;
  totalSteps: number;
  stepProgress: number;
  statusMessage: string;
  isCompleted: boolean;
  isError: boolean;
  errorMessage?: string;
}
