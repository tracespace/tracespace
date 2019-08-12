// gerber grammar tests
import {expect} from 'chai'
import {toArray} from 'lodash'

import * as Lexer from '../../lexer'
import {token as t, simplifyToken} from '../../__tests__/helpers'
import {findMatch, MatchState} from '../../rules'
import {DRILL} from '../../tree'
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

describe('drill grammar', () => {
  const SPECS: {[source: string]: GrammarSpec} = {
    '; foo 123\n': {
      expected: Grammar.DRILL_COMMENT,
      tokens: [
        t(Lexer.SEMICOLON, ';'),
        t(Lexer.WHITESPACE, ' '),
        t(Lexer.WORD, 'foo'),
        t(Lexer.WHITESPACE, ' '),
        t(Lexer.NUMBER, '123'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    'M00\n': {
      tokens: [t(Lexer.M_CODE, '0'), t(Lexer.NEWLINE, '\n')],
      expected: Grammar.DRILL_DONE,
    },
    'M30\n': {
      tokens: [t(Lexer.M_CODE, '30'), t(Lexer.NEWLINE, '\n')],
      expected: Grammar.DRILL_DONE,
    },
    'INCH\n': {
      tokens: [t(Lexer.DRILL_UNITS, 'INCH'), t(Lexer.NEWLINE, '\n')],
      expected: Grammar.DRILL_UNITS,
    },
    'METRIC\n': {
      tokens: [t(Lexer.DRILL_UNITS, 'METRIC'), t(Lexer.NEWLINE, '\n')],
      expected: Grammar.DRILL_UNITS,
    },
    'M71\n': {
      tokens: [t(Lexer.M_CODE, '71'), t(Lexer.NEWLINE, '\n')],
      expected: Grammar.DRILL_UNITS,
    },
    'M72\n': {
      tokens: [t(Lexer.M_CODE, '72'), t(Lexer.NEWLINE, '\n')],
      expected: Grammar.DRILL_UNITS,
    },
    'INCH,TZ\n': {
      tokens: [
        t(Lexer.DRILL_UNITS, 'INCH'),
        t(Lexer.DRILL_ZERO_INCLUSION, 'TZ'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_UNITS,
    },
    'M71,TZ\n': {
      tokens: [
        t(Lexer.M_CODE, '71'),
        t(Lexer.DRILL_ZERO_INCLUSION, 'TZ'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_UNITS,
    },
    'METRIC,LZ,000.0000\n': {
      tokens: [
        t(Lexer.DRILL_UNITS, 'METRIC'),
        t(Lexer.DRILL_ZERO_INCLUSION, 'LZ'),
        t(Lexer.DRILL_COORD_FORMAT, '000.0000'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_UNITS,
    },
    'M72,LZ,00.000\n': {
      tokens: [
        t(Lexer.M_CODE, '72'),
        t(Lexer.DRILL_ZERO_INCLUSION, 'LZ'),
        t(Lexer.DRILL_COORD_FORMAT, '00.000'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_UNITS,
    },
    'T01C0.01\n': {
      tokens: [
        t(Lexer.T_CODE, '1'),
        t(Lexer.DRILL_TOOL_PROPS, 'C0.01'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_TOOL_DEFINITION,
    },
    'T12\n': {
      tokens: [t(Lexer.T_CODE, '12'), t(Lexer.NEWLINE, '\n')],
      expected: Grammar.DRILL_TOOL_CHANGE,
    },
    'X01Y02\n': {
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '01'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '02'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_OPERATION,
    },
    'T42X03Y04\n': {
      tokens: [
        t(Lexer.T_CODE, '42'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '03'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '04'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_OPERATION,
    },
    'X05Y06T5\n': {
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '05'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '06'),
        t(Lexer.T_CODE, '5'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_OPERATION,
    },
    'G00X05Y06\n': {
      tokens: [
        t(Lexer.G_CODE, '0'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '05'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '06'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_OPERATION,
    },
    'G01X05Y06\n': {
      tokens: [
        t(Lexer.G_CODE, '1'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '05'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '06'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_OPERATION,
    },
    'G02X05Y06\n': {
      tokens: [
        t(Lexer.G_CODE, '2'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '05'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '06'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_OPERATION,
    },
    'G03X05Y06\n': {
      tokens: [
        t(Lexer.G_CODE, '3'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '05'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '06'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_OPERATION,
    },
    'G05\n': {
      tokens: [t(Lexer.G_CODE, '5'), t(Lexer.NEWLINE, '\n')],
      expected: Grammar.DRILL_OPERATION,
    },
    'X07Y08G85X09Y10\n': {
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '07'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '08'),
        t(Lexer.G_CODE, '85'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '09'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '10'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_SLOT,
    },
    'X07G85Y10\n': {
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '07'),
        t(Lexer.G_CODE, '85'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '10'),
        t(Lexer.NEWLINE, '\n'),
      ],
      expected: Grammar.DRILL_SLOT,
    },
  }

  Object.keys(SPECS).forEach(source => {
    const {tokens, expected} = SPECS[source]
    const expectedTokens = tokens.map(simplifyToken)
    const lexer = Lexer.createLexer()

    it(source.trim(), () => {
      lexer.reset(source)

      const actualTokens = toArray((lexer as unknown) as Array<Lexer.Token>)
      const result = actualTokens.reduce(findMatch, INITIAL_MATCH_STATE)

      expect(result.tokens.map(simplifyToken)).to.eql(expectedTokens)
      expect(result.match && result.match.type).to.equal(expected)
      expect(result.match && result.match.filetype).to.equal(DRILL)
    })
  })
})
