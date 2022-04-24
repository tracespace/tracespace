// tests that certain patterns do not trigger matches
import {describe, it, expect} from 'vitest'

import * as Lexer from '../../lexer'
import {token as t, simplifyToken} from '../../__tests__/helpers'
import {matchSyntax, MatchState} from '..'

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

describe('syntax match non-match list', () => {
  SPECS.forEach(({source, expectedTokens}) => {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      lexer.reset(source)

      const actualTokens = [...lexer]
      const matchState = actualTokens.reduce<MatchState>(
        (state, token) => matchSyntax(state, token),
        null as unknown as MatchState
      )

      expect(matchState.nodes).to.eql(undefined)
      expect(matchState.filetype).to.eql(undefined)
      expect(matchState.tokens.map(simplifyToken)).to.eql(
        expectedTokens.map(simplifyToken)
      )
    })
  })
})
