import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateCatDTO } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';
import { ForbiddenCustomException } from '../errors/forbidden.exception';
import { HttpExceptionFilter } from '../errors/http-exception.filter';

@UseFilters(HttpExceptionFilter)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Post()
  async create(@Body() createCatDTO: CreateCatDTO) {
    return this.catsService.create(createCatDTO);
  }

  @Get('id')
  async findById() {
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'this will be sent to the user',
      },
      HttpStatus.FORBIDDEN,
      {
        cause: 'message for logging purpuses',
      },
    );
  }

  @Get('error')
  async getError() {
    throw new ForbiddenCustomException();
  }

  @Get('error-request')
  // @UseFilters(HttpExceptionFilter)
  async getErrorRequest() {
    throw new BadRequestException('simple error message', {
      cause: 'message for legger',
      description: 'simple error description',
    });
  }
}
