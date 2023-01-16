import {expect} from 'vitest'
import testingLibraryMatchers from '@testing-library/jest-dom/matchers'

expect.extend(testingLibraryMatchers)

expect.extend({
  approx(received: unknown, expected: number) {
    const difference =
      typeof received === 'number'
        ? Math.abs(received - expected)
        : Number.POSITIVE_INFINITY

    return {
      message: () =>
        `expected ${String(received)} to be approximately ${expected}`,
      pass: difference < 1e-12,
    }
  },
})
