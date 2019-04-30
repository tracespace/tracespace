// utility functions
import {basename, extname} from 'path'

export type PromiseArray<U> = Promise<Array<U>>

export function promiseFlatMap<In, Out>(
  collection: ReadonlyArray<In>,
  iterator: (element: In) => Array<Out> | PromiseArray<Out>
): PromiseArray<Out> {
  return collection.reduce(
    (result: PromiseArray<Out>, element: In): PromiseArray<Out> =>
      result.then(resolvedResult =>
        Promise.resolve(iterator(element)).then(newItems =>
          resolvedResult.concat(newItems)
        )
      ),
    Promise.resolve([])
  )
}

export function baseName(filename: string, stripExtension?: boolean): string {
  return basename(filename, stripExtension ? extname(filename) : '')
}
