declare module 'unist-util-map' {
  import {Node, Data} from 'unist'

  interface MapFunction<Tree extends Node<Data>, OutTree extends Node<Data>> {
    (node: Tree, index: number | null, parent: Tree | null): OutTree
  }

  export function map<
    Tree extends Node<Data>,
    OutTree extends Node<Data> = Tree
  >(tree: Tree, mapFunction: MapFunction<Tree, OutTree>): OutTree
}
