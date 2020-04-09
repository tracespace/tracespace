// ensure that one child of given type exists in a parent node
// mutates and returns tree
import {Root, ChildNode, DONE} from './nodes'
import {Filetype} from '../types'

export function reducer(
  tree: Root,
  nodes: ChildNode[],
  filetype: Filetype | null
): Root {
  tree.children.push(...nodes)
  tree.filetype = tree.filetype ?? filetype
  tree.done = tree.done || nodes.some(n => n.type === DONE)

  return tree
}
