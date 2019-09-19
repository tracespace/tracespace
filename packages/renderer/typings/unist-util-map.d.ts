// Type definitions for unist-util-map 1.0
// Project: https://github.com/syntax-tree/unist-util-map
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'unist-util-map' {
  import {Node} from 'unist'

  namespace unistUtilMap {
    interface MapFunction<In extends Node, Out extends Node> {
      (node: In, index: number | null, parent: In | null): Out
    }
  }

  function unistUtilMap<In extends Node, Out extends Node>(
    tree: In,
    mapFunction: unistUtilMap.MapFunction<In, Out>
  ): Out

  export = unistUtilMap
}
