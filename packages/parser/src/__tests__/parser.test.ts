// tests for @tracespace/parser

import {expect} from 'chai'
import {createParser, Parser, Root, ROOT, COMMENT, DONE, GERBER} from '..'

describe('@tracespace/parser', () => {
  let parser: Parser

  beforeEach(() => {
    parser = createParser()
  })

  it('should return an AST', () => {
    const expected: Root = {
      type: ROOT,
      filetype: null,
      done: false,
      children: [],
    }

    expect(parser.results()).to.eql(expected)
  })

  it('should feed its input into the tree', () => {
    parser.feed('G04 hello world*')

    expect(parser.results()).to.eql({
      type: ROOT,
      filetype: GERBER,
      done: false,
      children: [{type: COMMENT, comment: 'hello world'}],
    })
  })

  it('should handle multiple feedings', () => {
    parser.feed('G04 hello world*')
    parser.feed('M00*')

    expect(parser.results()).to.eql({
      type: ROOT,
      filetype: GERBER,
      done: true,
      children: [{type: COMMENT, comment: 'hello world'}, {type: DONE}],
    })
  })

  it('should handle multiple feedings with unexpected splits for streaming support', () => {
    parser.feed('G0')
    parser.feed('4 hello ')
    parser.feed('world*\nM')
    parser.feed('00')
    parser.feed('*\n')

    expect(parser.results()).to.eql({
      type: ROOT,
      filetype: GERBER,
      done: true,
      children: [{type: COMMENT, comment: 'hello world'}, {type: DONE}],
    })
  })
})