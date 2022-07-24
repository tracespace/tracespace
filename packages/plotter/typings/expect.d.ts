export {}

interface CustomMatchers<R = unknown> {
  approx(expected: number): R
}

declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}
