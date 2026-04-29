import { Injectable } from '@nestjs/common';
import { RelayService } from './relay.service';

@Injectable()
export class StreamService {
  private inMemorySourceUrl: string | null = null;
  private inMemoryName: string | null = null;

  constructor(private relay: RelayService) {}

  getCurrent() {
    if (!this.inMemorySourceUrl) return null;
    return { sourceUrl: this.inMemorySourceUrl, name: this.inMemoryName, isActive: true };
  }

  setCurrent(url: string, name?: string) {
    // Strip blob: prefix if present
    const sanitizedUrl = url.startsWith('blob:') ? url.substring(5) : url;
    this.inMemorySourceUrl = sanitizedUrl;
    this.inMemoryName = name || 'Stream';

    if (this.relay.status === 'running' || this.relay.status === 'error') {
       this.relay.stopRelay();
       setTimeout(() => this.relay.startRelay(sanitizedUrl), 2000);
    }

    return this.getCurrent();
  }
  
  start() {
    if (!this.inMemorySourceUrl) throw new Error('No active stream source configured. Please input one first.');
    this.relay.startRelay(this.inMemorySourceUrl);
    return { success: true };
  }

  stop() {
    this.relay.stopRelay();
    return { success: true };
  }

  restart() {
    if (!this.inMemorySourceUrl) throw new Error('No stream source configured');
    this.relay.stopRelay();
    setTimeout(() => this.relay.startRelay(this.inMemorySourceUrl!), 2000);
    return { success: true };
  }

  getStatus() {
    return this.relay.getStatus();
  }

  getLogs() {
    return this.relay.getLogs();
  }
}
