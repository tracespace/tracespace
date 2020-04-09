// syntax tree reducer tests
import {expect} from 'chai'

import {GERBER, DRILL} from '../../constants'
import {ROOT, COMMENT, DONE, ChildNode} from '../nodes'
import {reducer} from '../reducer'

describe('tree reducer', () => {
  let tree

  beforeEach(() => {
    tree = {type: ROOT, filetype: null, done: false, children: []}
  })

  it('should place input nodes into the tree', () => {
    const nodes: ChildNode[] = [{type: COMMENT, comment: 'hey'}]

    expect(reducer(tree, nodes, null)).to.eql({...tree, children: [...nodes]})
  })

  it('should flatten the output of matchToNodes if it returns multiple nodes', () => {
    const nodes: ChildNode[] = [
      {type: COMMENT, comment: 'hello'},
      {type: COMMENT, comment: 'world'},
    ]

    expect(reducer(tree, nodes, null)).to.eql({...tree, children: [...nodes]})
  })

  it('sets tree.done if nodes includes DONE', () => {
    const nodes: ChildNode[] = [{type: DONE}]

    expect(reducer(tree, nodes, null).done).to.equal(true)
  })

  it('sets tree.filetype if match includes filetype', () => {
    const nodes: ChildNode[] = [{type: DONE}]

    expect(reducer(tree, nodes, GERBER).filetype).to.equal(GERBER)
  })

  it('will not overwrite tree.filetype once set', () => {
    const nodes: ChildNode[] = [{type: DONE}]
    tree.filetype = GERBER

    expect(reducer(tree, nodes, DRILL).filetype).to.equal(GERBER)
  })
})
