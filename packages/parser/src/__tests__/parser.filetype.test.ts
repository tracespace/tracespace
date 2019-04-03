// tests for @tracespace/parser

import {expect} from 'chai'
import td from 'testdouble'
import {Parser as ParserClass} from '..'

describe('@tracepace/parser', () => {
  let Rules: {findMatch: (matchState: {}, token: {}) => {}}
  let Parser: typeof ParserClass
  let parser: ParserClass

  before(() => {
    Rules = td.replace('../rules')
    Parser = require('../parser').Parser
  })

  beforeEach(() => {
    parser = new Parser()
  })

  afterEach(() => {
    td.reset()
  })

  it('should set filetype to drill', () => {
    td.when(
      Rules.findMatch(td.matchers.anything(), td.matchers.anything())
    ).thenReturn({
      candidates: [],
      match: {filetype: 'drill', handler: () => {}},
    })

    parser.feed('\n')
    expect(parser.results().filetype).to.equal('drill')
  })

  it('should set filetype to gerber', () => {
    td.when(
      Rules.findMatch(td.matchers.anything(), td.matchers.anything())
    ).thenReturn({
      candidates: [],
      match: {filetype: 'gerber', handler: () => {}},
    })

    parser.feed('\n')
    expect(parser.results().filetype).to.equal('gerber')
  })
})
