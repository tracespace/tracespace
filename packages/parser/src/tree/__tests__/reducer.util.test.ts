// reducer utility unit tests

import {expect} from 'chai'

import {ensureChild} from '../reducer'

describe('ensureChild utility function', () => {
  it('should add a child to a parent', () => {
    const parent = {type: 'parent', children: []}
    const child = {type: 'child', value: 'foo'}

    ensureChild(parent, child)
    expect(parent.children).to.eql([child])
  })

  it('should replace a child of the same type', () => {
    const parent = {type: 'parent', children: [{type: 'child', value: 'bar'}]}
    const child = {type: 'child', value: 'foo'}

    ensureChild(parent, child)
    expect(parent.children).to.eql([child])
  })

  it('should leave other children alone', () => {
    const parent = {
      type: 'parent',
      children: [
        {type: 'child1', value: 'foo'},
        {type: 'child2', value: 'bar'},
        {type: 'child3', value: 'baz'},
      ],
    }
    const child = {type: 'child2', value: 'qux'}

    ensureChild(parent, child)
    expect(parent.children).to.eql([
      {type: 'child1', value: 'foo'},
      {type: 'child2', value: 'qux'},
      {type: 'child3', value: 'baz'},
    ])
  })
})
