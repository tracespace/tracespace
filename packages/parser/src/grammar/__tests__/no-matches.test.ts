// tests that certain patterns do not trigger matches
import {expect} from 'chai'
import {toArray} from 'lodash'

import * as Lexer from '../../lexer'
import {token as t, simplifyToken} from '../../__tests__/helpers'
import {grammar, matchGrammar, MatchState} from '..'

const SPECS: Array<{
  source: string
  expectedTokens: Lexer.Token[]
}> = [
  {
    // newline by itself should not match anything
    source: '\n',
    expectedTokens: [t(Lexer.NEWLINE, '\n')],
  },
  {
    // empty gerber block shouldn't match anything
    source: '*',
    expectedTokens: [t(Lexer.ASTERISK, '*')],
  },
]

describe('drill grammar matches', () => {
  SPECS.forEach(({source, expectedTokens}) => {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      lexer.reset(source)

      const actualTokens = toArray((lexer as unknown) as Array<Lexer.Token>)
      const matchState = actualTokens.reduce<MatchState>(
        (state, token) => matchGrammar(state, token, grammar),
        null
      )

      expect(matchState.nodes).to.eql(undefined)
      expect(matchState.filetype).to.eql(undefined)
      expect(matchState.tokens.map(simplifyToken)).to.eql(
        expectedTokens.map(simplifyToken)
      )
    })
  })
})
