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
    id: 'ecommerce-photo-suite',
    name: 'E-Commerce Product Photo Suite',
    description: 'Removes distracting background, standardizes dimensions, and outputs ultra-compressed web images.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    steps: [
      {
        id: 's1',
        toolId: 'image-remove-bg',
        name: 'Remove Background',
        options: { bgColor: 'white', tolerance: 30 },
      },
      {
        id: 's2',
        toolId: 'image-resize',
        name: 'Resize Image',
        options: { scalePercent: 100 },
      },
      {
        id: 's3',
        toolId: 'image-compress',
        name: 'Compress Image',
        options: { quality: 80, scale: 100 },
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
        options: { watermarkText: 'CONFIDENTIAL', opacity: 0.2 },
      },
      {
        id: 's2',
        toolId: 'pdf-page-numbers',
        name: 'Add Page Numbers',
        options: { position: 'bottom-center', format: 'page_of_total', fontSize: 10 },
      },
    ],
  },
  {
    id: 'privacy-metadata-stripper',
    name: 'Privacy Stripper & EXIF Sanitizer',
    description: 'Completely purges GPS, device info, and tracking tags from your photos and files.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    steps: [
      {
        id: 's1',
        toolId: 'metadata-scrubber',
        name: 'Metadata Scrubber',
        options: { stripExif: true, stripIptc: true, stripXmp: true },
      },
      {
        id: 's2',
        toolId: 'image-compress',
        name: 'Compress Image',
        options: { quality: 85, scale: 100 },
      },
    ],
  },
];
