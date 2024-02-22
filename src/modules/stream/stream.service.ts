import { Injectable } from '@nestjs/common';
import { SocketFileGateway } from 'src/socket-file/socket-file.gateway';
import { Readable, Writable } from 'stream';
import * as unzipper from 'unzipper';
import createExcelWorkbookStream from 'excel-row-stream';
import { pipeline } from 'stream/promises';
import * as ExcelRowStream from 'excel-row-stream';
import { ExcelReader, ExcelWriter } from 'node-excel-stream';

@Injectable()
export class StreamService {
  private quantity;
  constructor(private readonly socketGateway: SocketFileGateway) {
    this.quantity = 0;
  }

  processZipXML(fileStream: Readable) {
    return new Promise((resolve, reject) => {
      fileStream
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          // console.log(entry.vars.uncompressedSize);
          const fileName = entry.path;
          // console.log('name: ', fileName);
          // this.socketGateway.emitFileStatus();
          this.quantity++;
          // Read each file from the zip stream
          const fileContent: any[] = [];
          entry.on('data', (chunk) => {
            // console.log('chunk length: ', chunk.length);
            this.socketGateway.emitProcessedBytes({
              bytesProcessed: chunk.length,
              fileName: fileName,
            });
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
            // transformedStream.on('data', (chunk) => {
            // Do something with the transformed chunk
            // console.log('transformed: ', chunk.toString());
            // });
          });
        })
        .on('error', (err) => {
          console.error('Error unzipping file:', err);
          reject('Error in processing file.');
        })
        .on('finish', () => {
          const used = process.memoryUsage().heapUsed / 1024 / 1024;
          console.log(`Memory used: ${Math.round(used * 100) / 100} MB`);
          console.log(`Number of files: ${this.quantity}`);
          console.log('File unzipped and processed successfully');
          resolve({
            memoryUsed: Math.round(used * 100) / 100,
            numberOfFiles: this.quantity,
          });
        });
    });
  }

  printValue = (row: any, _encoding, callback) => {
    this.quantity++;
    callback();
  };

  async processExcel(fileStream: Readable) {
    const workbookStream = createExcelWorkbookStream({
      matchSheet: /Planilha1/i,
      dropEmptyRows: true,
    });

    const withColumnsStream = ExcelRowStream.createRowToRowWithColumnsStream({
      sanitizeColumnName: (columnName) => {
        return columnName.toLowerCase().replace(/\W/g, '_');
      },
    });

    const resultStream = new Writable({
      objectMode: true,
      write: this.printValue,
    });

    await pipeline(fileStream, workbookStream, withColumnsStream, resultStream);
    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    return {
      memoryUsed: Math.round(used * 100) / 100,
      numberOfFiles: this.quantity,
    };
  }
}
