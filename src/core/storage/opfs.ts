// Origin Private File System (OPFS) utility for high-throughput client-side file streaming

export class OPFSStorage {
  private static isAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage;
  }

  public static async writeChunkedFile(filename: string, streamOrBlob: Blob | Uint8Array): Promise<string> {
    if (!this.isAvailable()) {
      // Fallback
      return filename;
    }

    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(filename, { create: true });
      // @ts-ignore
      const writable = await fileHandle.createWritable();
      await writable.write(streamOrBlob as any);
      await writable.close();
      return filename;
    } catch (e) {
      console.warn('OPFS write failed, falling back', e);
      return filename;
    }
  }

  public static async readFile(filename: string): Promise<File | null> {
    if (!this.isAvailable()) return null;
    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(filename);
      return await fileHandle.getFile();
    } catch (e) {
      return null;
    }
  }

  public static async deleteFile(filename: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const root = await navigator.storage.getDirectory();
      await root.removeEntry(filename);
      return true;
    } catch {
      return false;
    }
  }
}
