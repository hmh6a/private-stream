import { Injectable, Logger } from '@nestjs/common';
import { RelayService } from './relay.service';
import axios from 'axios';

@Injectable()
export class StreamService {
  private logger = new Logger(StreamService.name);
  private inMemorySourceUrl: string | null = null;
  private inMemoryName: string | null = null;

  constructor(private relay: RelayService) {}

  getCurrent() {
    if (!this.inMemorySourceUrl) return null;
    return { sourceUrl: this.inMemorySourceUrl, name: this.inMemoryName, isActive: true };
  }

  async setCurrent(url: string, name?: string) {
    this.logger.log(`Setting current stream URL: ${url}`);
    
    let sanitizedUrl = url;
    
    // Support blob: prefix stripping
    if (sanitizedUrl.startsWith('blob:')) {
      sanitizedUrl = sanitizedUrl.substring(5);
    }

    // Support extraction from HTML pages (like the S3 ones)
    if (sanitizedUrl.includes('.html') || sanitizedUrl.includes('s3.us-east-1.amazonaws.com')) {
      try {
        const response = await axios.get(sanitizedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 5000
        });
        
        const html = response.data;
        if (typeof html === 'string') {
          const m3u8Matches = html.match(/https?:\/\/[^"'\s]+\.m3u8/g);
          if (m3u8Matches && m3u8Matches.length > 0) {
            // Prioritize higher quality if identified by path patterns (e.g. /0/ is often 720p in these S3 setups)
            const bestMatch = m3u8Matches.find(m => m.includes('/0/')) || m3u8Matches[0];
            this.logger.log(`Extracted m3u8 URL: ${bestMatch}`);
            sanitizedUrl = bestMatch;
          }
        }
      } catch (e) {
        this.logger.error(`Failed to extract URL from HTML: ${e.message}`);
      }
    }

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
