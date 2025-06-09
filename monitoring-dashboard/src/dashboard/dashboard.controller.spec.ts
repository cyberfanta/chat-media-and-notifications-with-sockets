import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  describe('getDashboard', () => {
    it('should return dashboard template data', async () => {
      const result = await controller.getDashboard();

      expect(typeof result).toBe('object');
      expect(result).toEqual({ title: 'Monitoring Dashboard' });
    });

    it('should return correct title', async () => {
      const result = await controller.getDashboard();

      expect(result.title).toBe('Monitoring Dashboard');
    });
  });

  describe('redirectToDashboard', () => {
    it('should return redirect HTML', async () => {
      const result = await controller.redirectToDashboard();

      expect(typeof result).toBe('string');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<title>Monitoring Dashboard</title>');
      expect(result).toContain('Redirigiendo al');
      expect(result).toContain('/dashboard');
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 