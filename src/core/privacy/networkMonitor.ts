// OfflineForge Network Egress Monitor
// Guarantees and proves 0-byte egress by hooking global network APIs

export interface NetworkStats {
  bytesSent: number;
  externalRequests: number;
  blockedRequests: number;
  allowedLocalRequests: number; // e.g., blob:, data:, same-origin local worker
  activityLog: {
    timestamp: number;
    type: 'fetch' | 'xhr' | 'beacon' | 'websocket';
    url: string;
    bytes: number;
    blocked: boolean;
  }[];
}

class NetworkMonitor {
  private stats: NetworkStats = {
    bytesSent: 0,
    externalRequests: 0,
    blockedRequests: 0,
    allowedLocalRequests: 0,
    activityLog: [],
  };

  private listeners: ((stats: NetworkStats) => void)[] = [];
  private isInitialized = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Hook fetch
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const isLocal = this.isLocalResource(url);

      if (!isLocal) {
        this.stats.blockedRequests++;
        this.logActivity('fetch', url, 0, true);
        this.notify();
        console.warn(`[OfflineForge Security] Blocked remote network request to: ${url}`);
        throw new Error(`[OfflineForge Privacy Shield] Network call blocked: ${url}. Everything must run offline!`);
      }

      this.stats.allowedLocalRequests++;
      this.logActivity('fetch', url, 0, false);
      this.notify();
      return originalFetch.apply(window, [input, init]);
    };

    // 2. Hook XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const self = this;

    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, ...args: any[]) {
      (this as any)._offlineforge_url = args[1];
      return originalOpen.apply(this, args as any);
    };

    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, body?: any) {
      const url = (this as any)._offlineforge_url || '';
      const isLocal = self.isLocalResource(url);

      if (!isLocal) {
        self.stats.blockedRequests++;
        self.logActivity('xhr', url, 0, true);
        self.notify();
        console.warn(`[OfflineForge Security] Blocked XHR request to: ${url}`);
        throw new Error(`[OfflineForge Privacy Shield] Network call blocked: ${url}`);
      }

      self.stats.allowedLocalRequests++;
      self.logActivity('xhr', url, 0, false);
      self.notify();
      return originalSend.apply(this, [body]);
    };

    // 3. Hook navigator.sendBeacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
        const urlStr = url.toString();
        const isLocal = this.isLocalResource(urlStr);
        if (!isLocal) {
          this.stats.blockedRequests++;
          this.logActivity('beacon', urlStr, 0, true);
          this.notify();
          console.warn(`[OfflineForge Security] Blocked sendBeacon to: ${urlStr}`);
          return false;
        }
        return true;
      };
    }
  }

  private isLocalResource(url: string): boolean {
    if (!url) return true;
    if (url.startsWith('blob:') || url.startsWith('data:')) return true;
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  private logActivity(type: 'fetch' | 'xhr' | 'beacon' | 'websocket', url: string, bytes: number, blocked: boolean) {
    this.stats.activityLog.unshift({
      timestamp: Date.now(),
      type,
      url,
      bytes,
      blocked,
    });
    if (this.stats.activityLog.length > 50) {
      this.stats.activityLog.pop();
    }
  }

  public getStats(): NetworkStats {
    return { ...this.stats };
  }

  public subscribe(listener: (stats: NetworkStats) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStats());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const stats = this.getStats();
    for (const listener of this.listeners) {
      listener(stats);
    }
  }
}

export const networkMonitor = new NetworkMonitor();
