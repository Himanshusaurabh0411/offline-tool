import { WorkflowDefinition } from './types';

export const workflowPresets: WorkflowDefinition[] = [
  {
    id: 'photo-optimizer',
    name: 'Photo Resizer & Super Compressor',
    description: 'Resizes high-res camera photos and compresses them to compact WebP format.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    steps: [
      {
        id: 's1',
        toolId: 'image-resize',
        name: 'Resize Image',
        options: { scalePercent: 75 },
      },
      {
        id: 's2',
        toolId: 'image-compress',
        name: 'Compress Image',
        options: { quality: 75, scale: 100 },
      },
    ],
  },
  {
    id: 'secure-pdf-pipeline',
    name: 'Secure PDF Sanitizer & Optimizer',
    description: 'True-redacts sensitive terms, flattens interactive fields, and compresses PDF.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    steps: [
      {
        id: 's1',
        toolId: 'pdf-true-redaction',
        name: 'True PDF Redaction',
        options: { redactTerms: 'CONFIDENTIAL, SECRET, SSN', boxColor: 'black' },
      },
      {
        id: 's2',
        toolId: 'pdf-flatten',
        name: 'Flatten PDF / AcroForms',
        options: {},
      },
      {
        id: 's3',
        toolId: 'pdf-compress',
        name: 'Compress PDF',
        options: { quality: 'medium', stripMetadata: true },
      },
    ],
  },
  {
    id: 'document-watermark-flow',
    name: 'Watermark & Number PDF Document',
    description: 'Stamps a diagonal watermark and adds standard page numbers to every page.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    steps: [
      {
        id: 's1',
        toolId: 'pdf-watermark',
        name: 'Watermark PDF',
        options: { watermarkText: 'INTERNAL USE ONLY', opacity: 0.2 },
      },
      {
        id: 's2',
        toolId: 'pdf-page-numbers',
        name: 'Add Page Numbers',
        options: { position: 'bottom-center', format: 'page_of_total', fontSize: 10 },
      },
    ],
  },
];
