import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { LoggerMiddleware } from '../middlewares/logger.middleware';
import { logger } from '../middlewares/logger.function.middleware';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})

// Different middleware for GET and POST
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
    consumer
      .apply(logger)
      .forRoutes({ path: 'cats', method: RequestMethod.POST });
  }
}
