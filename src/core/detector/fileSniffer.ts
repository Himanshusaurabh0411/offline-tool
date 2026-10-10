// Smart file detector using magic bytes inspection and smart tool suggestions

export interface DetectedFileType {
  mime: string;
  category: 'pdf' | 'image' | 'document' | 'media' | 'archive' | 'data' | 'text' | 'unknown';
  extension: string;
  readableName: string;
  suggestedToolIds: string[];
}

export async function detectFileFormat(file: File | Blob): Promise<DetectedFileType> {
  const slice = file.slice(0, 128);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Helper to test string at offset
  const matchesString = (offset: number, str: string): boolean => {
    for (let i = 0; i < str.length; i++) {
      if (bytes[offset + i] !== str.charCodeAt(i)) return false;
    }
    return true;
  };

  // 1. PDF: %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return {
      mime: 'application/pdf',
      category: 'pdf',
      extension: 'pdf',
      readableName: 'Adobe PDF Document',
      suggestedToolIds: ['pdf-compress', 'pdf-merge', 'pdf-split', 'pdf-redact', 'pdf-to-images', 'metadata-scrubber', 'pdf-ocr']
    };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return {
      mime: 'image/png',
      category: 'image',
      extension: 'png',
      readableName: 'PNG Image',
      suggestedToolIds: ['image-compress', 'image-convert', 'image-remove-bg', 'image-resize', 'images-to-pdf', 'metadata-scrubber']
    };
  }

  // 3. JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return {
      mime: 'image/jpeg',
      category: 'image',
      extension: 'jpg',
      readableName: 'JPEG Image',
      suggestedToolIds: ['image-compress', 'image-convert', 'image-exif-remover', 'image-resize', 'images-to-pdf', 'metadata-scrubber']
    };
  }

  // 4. GIF: GIF87a or GIF89a
  if (matchesString(0, 'GIF87a') || matchesString(0, 'GIF89a')) {
    return {
      mime: 'image/gif',
      category: 'image',
      extension: 'gif',
      readableName: 'GIF Animation / Image',
      suggestedToolIds: ['image-compress', 'image-convert', 'image-resize', 'metadata-scrubber']
    };
  }

  // 5. WebP: RIFF....WEBP
  if (matchesString(0, 'RIFF') && matchesString(8, 'WEBP')) {
    return {
      mime: 'image/webp',
      category: 'image',
      extension: 'webp',
      readableName: 'WebP Image',
      suggestedToolIds: ['image-compress', 'image-convert', 'image-resize', 'metadata-scrubber']
    };
  }

  // 6. ZIP based (ZIP, DOCX, XLSX, EPUB): PK 03 04
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const fileName = (file as File).name?.toLowerCase() || '';
    if (fileName.endsWith('.docx')) {
      return {
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        category: 'document',
        extension: 'docx',
        readableName: 'Word Document (DOCX)',
        suggestedToolIds: ['docx-to-html', 'docx-to-markdown', 'metadata-scrubber', 'hash-checker']
      };
    }
    if (fileName.endsWith('.xlsx')) {
      return {
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        category: 'document',
        extension: 'xlsx',
        readableName: 'Excel Spreadsheet (XLSX)',
        suggestedToolIds: ['xlsx-to-csv', 'xlsx-to-json', 'metadata-scrubber', 'hash-checker']
      };
    }
    return {
      mime: 'application/zip',
      category: 'archive',
      extension: 'zip',
      readableName: 'ZIP Archive',
      suggestedToolIds: ['zip-extract', 'hash-checker', 'file-health-check']
    };
  }

  // 7. MP4 / MOV: ftyp at offset 4
  if (matchesString(4, 'ftyp') || matchesString(4, 'moov')) {
    return {
      mime: 'video/mp4',
      category: 'media',
      extension: 'mp4',
      readableName: 'MP4 Video',
      suggestedToolIds: ['video-compress', 'video-extract-audio', 'video-to-gif', 'video-trim', 'metadata-scrubber']
    };
  }

  // 8. MP3: ID3 or 0xFF 0xFB
  if (matchesString(0, 'ID3') || (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0)) {
    return {
      mime: 'audio/mpeg',
      category: 'media',
      extension: 'mp3',
      readableName: 'MP3 Audio',
      suggestedToolIds: ['audio-convert', 'audio-trim', 'ai-speech-to-text', 'metadata-scrubber']
    };
  }

  // 9. WAV: RIFF....WAVE
  if (matchesString(0, 'RIFF') && matchesString(8, 'WAVE')) {
    return {
      mime: 'audio/wav',
      category: 'media',
      extension: 'wav',
      readableName: 'WAV Audio',
      suggestedToolIds: ['audio-convert', 'audio-trim', 'ai-speech-to-text', 'metadata-scrubber']
    };
  }

  // 10. Fallback based on extension or mime
  const fileName = (file as File).name?.toLowerCase() || '';
  if (fileName.endsWith('.json')) {
    return {
      mime: 'application/json',
      category: 'data',
      extension: 'json',
      readableName: 'JSON Document',
      suggestedToolIds: ['json-yaml-converter', 'json-formatter', 'hash-checker']
    };
  }

  if (fileName.endsWith('.csv')) {
    return {
      mime: 'text/csv',
      category: 'data',
      extension: 'csv',
      readableName: 'CSV Table',
      suggestedToolIds: ['csv-to-json', 'csv-to-xlsx', 'hash-checker']
    };
  }

  if (fileName.endsWith('.md')) {
    return {
      mime: 'text/markdown',
      category: 'document',
      extension: 'md',
      readableName: 'Markdown Document',
      suggestedToolIds: ['markdown-to-html', 'word-counter', 'hash-checker']
    };
  }

  return {
    mime: file.type || 'application/octet-stream',
    category: 'unknown',
    extension: fileName.split('.').pop() || 'bin',
    readableName: file.type || 'Generic File',
    suggestedToolIds: ['hash-checker', 'file-health-check', 'metadata-scrubber', 'base64-tool']
  };
}
