// Tests that certain patterns do not trigger matches
import {describe, it, expect} from 'vitest'

import * as Lexer from '../../lexer'
import {token as t, simplifyTokens} from '../../__tests__/helpers'
import {matchSyntax} from '..'

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
    it(`should not match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      const lexerResult = [...lexer.feed(source)]
      const tokens = lexerResult.map(([t]) => t)
      const result = matchSyntax(lexerResult)

      expect(result.filetype).to.equal(undefined)
      expect(result.nodes).to.eql([])
      expect(simplifyTokens(tokens)).to.eql(simplifyTokens(expectedTokens))
    })
  }
})
