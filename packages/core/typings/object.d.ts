export {}

declare global {
  interface ObjectConstructor {
    create<T>(o: T): T
  }
}
