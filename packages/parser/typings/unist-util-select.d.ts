// Type definitions for unist-util-select 2.0
// Project: https://github.com/syntax-tree/unist-util-select
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'unist-util-select' {
  import {Node} from 'unist'

  namespace unistUtilSelect {
    function matches(selector: string, node: Node): boolean

    function select(selector: string, node: Node): Node | null

    function selectAll(selector: string, node: Node): Array<Node>
  }

  export = unistUtilSelect
}
