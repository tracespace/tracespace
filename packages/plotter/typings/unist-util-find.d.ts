// Type definitions for unist-util-visit-parents
// Project: https://github.com/syntax-tree/unist-util-visit-parents
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'unist-util-find' {
  import {Node, Parent} from 'unist'

  function unistUtilFind<Target extends Node, Result extends Target>(
    node: Target,
    condition: (child: Target) => boolean
  ): Result | undefined

  function unistUtilFind<Target extends Node, Result extends Target>(
    node: Target,
    condition: Target['type']
  ): Result | undefined

  function unistUtilFind<Target extends Node, Result extends Target>(
    node: Target,
    condition: Partial<Target>
  ): Result | undefined

  export = unistUtilFind
}
