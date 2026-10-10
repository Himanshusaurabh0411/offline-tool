import { ToolCategory, ToolPlugin } from './types';

class PluginRegistry {
  private plugins = new Map<string, ToolPlugin>();

  public register(plugin: ToolPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with id "${plugin.id}" is already registered. Overwriting.`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  public registerAll(pluginList: ToolPlugin[]): void {
    for (const plugin of pluginList) {
      this.register(plugin);
    }
  }

  public get(id: string): ToolPlugin | undefined {
    return this.plugins.get(id);
  }

  public getAll(): ToolPlugin[] {
    return Array.from(this.plugins.values());
  }

  public getByCategory(category: ToolCategory): ToolPlugin[] {
    return this.getAll().filter(p => p.category === category);
  }

  public search(query: string): ToolPlugin[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.acceptedExtensions.some(ext => ext.toLowerCase().includes(q))
    );
  }

  public getCompatibleTools(fileName: string, mimeType: string): ToolPlugin[] {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return this.getAll().filter(plugin => {
      const matchExt = plugin.acceptedExtensions.includes('*') || plugin.acceptedExtensions.includes(ext);
      const matchMime = plugin.acceptedMimeTypes.includes('*/*') || plugin.acceptedMimeTypes.includes(mimeType);
      return matchExt || matchMime;
    });
  }
}

export const pluginRegistry = new PluginRegistry();
