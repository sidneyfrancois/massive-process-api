import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenCustomException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
