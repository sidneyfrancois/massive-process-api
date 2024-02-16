import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
// import * as unzipper from 'unzipper';
// import fs from 'fs';

@Injectable()
export class ZipUploadMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      return next();
    }

    console.log(req.file);

    next();
  }
}
