import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { RelayService } from './relay.service';
import { StreamGateway } from './stream.gateway';

@Module({
  controllers: [StreamController],
  providers: [StreamService, RelayService, StreamGateway],
})
export class StreamModule {}
