import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { StreamService } from './stream.service';

@Controller('archive')
export class FilesController {
  constructor(private readonly streamService: StreamService) {}

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async processExcel(@UploadedFile() file: Express.Multer.File) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`size: ${sizeInMB} MB`);

    const fileStream = Readable.from(file.buffer);

    return await this.streamService.processExcel(fileStream);
  }

  @Post('upload-zip-xml')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`size: ${sizeInMB} MB`);

    const fileStream = Readable.from(file.buffer);
    return await this.streamService.processZipXML(fileStream);
  }
}
