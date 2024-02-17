import { Test, TestingModule } from '@nestjs/testing';
import { SocketFileService } from './socket-file.service';

describe('SocketFileService', () => {
  let service: SocketFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketFileService],
    }).compile();

    service = module.get<SocketFileService>(SocketFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
