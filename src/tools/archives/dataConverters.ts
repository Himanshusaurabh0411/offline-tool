import yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import QRCode from 'qrcode';
import { ToolPlugin, ToolInputFile, ToolOutputItem, ToolExecutionContext } from '../../core/plugins/types';

export const jsonYamlConverterPlugin: ToolPlugin = {
  id: 'json-yaml-converter',
  name: 'JSON ↔ YAML Converter',
  category: 'archives',
  description: 'Convert and validate between JSON and YAML syntax with clean formatting indentation.',
  icon: 'FileCode',
  acceptedMimeTypes: ['application/json', 'text/yaml', 'text/plain'],
  acceptedExtensions: ['json', 'yaml', 'yml', 'txt'],
  optionsSchema: [
    {
      id: 'direction',
      label: 'Conversion Direction',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto Detect from Extension', value: 'auto' },
        { label: 'JSON to YAML', value: 'json2yaml' },
        { label: 'YAML to JSON', value: 'yaml2json' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { direction?: string },
    _context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select a JSON or YAML file.');
    const dir = options.direction || 'auto';
    const outputs: ToolOutputItem[] = [];

    for (const file of files) {
      const text = new TextDecoder().decode(file.data);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      const isToJson = dir === 'yaml2json' || (dir === 'auto' && (ext === 'yaml' || ext === 'yml'));

      if (isToJson) {
        const parsed = yaml.load(text);
        const jsonStr = JSON.stringify(parsed, null, 2);
        outputs.push({
          name: `${baseName}.json`,
          type: 'application/json',
          data: jsonStr,
          downloadName: `${baseName}.json`,
        });
      } else {
        const parsed = JSON.parse(text);
        const yamlStr = yaml.dump(parsed, { indent: 2 });
        outputs.push({
          name: `${baseName}.yaml`,
          type: 'text/yaml',
          data: yamlStr,
          downloadName: `${baseName}.yaml`,
        });
      }
    }

    return outputs;
  },
};

export const xmlJsonConverterPlugin: ToolPlugin = {
  id: 'xml-json-converter',
  name: 'XML ↔ JSON Converter',
  category: 'archives',
  description: 'Convert between XML documents and JSON objects with attribute parsing.',
  icon: 'FileCode',
  acceptedMimeTypes: ['application/xml', 'text/xml', 'application/json'],
  acceptedExtensions: ['xml', 'json'],
  optionsSchema: [
    {
      id: 'direction',
      label: 'Conversion Direction',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto Detect from Extension', value: 'auto' },
        { label: 'XML to JSON', value: 'xml2json' },
        { label: 'JSON to XML', value: 'json2xml' },
      ],
    },
  ],
  run: async (
    files: ToolInputFile[],
    options: { direction?: string },
    _context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    if (files.length === 0) throw new Error('Please select an XML or JSON file.');
    const dir = options.direction || 'auto';
    const outputs: ToolOutputItem[] = [];

    for (const file of files) {
      const text = new TextDecoder().decode(file.data);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      const isToJson = dir === 'xml2json' || (dir === 'auto' && ext === 'xml');

      if (isToJson) {
        const parser = new XMLParser({ ignoreAttributes: false });
        const jsonObj = parser.parse(text);
        outputs.push({
          name: `${baseName}.json`,
          type: 'application/json',
          data: JSON.stringify(jsonObj, null, 2),
          downloadName: `${baseName}.json`,
        });
      } else {
        const jsonObj = JSON.parse(text);
        const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
        const xmlStr = builder.build(jsonObj);
        outputs.push({
          name: `${baseName}.xml`,
          type: 'application/xml',
          data: xmlStr,
          downloadName: `${baseName}.xml`,
        });
      }
    }

    return outputs;
  },
};

export const qrGeneratorPlugin: ToolPlugin = {
  id: 'qr-generator',
  name: 'QR Code Generator',
  category: 'archives',
  description: 'Generate high-resolution PNG or SVG QR codes for links, text, contacts, or Wi-Fi passwords 100% offline.',
  icon: 'QrCode',
  acceptedMimeTypes: ['*/*'],
  acceptedExtensions: ['*'],
  optionsSchema: [
    {
      id: 'qrContent',
      label: 'QR Code Text or URL',
      type: 'string',
      defaultValue: 'https://offlineforge.local',
    },
    {
      id: 'qrSize',
      label: 'Resolution Size (px)',
      type: 'number',
      defaultValue: 512,
      min: 128,
      max: 2048,
    },
  ],
  run: async (
    _files: ToolInputFile[],
    options: { qrContent?: string; qrSize?: number },
    _context: ToolExecutionContext
  ): Promise<ToolOutputItem[]> => {
    const text = options.qrContent || 'https://offlineforge.local';
    const width = options.qrSize || 512;

    const dataUrl = await QRCode.toDataURL(text, {
      width,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();

    return [
      {
        name: 'qrcode.png',
        type: 'image/png',
        data: blob,
        downloadName: 'qrcode.png',
        metadata: { content: text },
      },
    ];
  },
};
