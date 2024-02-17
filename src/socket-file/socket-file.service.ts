import { Injectable } from '@nestjs/common';
import { CreateSocketFileDto } from './dto/create-socket-file.dto';
import { UpdateSocketFileDto } from './dto/update-socket-file.dto';

@Injectable()
export class SocketFileService {
  create(createSocketFileDto: CreateSocketFileDto) {
    return 'This action adds a new socketFile';
  }

  findAll() {
    return `This action returns all socketFile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} socketFile`;
  }

  update(id: number, updateSocketFileDto: UpdateSocketFileDto) {
    return `This action updates a #${id} socketFile`;
  }

  remove(id: number) {
    return `This action removes a #${id} socketFile`;
  }
}
