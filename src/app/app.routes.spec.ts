import { defaultCalculator } from './app.routes';
import {
  WORLD_KEY_1800,
  WORLD_KEY_117,
} from './services/local-storage/world-keys';

describe('defaultCalculator (where /calculator and unknown addresses lead)', () => {
  beforeEach(() => localStorage.clear());

  it('is the Anno 117 calculator for a new visitor', () => {
    expect(defaultCalculator()).toBe('anno-117-calculator');
  });

  it('is the Anno 1800 calculator for someone who has only a saved Anno 1800 world', () => {
    localStorage.setItem(WORLD_KEY_1800, '{}');
    expect(defaultCalculator()).toBe('anno-1800-calculator');
  });

  it('is the Anno 117 calculator once there is a saved Anno 117 world', () => {
    localStorage.setItem(WORLD_KEY_1800, '{}');
    localStorage.setItem(WORLD_KEY_117, '{}');
    expect(defaultCalculator()).toBe('anno-117-calculator');
  });

  it('is the Anno 117 calculator for someone with only an Anno 117 world', () => {
    localStorage.setItem(WORLD_KEY_117, '{}');
    expect(defaultCalculator()).toBe('anno-117-calculator');
  });
});
