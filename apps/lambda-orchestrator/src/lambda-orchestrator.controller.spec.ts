import { Test, TestingModule } from '@nestjs/testing';
import { OrchestController } from './lambda-orchestrator.controller';
import { OrchestService } from './lambda-orchestrator.service';

describe('OrchestController', () => {
  let orchestController: OrchestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrchestController],
      providers: [OrchestService],
    }).compile();

    orchestController = app.get<OrchestController>(OrchestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(orchestController.getHello()).toBe('Hello World!');
    });
  });
});
