import { expect, test } from 'vitest';
import { createFXModule } from 'fx-react';

test('should export functions', () => {
  expect(createFXModule).toBeDefined();
});
