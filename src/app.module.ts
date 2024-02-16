import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './modules/cat/cats.module';
import { FilesModule } from './modules/stream/stream.module';

@Module({
  imports: [CatsModule, FilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
