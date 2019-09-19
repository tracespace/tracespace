// Type definitions for unist-util-visit-parents
// Project: https://github.com/syntax-tree/unist-util-visit-parents
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'unist-util-visit-parents' {
  import {Node, Parent} from 'unist'

  function unistUtilVisitParents<Root extends Node, Child extends Node>(
    node: Parent,
    filter: string,
    handler: (child: Child, ancestors: Root[]) => unknown
  ): void

  function unistUtilVisitParents<Root extends Node, Child extends Node>(
    node: Parent,
    filter: (node: Root) => boolean,
    handler: (child: Child, ancestors: Root[]) => unknown
  ): void

  function unistUtilVisitParents<Root extends Node, Child extends Node>(
    node: Root,
    handler: (child: Child, ancestors: Root[]) => unknown
  ): void

  export = unistUtilVisitParents
}
