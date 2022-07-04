export {}

declare global {
  namespace Vi {
    interface ExpectStatic {
      approx(expected: number): any
    }
  }
}
