import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as unzipper from 'unzipper';
import { Readable } from 'stream';
import { SocketFileGateway } from '../../socket-file/socket-file.gateway';

@Controller('archive')
export class FilesController {
  constructor(private readonly socketGateway: SocketFileGateway) {}

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log('size: ', sizeInMB);
    const fileStream = Readable.from(file.buffer);

    let quantity = 0;

    return new Promise((resolve, reject) => {
      fileStream
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          console.log(entry.vars.uncompressedSize);
          const fileName = entry.path;
          console.log('name: ', fileName);
          // this.socketGateway.emitFileStatus();
          quantity++;
          // Read each file from the zip stream
          const fileContent: any[] = [];
          entry.on('data', (chunk) => {
            console.log('chunk length: ', chunk.length);
            this.socketGateway.emitProcessedBytes(chunk.length);
            fileContent.push(chunk);
          });

          entry.on('end', () => {
            // Apply transformation (Example: convert text to uppercase)
            const transformedContent = Buffer.concat(fileContent)
              .toString()
              .toUpperCase();

            // Do something with the transformed content (For example, send it to another stream)
            const transformedStream = new Readable();
            transformedStream.push(transformedContent);
            transformedStream.push(null);

            // Handle the transformed content here (send to another service, save to DB, etc.)
            transformedStream.on('data', (chunk) => {
              // Do something with the transformed chunk
              // console.log('transformed: ', chunk.toString());
            });
          });
        })
        .on('error', (err) => {
          console.error('Error unzipping file:', err);
          reject('Error in processing file.');
        })
        .on('finish', () => {
          const used = process.memoryUsage().heapUsed / 1024 / 1024;
          console.log(`Memory used: ${Math.round(used * 100) / 100} MB`);
          console.log(`Number of files: ${quantity}`);
          console.log('File unzipped and processed successfully');
          resolve('Process finished!');
        });
    });
  }
}
