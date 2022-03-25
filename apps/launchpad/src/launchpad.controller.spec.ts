import { Test, TestingModule } from '@nestjs/testing';
import { LaunchpadController } from './launchpad.controller';
import { LaunchpadService } from './launchpad.service';

describe('LaunchpadController', () => {
  let launchpadController: LaunchpadController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LaunchpadController],
      providers: [LaunchpadService],
    }).compile();

    launchpadController = app.get<LaunchpadController>(LaunchpadController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(launchpadController.getHello()).toBe('Hello World!');
    });
  });
});
