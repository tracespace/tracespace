import type {TestingLibraryMatchers} from '@testing-library/jest-dom/matchers'

interface CustomMatchers<R = unknown>
  extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}
