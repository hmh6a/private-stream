import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { StreamGateway } from './stream.gateway';
import * as fs from 'fs';
import * as path from 'path';

export type RelayStatus = 'idle' | 'starting' | 'running' | 'stopped' | 'error';

@Injectable()
export class RelayService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(RelayService.name);
  private ffmpegProcess: ChildProcess | null = null;
  
  public status: RelayStatus = 'idle';
  public lastError: string | null = null;
  public logs: string[] = [];
  public currentSourceUrl: string | null = null;

  constructor(private readonly gateway: StreamGateway) {}

  onModuleInit() {
    const dir = process.env.HLS_OUTPUT_DIR || '/data/hls';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  onModuleDestroy() {
    this.stopRelay();
  }

  private emitState() {
    this.gateway.broadcast('relayState', {
      status: this.status,
      lastError: this.lastError,
      sourceUrl: this.currentSourceUrl
    });
  }

  private addLog(msg: string) {
    const time = new Date().toISOString();
    const line = `[${time}] ${msg}`;
    this.logs.push(line);
    if (this.logs.length > 200) this.logs.shift();
    this.gateway.broadcast('relayLog', line);
  }

  public async startRelay(sourceUrl: string) {
    if (this.status === 'running' || this.status === 'starting') {
      throw new Error('Relay is already active.');
    }

    this.currentSourceUrl = sourceUrl;
    this.status = 'starting';
    this.lastError = null;
    this.emitState();
    this.addLog(`Starting relay for authorized source...`);

    const hlsDir = process.env.HLS_OUTPUT_DIR || '/data/hls';
    const indexPath = path.join(hlsDir, 'index.m3u8');
    
    if (fs.existsSync(hlsDir)) {
      fs.readdirSync(hlsDir).forEach(file => {
        if (file.endsWith('.ts') || file.endsWith('.m3u8')) {
          fs.unlinkSync(path.join(hlsDir, file));
        }
      });
    }

    const args = [
      '-y',
      '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n',
      '-reconnect', '1',
      '-reconnect_at_eof', '1',
      '-reconnect_streamed', '1',
      '-reconnect_on_network_error', '1',
      '-reconnect_on_http_error', '4xx,5xx',
      '-reconnect_delay_max', '5',
      '-rw_timeout', '10000000',
      '-probesize', '10M',
      '-analyzeduration', '10M',
      '-i', sourceUrl,
      '-c', 'copy',
      '-map', '0',
      '-ignore_unknown',
      '-f', 'hls',
      '-hls_time', '4',
      '-hls_list_size', '5',
      '-hls_flags', 'delete_segments',
      indexPath
    ];

    this.ffmpegProcess = spawn('ffmpeg', args);
    this.status = 'running';
    this.emitState();

    let errBuffer = '';
    this.ffmpegProcess.stderr.on('data', (data) => {
      errBuffer += data.toString();
      const lines = errBuffer.split('\n');
      errBuffer = lines.pop() || '';
      lines.forEach(l => { if(l.trim()) this.addLog(l.trim()); });
    });

    this.ffmpegProcess.on('close', (code) => {
      this.addLog(`FFmpeg exited with code ${code}`);
      this.ffmpegProcess = null;
      if (this.status !== 'stopped') {
        this.status = code === 0 ? 'idle' : 'error';
        if (code !== 0) this.lastError = `Process exited unexpectedly (code ${code})`;
      }
      this.emitState();
    });
  }

  public stopRelay() {
    if (this.ffmpegProcess) {
      this.addLog('Stopping relay...');
      this.status = 'stopped';
      this.emitState();
      this.ffmpegProcess.kill('SIGINT');
    }
  }

  public getStatus() {
    return { status: this.status, lastError: this.lastError, sourceUrl: this.currentSourceUrl };
  }

  public getLogs() {
    return this.logs;
  }
}
