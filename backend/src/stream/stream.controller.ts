import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { StreamService } from './stream.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('current')
  @UseGuards(JwtAuthGuard)
  getCurrent() { return this.streamService.getCurrent(); }

  @Put('current')
  @UseGuards(JwtAuthGuard)
  async setCurrent(@Body() body: { url: string; name?: string }) {
    if(!body.url) throw new Error('URL is required');
    return await this.streamService.setCurrent(body.url, body.name);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  start() { return this.streamService.start(); }

  @Post('stop')
  @UseGuards(JwtAuthGuard)
  stop() { return this.streamService.stop(); }

  @Post('restart')
  @UseGuards(JwtAuthGuard)
  restart() { return this.streamService.restart(); }

  @Get('status')
  getStatus() { return this.streamService.getStatus(); }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  getLogs() { return this.streamService.getLogs(); }
}
