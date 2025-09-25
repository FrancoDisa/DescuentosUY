import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Automatically cleanup the DOM after each test
afterEach(() => {
  cleanup();
});