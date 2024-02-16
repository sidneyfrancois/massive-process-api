import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as unzipper from 'unzipper';
import { Readable, Transform } from 'stream';

const toBuffer = new Transform({
  objectMode: true,
  async transform(entry, encoding, callback) {
    console.log(entry.path);
    console.log(
      `Chunk size: ${Math.round(entry.vars.uncompressedSize) / 1000} MB`,
    );
    entry.autodrain();
    callback(null, await entry.buffer());
  },
});

const printRawData = new Transform({
  objectMode: true,
  transform(data, enconding, callback) {
    callback();
  },
});

@Controller('archive')
export class FilesController {
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileStream = Readable.from(file.buffer);

    let quantity = 0;

    fileStream
      .pipe(unzipper.Parse())
      .on('entry', () => {
        quantity++;
      })
      .pipe(toBuffer)
      .pipe(printRawData)
      .on('finish', () => {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`Memory used: ${Math.round(used * 100) / 100} MB`);
        console.log(`Number of files: ${quantity}`);
      });
  }
}
