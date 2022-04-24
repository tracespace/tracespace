// Tests that certain patterns do not trigger matches
import {describe, it, expect} from 'vitest'

import * as Lexer from '../../lexer'
import {token as t, simplifyTokens} from '../../__tests__/helpers'
import {matchSyntax, MatchState} from '..'

const SPECS: Array<{
  source: string
  expectedTokens: Lexer.Token[]
}> = [
  {
    // Newline by itself should not match anything
    source: '\n',
    expectedTokens: [t(Lexer.NEWLINE, '\n')],
  },
  {
    // Empty gerber block shouldn't match anything
    source: '*',
    expectedTokens: [t(Lexer.ASTERISK, '*')],
  },
]

describe('syntax match non-match list', () => {
  for (const {source, expectedTokens} of SPECS) {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      let result: MatchState | null = null
      lexer.reset(source)

      for (const token of lexer) {
        result = matchSyntax(result, token)
      }

      const {nodes, filetype, tokens} = result!

      expect(nodes).to.eql(undefined)
      expect(filetype).to.eql(undefined)
      expect(simplifyTokens(tokens)).to.eql(simplifyTokens(expectedTokens))
    })
  }
})
