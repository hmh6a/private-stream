import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { StreamService } from './stream.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stream')
@UseGuards(JwtAuthGuard)
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('current')
  getCurrent() { return this.streamService.getCurrent(); }

  @Put('current')
  setCurrent(@Body() body: { url: string; name?: string }) {
    if(!body.url) throw new Error('URL is required');
    return this.streamService.setCurrent(body.url, body.name);
  }

  @Post('start')
  start() { return this.streamService.start(); }

  @Post('stop')
  stop() { return this.streamService.stop(); }

  @Post('restart')
  restart() { return this.streamService.restart(); }

  @Get('status')
  getStatus() { return this.streamService.getStatus(); }

  @Get('logs')
  getLogs() { return this.streamService.getLogs(); }
}
