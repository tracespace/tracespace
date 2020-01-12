interface Array<T> {
  includes(searchElement: unknown, fromIndex?: number): boolean
}

interface WindowOrWorkerGlobalScope {
  clearInterval(handle?: number | null): void
  clearTimeout(handle?: number | null): void
}
