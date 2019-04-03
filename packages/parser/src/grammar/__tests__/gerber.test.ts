// gerber grammar tests
import {expect} from 'chai'

import * as Lexer from '../../lexer'
import {token as t} from '../../__tests__/helpers'
import {findMatch, MatchState} from '../../rules'
import {GERBER} from '../../tree'
import * as Grammar from '..'

interface GrammarSpec {
  tokens: Array<Lexer.Token>
  expected: Grammar.GrammarMatch['type']
}

const INITIAL_MATCH_STATE: MatchState = {
  candidates: Grammar.grammar,
  tokens: [],
  match: null,
}

describe('gerber grammar', () => {
  const SPECS: {[name: string]: GrammarSpec} = {
    'M02* - GERBER_DONE': {
      tokens: [t(Lexer.M_CODE, '2'), t(Lexer.ASTERISK, '*')],
      expected: Grammar.GERBER_DONE,
    },
    'M00* - GERBER_DONE': {
      tokens: [t(Lexer.M_CODE, '0'), t(Lexer.ASTERISK, '*')],
      expected: Grammar.GERBER_DONE,
    },
    'D123* - TOOL_CHANGE': {
      tokens: [t(Lexer.D_CODE, '123'), t(Lexer.ASTERISK, '*')],
      expected: Grammar.GERBER_TOOL_CHANGE,
    },
    'G54D456* - TOOL_CHANGE': {
      tokens: [
        t(Lexer.G_CODE, '54'),
        t(Lexer.D_CODE, '456'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_TOOL_CHANGE,
    },
    'X001Y002* - OPERATION': {
      tokens: [
        t(Lexer.CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_OPERATION,
    },
    'X001Y002D03* - OPERATION': {
      tokens: [
        t(Lexer.CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.D_CODE, '3'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_OPERATION,
    },
    'G03X001Y002D01* - OPERATION': {
      tokens: [
        t(Lexer.G_CODE, '3'),
        t(Lexer.CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.D_CODE, '1'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_OPERATION,
    },
  }

  Object.keys(SPECS).forEach(name => {
    const {tokens, expected} = SPECS[name]

    it(name, () => {
      const result = tokens.reduce(findMatch, INITIAL_MATCH_STATE)

      expect(result.match && result.match.type).to.equal(expected)
      expect(result.match && result.match.filetype).to.equal(GERBER)
      expect(result.tokens).to.eql(tokens)
    })
  })
})
