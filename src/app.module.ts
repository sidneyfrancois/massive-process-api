import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './modules/cat/cats.module';
import { FilesModule } from './modules/stream/stream.module';
import { SocketFileModule } from './socket-file/socket-file.module';

@Module({
  imports: [CatsModule, FilesModule, SocketFileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
