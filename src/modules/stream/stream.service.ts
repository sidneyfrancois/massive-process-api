import { Injectable } from '@nestjs/common';
import { SocketFileGateway } from 'src/socket-file/socket-file.gateway';
import { Readable, Writable } from 'stream';
import * as unzipper from 'unzipper';
import createExcelWorkbookStream from 'excel-row-stream';
import { pipeline } from 'stream/promises';
import * as ExcelRowStream from 'excel-row-stream';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class StreamService {
  private quantity: number;
  private invoicesIds: string[];
  private canceledIds: string[];
  private invoicesTotal: number;
  private canceledDetected: number;

  constructor(private readonly socketGateway: SocketFileGateway) {
    this.quantity = 0;
    this.canceledIds = [];
    this.invoicesIds = [];
    this.invoicesTotal = 0;
    this.canceledDetected = 0;
  }

  parseXml2Json = (xmlData: string): any => {
    try {
      const options = {
        numberParseOptions: {
          leadingZeros: true,
          hex: true,
          skipLike: /\+[0-9]{10}/,
        },
        ignoreAttributes: false,
        tagValueProcessor: (tagName, tagValue, jPath) => {
          if (jPath.includes('chNFe')) return JSON.stringify(tagValue);
          return tagValue;
        },
      };

      const parser = new XMLParser(options);
      return parser.parse(xmlData);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  processZipXML(fileStream: Readable): Promise<void> {
    return new Promise((resolve, reject) => {
      fileStream
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          const fileName = entry.path;
          this.quantity++;
          const fileContent: any[] = [];
          entry.on('data', (chunk) => {
            this.socketGateway.emitProcessedBytes({
              bytesProcessed: chunk.length,
              fileName: fileName,
            });
            fileContent.push(chunk);
          });

          entry.on('end', () => {
            const transformedContent = Buffer.concat(fileContent);

            const convertedToJSON = this.parseXml2Json(
              transformedContent.toString('utf-8').trim(),
            );

            if (transformedContent.includes('</procEventoNFe>')) {
              const canceledKey =
                convertedToJSON.procEventoNFe.evento.infEvento.chNFe.replace(
                  /"/g,
                  '',
                );

              // Remove canceled duplicates
              if (this.canceledIds.includes(canceledKey)) return;

              this.canceledIds.push(canceledKey);
              this.canceledDetected++;
            }

            if (transformedContent.includes('</nfeProc>')) {
              const key = convertedToJSON.nfeProc.protNFe.infProt.chNFe.replace(
                /"/g,
                '',
              );

              // Remove ivoice duplicates
              if (this.invoicesIds.includes(key)) return;

              // Remove invoices that have canceled event inside one of the zips
              if (this.canceledIds.includes(key)) return;

              this.invoicesIds.push(key);
              this.invoicesTotal++;
            }
          });
        })
        .on('error', (err) => {
          console.error('Error unzipping file:', err);
          reject('Error in processing file.');
        })
        .on('finish', () => {
          resolve();
        });
    });
  }

  printValue = (row: any, _encoding, callback) => {
    const converted = JSON.stringify(row.columns);
    console.log(converted);
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
