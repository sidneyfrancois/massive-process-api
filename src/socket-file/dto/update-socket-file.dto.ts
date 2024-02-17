import { PartialType } from '@nestjs/mapped-types';
import { CreateSocketFileDto } from './create-socket-file.dto';

export class UpdateSocketFileDto extends PartialType(CreateSocketFileDto) {
  id: number;
}
