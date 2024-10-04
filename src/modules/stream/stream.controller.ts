import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { StreamService } from './stream.service';
import { Request, Response } from 'express';
import * as Busboy from 'busboy';
import * as unzipper from 'unzipper';

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

  @Post('stream/upload-zip')
  async uploadFileV2(@Req() req: Request, @Res() res: Response) {
    const busboy = Busboy({ headers: req.headers });
    busboy.on('file', async (fieldName, fileStream, fileInfo) => {
      const { filename, mimeType, ..._ } = fileInfo;
      if (
        mimeType !== 'application/x-zip-compressed' &&
        mimeType !== 'application/zip'
      ) {
        fileStream.resume();
        return;
      }
      console.log('zip name: ', filename);
      fileStream.pipe(unzipper.Parse()).on('entry', function (entry) {
        const fileName = entry.path;
        console.log('xml:', fileName);
        entry.autodrain();
      });
    });

    busboy.on('close', async () => {
      console.log('All zips files processed!');
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`Total memory used: ${Math.round(used * 100) / 100} MB`);
      res.end();
    });

    req.pipe(busboy);
  }

  @Post('multer/upload-zip')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    for (const file of files) {
      let xmlCount = 0;
      const fileStream = Readable.from(file.buffer);

      fileStream.pipe(unzipper.Parse()).on('entry', function (entry) {
        const fileName = entry.path;
        console.log('xml:', fileName);
        xmlCount++;
        entry.autodrain();
      });
      console.log('total xml:', xmlCount);
    }
  }
}
