// tests for @tracespace/parser

import {expect} from 'chai'
import * as td from 'testdouble'

import * as Parser from '..'

describe('@tracespace/parser', () => {
  let parser: Parser.Parser

  beforeEach(() => {
    parser = Parser.createParser()
    td.replace(parser, 'lexer')
  })

  afterEach(() => {
    td.reset()
  })

  it('should return an AST', () => {
    const expected: Parser.Root = {
      type: 'root',
      filetype: null,
      done: false,
      children: [{type: 'header', children: []}, {type: 'image', children: []}],
    }

    expect(parser.results()).to.eql(expected)
  })

  it('should feed its input to the lexer', () => {
    parser.feed('mock data')
    td.verify(parser.lexer.reset('mock data'))
    td.verify(parser.lexer.next())
  })
})
