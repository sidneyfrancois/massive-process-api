import { Injectable, PipeTransform } from '@nestjs/common';
import { createWriteStream } from 'fs';

@Injectable()
export class FileProcessingPipe implements PipeTransform {
  async transform(fileStream: NodeJS.ReadableStream) {
    // Example: Write the file stream to a new file
    const outputStream = createWriteStream('outputFile.txt');
    fileStream.pipe(outputStream);
    return new Promise((resolve, reject) => {
      outputStream.on('finish', () => resolve(true));
      outputStream.on('error', reject);
    });
  }
}
