# Offline Toolkit 🛠️

> **100% Client-Side, In-Browser File & Document Engineering Suite.**  
> Zero server uploads. Complete data privacy. Runs entirely on your device via WebAssembly, WebGPU, and modern browser APIs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

---

## 🌟 Overview

**Offline Toolkit** is a privacy-first web application featuring over **45+ high-performance utility tools** for PDF manipulation, image editing, AI neural background removal, biometric passport photos, document conversion, audio/video processing, and developer utilities.

Unlike conventional online tools that upload your sensitive documents, PDFs, and private photos to third-party cloud servers, **Offline Toolkit processes 100% of your data locally within your browser's runtime environment**.

---

## 🔒 Privacy & Security Architecture

- **Zero Data Egress:** Your files never leave your device. Network monitoring verifies zero outgoing file transmissions.
- **Persistent Offline PWA:** Precached via Service Workers (`vite-plugin-pwa` + Workbox). Disconnect your internet or activate Airplane Mode—the entire application continues working seamlessly.
- **Hardware Acceleration:** Employs client-side WebAssembly (WASM), WebGPU, and multithreaded SIMD for native-speed processing directly inside your browser.
- **Ephemeral Memory:** Documents are handled via temporary in-memory `Blob` and `ArrayBuffer` objects and cleared immediately upon session reset.

---

## 🧰 Included Tools & Features

### 📄 PDF Engineering Suite (Powered by `pdf-lib` & `pdf.js`)
| Tool | Description |
| :--- | :--- |
| **Merge PDF** | Combine multiple PDF files into a single unified document in any custom order. |
| **Split PDF** | Split PDF documents by page ranges or extract individual pages into separate files. |
| **Compress PDF** | Reduce PDF file size with adjustable compression levels while preserving clarity. |
| **PDF to Word / Word to PDF** | Convert between PDF and editable DOCX formats completely offline. |
| **PDF to Excel / Excel to PDF** | Extract tabular data into spreadsheets or turn spreadsheets into clean PDF reports. |
| **PDF to JPG / JPG to PDF** | Export PDF pages to high-resolution images or bundle photos into a PDF. |
| **Organize & Rotate Pages** | Reorder, delete, duplicate, and rotate PDF pages with an interactive visual grid. |
| **Page Numbers & Watermark** | Add dynamic page numbering (`Page X of Y`) and custom text/stamp watermarks. |
| **Protect & Unlock PDF** | Encrypt PDFs with robust passwords (AES-256) or unlock authorized documents. |
| **PDF Sign & Form Filler** | Digitally draw, type, or stamp signatures and fill PDF interactive form fields. |
| **True Redaction** | Irreversibly scrub sensitive text and areas from PDF documents. |
| **PDF Visual Diff** | Side-by-side visual and structural comparison between two PDF revisions. |
| **PDF OCR** | Extract selectable text from scanned PDF pages and documents. |

---

### 🎨 Image & Studio Tools (Powered by `@huggingface/transformers`)
| Tool | Description |
| :--- | :--- |
| **AI Background Remover** | In-browser deep learning neural matting (**Bria AI RMBG-1.4 1024px** + MODNet fallback) with 1-click solid/custom color replacement and transparent PNG export. |
| **Passport Photo Maker** | Biometric passport & visa photo generator with automatic face positioning, aspect ratios (**India 35×45mm, US 2×2 in, Canada 50×70mm, Schengen Visa**), official background colors, and printable **4×6 inch multi-copy studio print sheets**. |
| **Custom Size Reducer (KB)** | Compress and resize images to match exact kilobyte limits required by government and exam portals (e.g. `< 50 KB`, `< 100 KB`). |
| **Image Converter & Resizer** | Convert between PNG, JPEG, and WebP; scale dimensions with aspect ratio lock. |
| **Image Compressor** | Intelligent lossy/lossless compression with instant before/after preview. |
| **EXIF Metadata Scrubber** | Inspect and wipe private geolocation (GPS), camera model, and timestamp metadata. |
| **Collage & Meme Maker** | Grid-based photo collage stitcher and caption-ready meme creator. |
| **ASCII Art Generator** | Render photographs into stylized ASCII text art. |

---

### 📝 Documents & Data Converters
- **Word / DOCX Converter:** Convert `.docx` to HTML, Markdown, and plain text.
- **Spreadsheet Converter:** Read and convert `.xlsx` and `.csv` files locally.
- **Markdown & HTML:** Convert Markdown notes to HTML and styled documents.
- **JSON ⟷ YAML Converter:** Bidirectional schema-preserving format conversion.
- **XML ⟷ JSON Converter:** Parse and translate structured XML datasets to JSON.

---

### 🗜️ System & Developer Utilities
- **ZIP Creator & Extractor:** Build ZIP archives or extract contents directly in memory.
- **QR Code Generator & Scanner:** Generate styled QR codes or read QR codes from images/camera.
- **Base64 Encoder / Decoder:** Encode and decode strings, images, and binary data.
- **Cryptographic Hash Checker:** Compute SHA-256, SHA-512, and MD5 file integrity hashes.
- **File Health Check & Magic Bytes:** Inspect binary headers to verify real file extensions.
- **Text Diff Checker & Word Counter:** Line-by-line file diffing, reading time, and word analytics.
- **Regex Tester & Unit Converter:** Interactive regular expression validator and unit conversions.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Himanshusaurabh0411/offline-toolkit.git
   cd offline-toolkit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run automated unit tests:**
   ```bash
   npm test
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
   The optimized production bundle will be output to the `dist/` directory.

---

## 🚢 Deployment

Offline Toolkit is designed as a pure Single-Page Application (SPA) with no server-side dependencies. It can be deployed to any static host:

### Deploy to Vercel
1. Import your GitHub repository to [Vercel](https://vercel.com/new).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. The included `vercel.json` automatically configures client-side SPA routing rewrites.

### Deploy to GitHub Pages or Cloudflare Pages
Run `npm run build` and deploy the generated `dist/` directory directly to your static hosting provider.

---

## 🛠️ Technology Stack

- **UI Framework:** React 19 + TypeScript
- **Bundler & Build Tool:** Vite 6
- **Styling:** Tailwind CSS + Lucide Icons
- **PDF Core:** `pdf-lib`, `pdfjs-dist`
- **Neural Networks & AI:** `@huggingface/transformers` (ONNX Runtime Web WASM / WebGPU)
- **Document Parsers:** `mammoth` (DOCX), `xlsx` (Excel), `turndown`, `marked`
- **Media & Compression:** `exifr`, `qrcode`, `jszip`
- **PWA Runtime:** `vite-plugin-pwa`, Workbox
- **Test Runner:** Vitest

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for personal and commercial projects.
