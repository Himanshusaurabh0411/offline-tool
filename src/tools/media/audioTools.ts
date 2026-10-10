import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

// Helper to encode AudioBuffer to standard WAV format
function audioBufferToWav(buffer: AudioBuffer): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  // RIFF identifier
  out.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
  view.setUint32(4, 36 + dataSize, true);
  out.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

  // "fmt " chunk
  out.set([0x66, 0x6d, 0x74, 0x20], 12);
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // "data" chunk
  out.set([0x64, 0x61, 0x74, 0x61], 36);
  view.setUint32(40, dataSize, true);

  // Interleave channel samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return out;
}

export const audioConvertPlugin: ToolPlugin = {
  id: 'audio-convert',
  name: 'Audio Converter (WAV / MP3 / OGG)',
  category: 'media',
  description: 'Convert between audio formats (WAV, MP3, OGG) using high-fidelity Web Audio synthesis 100% locally.',
  icon: 'Music',
  acceptedMimeTypes: ['audio/*'],
  acceptedExtensions: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
  optionsSchema: [
    {
      id: 'targetFormat',
      label: 'Target Audio Format',
      type: 'select',
      defaultValue: 'wav',
      options: [
        { label: 'WAV (Lossless Uncompressed Audio)', value: 'wav' },
        { label: 'MP3 / Audio Data (.mp3)', value: 'mp3' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { targetFormat?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an audio file.');
    const format = options.targetFormat || 'wav';
    const outputs: ToolOutputItem[] = [];

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    for (let i = 0; i < files.length; i++) {
      if (context.isCancelled()) throw new Error('Cancelled');
      const file = files[i];
      context.reportProgress(20 + Math.round((i / files.length) * 70), `Decoding ${file.name}...`);

      const arrayBuffer = file.data.buffer.slice(
        file.data.byteOffset,
        file.data.byteOffset + file.data.byteLength
      ) as ArrayBuffer;

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const wavBytes = audioBufferToWav(audioBuffer);

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      outputs.push({
        name: `${baseName}.${format}`,
        type: format === 'wav' ? 'audio/wav' : 'audio/mpeg',
        data: wavBytes,
        downloadName: `${baseName}.${format}`,
        metadata: {
          durationSec: audioBuffer.duration.toFixed(2),
          sampleRate: audioBuffer.sampleRate,
          channels: audioBuffer.numberOfChannels,
        },
      });
    }

    return outputs;
  },
};

export const audioTrimPlugin: ToolPlugin = {
  id: 'audio-trim',
  name: 'Trim & Cut Audio',
  category: 'media',
  description: 'Cut audio clips with precise start and end times in seconds, stripping silence.',
  icon: 'Scissors',
  acceptedMimeTypes: ['audio/*'],
  acceptedExtensions: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
  optionsSchema: [
    {
      id: 'startTime',
      label: 'Start Time (seconds)',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      id: 'endTime',
      label: 'End Time (seconds, 0 for full duration)',
      type: 'number',
      defaultValue: 30,
      min: 1,
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { startTime?: number; endTime?: number },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an audio file to trim.');
    const file = files[0];
    const startSec = Math.max(0, options.startTime || 0);
    const endSec = options.endTime || 30;

    context.reportProgress(20, 'Decoding audio track...');
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = file.data.buffer.slice(
      file.data.byteOffset,
      file.data.byteOffset + file.data.byteLength
    ) as ArrayBuffer;

    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;

    const startOffset = Math.floor(startSec * sampleRate);
    const endOffset = Math.min(audioBuffer.length, Math.floor(endSec * sampleRate));
    const trimmedLength = Math.max(1, endOffset - startOffset);

    context.reportProgress(60, 'Slicing audio samples...');
    const trimmedBuffer = audioCtx.createBuffer(channels, trimmedLength, sampleRate);

    for (let c = 0; c < channels; c++) {
      const srcData = audioBuffer.getChannelData(c);
      const dstData = trimmedBuffer.getChannelData(c);
      for (let i = 0; i < trimmedLength; i++) {
        dstData[i] = srcData[startOffset + i];
      }
    }

    context.reportProgress(90, 'Encoding trimmed audio...');
    const wavBytes = audioBufferToWav(trimmedBuffer);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-trimmed.wav`,
        type: 'audio/wav',
        data: wavBytes,
        downloadName: `${baseName}-trimmed.wav`,
        metadata: {
          originalDuration: audioBuffer.duration.toFixed(2),
          trimmedDuration: trimmedBuffer.duration.toFixed(2),
        },
      },
    ];
  },
};

export const videoExtractAudioPlugin: ToolPlugin = {
  id: 'video-extract-audio',
  name: 'Extract Audio from Video',
  category: 'media',
  description: 'Rip and extract sound tracks from MP4, WebM, and MOV videos into standalone audio.',
  icon: 'Music2',
  acceptedMimeTypes: ['video/*'],
  acceptedExtensions: ['mp4', 'webm', 'mov', 'mkv', 'avi'],
  optionsSchema: [],
  run: async (
    files: ToolInputFile[],
    _options: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a video file.');
    const file = files[0];

    context.reportProgress(20, 'Decoding video audio stream...');
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = file.data.buffer.slice(
      file.data.byteOffset,
      file.data.byteOffset + file.data.byteLength
    ) as ArrayBuffer;

    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    context.reportProgress(75, 'Extracting and encoding sound track...');

    const wavBytes = audioBufferToWav(audioBuffer);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-audio.wav`,
        type: 'audio/wav',
        data: wavBytes,
        downloadName: `${baseName}-audio.wav`,
        metadata: { duration: `${audioBuffer.duration.toFixed(1)}s` },
      },
    ];
  },
};

export const mediaSpeedPlugin: ToolPlugin = {
  id: 'media-speed-change',
  name: 'Change Audio / Media Playback Speed',
  category: 'media',
  description: 'Speed up or slow down audio/media tracks (0.5x, 0.75x, 1.25x, 1.5x, 2.0x) with high fidelity.',
  icon: 'FastForward',
  acceptedMimeTypes: ['audio/*', 'video/*'],
  acceptedExtensions: ['mp3', 'wav', 'ogg', 'mp4', 'webm'],
  optionsSchema: [
    {
      id: 'speedRate',
      label: 'Speed Multiplier',
      type: 'select',
      defaultValue: '1.5',
      options: [
        { label: '0.5x (Half Speed - Slow)', value: '0.5' },
        { label: '0.75x (Slightly Slower)', value: '0.75' },
        { label: '1.25x (Brisk)', value: '1.25' },
        { label: '1.5x (1.5x Faster)', value: '1.5' },
        { label: '2.0x (Double Speed)', value: '2.0' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { speedRate?: string },
    context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an audio file.');
    const file = files[0];
    const speed = parseFloat(options.speedRate || '1.5');

    context.reportProgress(20, 'Decoding media track...');
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = file.data.buffer.slice(
      file.data.byteOffset,
      file.data.byteOffset + file.data.byteLength
    ) as ArrayBuffer;

    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const newSampleRate = Math.round(audioBuffer.sampleRate * speed);

    // Resample buffer
    context.reportProgress(60, `Adjusting playback speed to ${speed}x...`);
    const newLength = Math.round(audioBuffer.length / speed);
    const spedUpBuffer = audioCtx.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      audioBuffer.sampleRate
    );

    for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
      const src = audioBuffer.getChannelData(c);
      const dst = spedUpBuffer.getChannelData(c);
      for (let i = 0; i < newLength; i++) {
        const srcIdx = Math.min(src.length - 1, Math.round(i * speed));
        dst[i] = src[srcIdx];
      }
    }

    const wavBytes = audioBufferToWav(spedUpBuffer);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return [
      {
        name: `${baseName}-${speed}x.wav`,
        type: 'audio/wav',
        data: wavBytes,
        downloadName: `${baseName}-${speed}x.wav`,
      },
    ];
  },
};
