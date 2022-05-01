// Type definitions for unist-util-visit-parents
// Project: https://github.com/syntax-tree/unist-util-visit-parents
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'unist-util-visit-parents' {
  function unistUtilVisitParents<Parent, Child = Parent>(
    node: Parent,
    filter: string | ((node: Parent) => boolean),
    handler: (child: Child, ancestors: Parent[]) => unknown
  ): void

  function unistUtilVisitParents<Parent, Child = Parent>(
    node: Parent,
    handler: (child: Child, ancestors: Parent[]) => unknown
  ): void

  export = unistUtilVisitParents
}
