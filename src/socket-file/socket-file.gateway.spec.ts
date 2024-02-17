import { Test, TestingModule } from '@nestjs/testing';
import { SocketFileGateway } from './socket-file.gateway';
import { SocketFileService } from './socket-file.service';

describe('SocketFileGateway', () => {
  let gateway: SocketFileGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketFileGateway, SocketFileService],
    }).compile();

    gateway = module.get<SocketFileGateway>(SocketFileGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
