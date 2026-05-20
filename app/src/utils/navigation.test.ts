/**
 * @jest-environment node
 */
import { navigateTo } from './navigation';

describe('navigation utility', () => {
  it('should not throw and do nothing when window is undefined (SSR environment)', () => {
    expect(() => navigateTo('/test-path')).not.toThrow();
  });
});
