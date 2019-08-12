// tests for @tracespace/parser

import {expect} from 'chai'
import td from 'testdouble'
import {Parser as ParserClass} from '../..'
import * as Grammar from '../../grammar'

describe.skip('tree reducer common actions', () => {
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
      match: {filetype: 'drill', type: Grammar.DRILL_COMMENT},
      tokens: [],
      candidates: [],
    })

    parser.feed('\n')
    expect(parser.results().filetype).to.equal('drill')
  })

  it('should set filetype to gerber', () => {
    td.when(
      Rules.findMatch(td.matchers.anything(), td.matchers.anything())
    ).thenReturn({
      match: {filetype: 'gerber', type: Grammar.GERBER_COMMENT},
      tokens: [],
      candidates: [],
    })

    parser.feed('\n')
    expect(parser.results().filetype).to.equal('gerber')
  })
})
