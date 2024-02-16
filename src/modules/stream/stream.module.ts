import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FilesController } from './stream.controller';
import { ZipUploadMiddleware } from './middleware/upload.middleware';

@Module({
  controllers: [FilesController],
})
export class FilesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ZipUploadMiddleware).forRoutes('archive/upload-file');
  }
}
