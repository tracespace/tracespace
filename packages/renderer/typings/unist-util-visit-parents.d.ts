// Type definitions for unist-util-visit-parents
// Project: https://github.com/syntax-tree/unist-util-visit-parents
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'unist-util-visit-parents' {
  import {Node} from 'unist'

  function unistUtilVisitParents(
    node: Node,
    filter: string,
    handler: unknown
  ): void

  export = unistUtilVisitParents
}
