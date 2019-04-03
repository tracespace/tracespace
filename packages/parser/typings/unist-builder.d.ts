// Type definitions for unist-util-select 2.0
// Project: https://github.com/syntax-tree/unist-util-select
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'unist-builder' {
  import {Node, Parent} from 'unist'
  type Child = Node | Parent

  function unistBuilder(
    type: string,
    params: {},
    children: Array<Child>
  ): Parent
  function unistBuilder(type: string, children: Array<Child>): Parent
  function unistBuilder(type: string, params: {}): Node
  function unistBuilder(type: string): Node

  export = unistBuilder
}
