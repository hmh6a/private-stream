import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RelayService } from './relay.service';

@Injectable()
export class StreamService implements OnModuleInit {
  constructor(private prisma: PrismaService, private relay: RelayService) {}

  async onModuleInit() {
    const active = await this.prisma.streamSource.findFirst({ where: { isActive: true } });
    if (active && process.env.AUTO_RESUME_STREAM === 'true') {
      try { await this.relay.startRelay(active.sourceUrl); } 
      catch (e) { console.error('Failed auto-resume', e); }
    }
  }

  async getCurrent() {
    return this.prisma.streamSource.findFirst({ where: { isActive: true } });
  }

  async setCurrent(url: string, name?: string) {
    await this.prisma.streamSource.updateMany({ data: { isActive: false } });
    
    let source = await this.prisma.streamSource.findFirst({ where: { sourceUrl: url } });
    if (!source) {
       source = await this.prisma.streamSource.create({ data: { sourceUrl: url, name, isActive: true } });
    } else {
       source = await this.prisma.streamSource.update({
         where: { id: source.id },
         data: { isActive: true, name: name || source.name }
       });
    }

    if (this.relay.status === 'running' || this.relay.status === 'error') {
       this.relay.stopRelay();
       setTimeout(() => this.relay.startRelay(url), 2000);
    }

    return source;
  }
  
  async start() {
    const current = await this.getCurrent();
    if (!current) throw new Error('No stream source configured');
    await this.relay.startRelay(current.sourceUrl);
    return { success: true };
  }

  stop() {
    this.relay.stopRelay();
    return { success: true };
  }

  async restart() {
    const current = await this.getCurrent();
    if (!current) throw new Error('No stream source configured');
    this.relay.stopRelay();
    setTimeout(() => this.relay.startRelay(current.sourceUrl), 2000);
    return { success: true };
  }

  getStatus() { return this.relay.getStatus(); }
  getLogs() { return this.relay.getLogs(); }
}
