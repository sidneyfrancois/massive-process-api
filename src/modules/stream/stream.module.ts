import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FilesController } from './stream.controller';
import { ZipUploadMiddleware } from './middleware/upload.middleware';
import { SocketFileModule } from '../../socket-file/socket-file.module';

@Module({
  imports: [SocketFileModule],
  controllers: [FilesController],
})
export class FilesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ZipUploadMiddleware).forRoutes('archive/upload-file');
  }
}
