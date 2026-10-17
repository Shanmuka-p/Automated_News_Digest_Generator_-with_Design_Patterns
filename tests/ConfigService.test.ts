import { ConfigService } from '../src/config/ConfigService';

describe('ConfigService Singleton Pattern', () => {
  beforeEach(() => {
    ConfigService.resetInstance();
  });

  afterAll(() => {
    ConfigService.resetInstance();
  });

  test('getInstance() returns the exact same object instance on consecutive calls', () => {
    const instanceA = ConfigService.getInstance();
    const instanceB = ConfigService.getInstance();

    // Strict reference equality check required by Requirement 5
    expect(instanceA).toBe(instanceB);
    expect(ConfigService.getInstance()).toBe(ConfigService.getInstance());
  });

  test('correctly provides configuration values via getters', () => {
    const config = ConfigService.getInstance();

    expect(typeof config.getApiKey()).toBe('string');
    expect(Array.isArray(config.getCategories())).toBe(true);
    expect(config.getCategories().length).toBe(5);
    expect(config.getOutputFile()).toMatch(/output[/\\]digest\.html/);
  });

  test('categories returned cannot mutate internal state', () => {
    const config = ConfigService.getInstance();
    const categories = config.getCategories();
    categories.push('extra_category');

    expect(config.getCategories().length).toBe(5);
  });
});
