import { Module } from '@nestjs/common';
import { SocketFileService } from './socket-file.service';
import { SocketFileGateway } from './socket-file.gateway';

@Module({
  providers: [SocketFileGateway, SocketFileService],
  exports: [SocketFileGateway],
})
export class SocketFileModule {}
