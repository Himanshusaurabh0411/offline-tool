import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const imageCollagePlugin: ToolPlugin = {
  id: 'image-collage',
  name: 'Photo Collage Maker',
  category: 'images',
  description: 'Combine multiple photos into a clean grid, side-by-side, or vertical strip collage.',
  icon: 'LayoutGrid',
  acceptedMimeTypes: ['image/*'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  optionsSchema: [
    {
      id: 'layout',
      label: 'Collage Layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Auto Grid (2x2 / NxM)', value: 'grid' },
        { label: 'Side-by-Side (Horizontal Strip)', value: 'horizontal' },
        { label: 'Stacked (Vertical Strip)', value: 'vertical' },
      ],
    },
    {
      id: 'gap',
      label: 'Border / Spacing (px)',
      type: 'number',
      defaultValue: 16,
      min: 0,
      max: 64,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { layout?: string; gap?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length < 2) throw new Error('Please select at least 2 images for a collage.');
    const layout = options.layout || 'grid';
    const gap = options.gap !== undefined ? Number(options.gap) : 16;

    context.reportProgress(15, 'Loading and preparing image bitmaps...');
    const bitmaps: ImageBitmap[] = [];
    for (const f of files) {
      const blob = new Blob([f.data as any], { type: f.type });
      bitmaps.push(await createImageBitmap(blob));
    }

    // Normalize cell sizes based on average dimensions
    const cellW = Math.max(...bitmaps.map((b) => b.width));
    const cellH = Math.max(...bitmaps.map((b) => b.height));

    let cols = 1;
    let rows = bitmaps.length;

    if (layout === 'horizontal') {
      cols = bitmaps.length;
      rows = 1;
    } else if (layout === 'vertical') {
      cols = 1;
      rows = bitmaps.length;
    } else {
      // Grid: e.g. 2 cols for 2-4 items, 3 cols for 5-9
      cols = bitmaps.length <= 4 ? 2 : Math.ceil(Math.sqrt(bitmaps.length));
      rows = Math.ceil(bitmaps.length / cols);
    }

    const totalWidth = cols * cellW + (cols + 1) * gap;
    const totalHeight = rows * cellH + (rows + 1) * gap;

    context.reportProgress(50, 'Stitching collage on canvas...');
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    for (let i = 0; i < bitmaps.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gap + col * (cellW + gap);
      const y = gap + row * (cellH + gap);
      const bmp = bitmaps[i];

      // Draw centered within cell
      const scale = Math.min(cellW / bmp.width, cellH / bmp.height);
      const w = bmp.width * scale;
      const h = bmp.height * scale;
      const cx = x + (cellW - w) / 2;
      const cy = y + (cellH - h) / 2;

      ctx.drawImage(bmp, cx, cy, w, h);
    }

    context.reportProgress(90, 'Rendering final collage...');
    const collageBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));

    return [
      {
        name: 'collage-output.png',
        type: 'image/png',
        data: collageBlob,
        downloadName: 'collage-output.png',
        metadata: { imagesCombined: bitmaps.length, cols, rows },
      },
    ];
  },
};
