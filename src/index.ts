import { setFailed } from '@actions/core';

import { action } from './action.js';

try {
  await action();
} catch (error) {
  setFailed(error as Error);
}
