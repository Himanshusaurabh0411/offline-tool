import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Configure local worker without external CDN
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

export async function loadPdfJsDocument(data: Uint8Array | ArrayBuffer): Promise<any> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    cMapUrl: undefined,
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

export async function renderPageToCanvas(
  pdfDoc: any,
  pageNumber: number,
  scale = 1.5
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
  return canvas;
}

export async function renderPageToBlob(
  pdfDoc: any,
  pageNumber: number,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality = 0.9,
  scale = 2.0
): Promise<Blob> {
  const canvas = await renderPageToCanvas(pdfDoc, pageNumber, scale);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to blob failed'));
      },
      format,
      quality
    );
  });
}

export async function extractTextFromPdf(pdfDoc: any): Promise<string[]> {
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageString = textContent.items
      // @ts-ignore
      .map((item: any) => item.str)
      .join(' ');
    pageTexts.push(pageString);
  }

  return pageTexts;
}
