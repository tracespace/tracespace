// gerber grammar tests
import {expect} from 'chai'
import {toArray} from 'lodash'

import * as Lexer from '../../lexer'
import {token as t, simplifyToken} from '../../__tests__/helpers'
import {reduceMatchState, MatchState} from '../../rules'
import {GERBER} from '../../tree'
import * as Grammar from '..'

interface GrammarSpec {
  tokens: Array<Lexer.Token>
  expected: Grammar.GerberGrammarType
}

const INITIAL_MATCH_STATE: MatchState<Grammar.GrammarRuleType> = {
  candidates: Grammar.grammar,
  tokens: [],
}

describe('gerber grammar', () => {
  const SPECS: {[source: string]: GrammarSpec} = {
    'M02*': {
      tokens: [t(Lexer.M_CODE, '2'), t(Lexer.ASTERISK, '*')],
      expected: Grammar.GERBER_DONE,
    },
    'M00*': {
      tokens: [t(Lexer.M_CODE, '0'), t(Lexer.ASTERISK, '*')],
      expected: Grammar.GERBER_DONE,
    },
    'G04 foo 123*': {
      tokens: [
        t(Lexer.G_CODE, '4'),
        t(Lexer.WHITESPACE, ' '),
        t(Lexer.WORD, 'foo'),
        t(Lexer.WHITESPACE, ' '),
        t(Lexer.NUMBER, '123'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_COMMENT,
    },
    'D123*': {
      tokens: [t(Lexer.D_CODE, '123'), t(Lexer.ASTERISK, '*')],
      expected: Grammar.GERBER_TOOL_CHANGE,
    },
    'G54D456*': {
      tokens: [
        t(Lexer.G_CODE, '54'),
        t(Lexer.D_CODE, '456'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_TOOL_CHANGE,
    },
    'X001Y002*': {
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_OPERATION,
    },
    'X001Y002D03*': {
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.D_CODE, '3'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_OPERATION,
    },
    'G03X001Y002D01*': {
      tokens: [
        t(Lexer.G_CODE, '3'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.D_CODE, '1'),
        t(Lexer.ASTERISK, '*'),
      ],
      expected: Grammar.GERBER_OPERATION,
    },
  }

  Object.keys(SPECS).forEach(source => {
    const {tokens, expected} = SPECS[source]
    const expectedTokens = tokens.map(simplifyToken)
    const lexer = Lexer.createLexer()

    it(source, () => {
      lexer.reset(source)

      const actualTokens = toArray((lexer as unknown) as Array<Lexer.Token>)
      const {match} = actualTokens.reduce(reduceMatchState, INITIAL_MATCH_STATE)

      expect(match && match.tokens.map(simplifyToken)).to.eql(expectedTokens)
      expect(match && match.type).to.equal(expected)
      expect(match && match.filetype).to.equal(GERBER)
    })
  })
})
