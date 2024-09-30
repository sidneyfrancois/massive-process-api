import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { StreamService } from './stream.service';
import { Request, Response } from 'express';
import * as Busboy from 'busboy';

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
    const promises: Promise<any>[] = []; // Array to hold promises for each file

    busboy.on('file', async (fieldName, fileStream, fileInfo) => {
      const { mimeType, ..._ } = fileInfo;
      // Only Process Zip files
      if (
        mimeType !== 'application/x-zip-compressed' &&
        mimeType !== 'application/zip'
      ) {
        fileStream.resume();
        return;
      }

      const promise = this.streamService
        .processZipXML(fileStream)
        .catch((error) => {
          console.error('Error processing file:', error);
        });
      promises.push(promise);
    });

    busboy.on('close', async () => {
      await Promise.all(promises);
      console.log('All zips files processed!');
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`Total memory used: ${Math.round(used * 100) / 100} MB`);
      res.end();
    });

    req.pipe(busboy);
  }

  @Post('multer/upload-zip')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`size: ${sizeInMB} MB`);

    const fileStream = Readable.from(file.buffer);
    return await this.streamService.processZipXML(fileStream);
  }
}
