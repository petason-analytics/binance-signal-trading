import { Test, TestingModule } from '@nestjs/testing';
import { NewPairFrontrunController } from './new-pair-frontrun.controller';
import { NewPairFrontrunService } from './new-pair-frontrun.service';

describe('NewPairFrontrunController', () => {
  let newPairFrontrunController: NewPairFrontrunController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NewPairFrontrunController],
      providers: [NewPairFrontrunService],
    }).compile();

    newPairFrontrunController = app.get<NewPairFrontrunController>(NewPairFrontrunController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(newPairFrontrunController.getHello()).toBe('Hello World!');
    });
  });
});
