import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketFileService } from './socket-file.service';
import { CreateSocketFileDto } from './dto/create-socket-file.dto';
import { UpdateSocketFileDto } from './dto/update-socket-file.dto';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketFileGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly socketFileService: SocketFileService) {}

  disconnect() {
    this.server.disconnectSockets();
  }

  emitFileStatus(status: string) {
    this.server.emit('file-upload', status);
  }

  @SubscribeMessage('createSocketFile')
  create(@MessageBody() createSocketFileDto: CreateSocketFileDto) {
    return this.socketFileService.create(createSocketFileDto);
  }

  @SubscribeMessage('findAllSocketFile')
  findAll() {
    return this.socketFileService.findAll();
  }

  @SubscribeMessage('findOneSocketFile')
  findOne(@MessageBody() id: number) {
    return this.socketFileService.findOne(id);
  }

  @SubscribeMessage('updateSocketFile')
  update(@MessageBody() updateSocketFileDto: UpdateSocketFileDto) {
    return this.socketFileService.update(
      updateSocketFileDto.id,
      updateSocketFileDto,
    );
  }

  @SubscribeMessage('removeSocketFile')
  remove(@MessageBody() id: number) {
    return this.socketFileService.remove(id);
  }
}
