import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [PrismaModule, AuthModule, StreamModule],
})
export class AppModule {}
