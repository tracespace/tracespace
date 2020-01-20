'use strict'

export function flatMap<T, R>(
  collection: readonly T[],
  iterator: (element: T) => R[]
): R[] {
  return collection.reduce<R[]>((result, element) => {
    return result.concat(iterator(element))
  }, [])
}
