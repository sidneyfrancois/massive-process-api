import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateCatDTO } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

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
}
