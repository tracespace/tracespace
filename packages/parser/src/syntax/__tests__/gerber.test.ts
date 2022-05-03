// Gerber syntax tests
import {describe, it, expect} from 'vitest'

import * as Lexer from '../../lexer'
import * as Tree from '../../tree'
import {
  token as t,
  position as pos,
  simplifyTokens,
} from '../../__tests__/helpers'
import {matchSyntax, grammar, MatchState} from '..'

import {
  GERBER,
  SEGMENT,
  MOVE,
  SHAPE,
  LINE,
  CW_ARC,
  CCW_ARC,
  SINGLE,
  MULTI,
  MM,
  IN,
  ABSOLUTE,
  INCREMENTAL,
  LEADING,
  TRAILING,
  CLEAR,
  DARK,
} from '../../constants'

const SPECS: Array<{
  source: string
  expectedTokens: Lexer.Token[]
  expectedNodes: Tree.ChildNode[]
}> = [
  {
    // Gerber file end with M02
    source: 'M02*',
    expectedTokens: [t(Lexer.M_CODE, '2'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.DONE,
        position: pos([1, 1, 0], [1, 4, 3]),
      },
    ],
  },
  {
    // Gerber file end with M00
    source: 'M00*',
    expectedTokens: [t(Lexer.M_CODE, '0'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.DONE,
        position: pos([1, 1, 0], [1, 4, 3]),
      },
    ],
  },
  {
    // Gerber comment
    source: 'G04 foo 123*',
    expectedTokens: [
      t(Lexer.G_CODE, '4'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.WORD, 'foo'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.NUMBER, '123'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [
      {
        type: Tree.COMMENT,
        position: pos([1, 1, 0], [1, 12, 11]),
        comment: 'foo 123',
      },
    ],
  },
  {
    // Tool change
    source: 'D123*',
    expectedTokens: [t(Lexer.D_CODE, '123'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.TOOL_CHANGE,
        position: pos([1, 1, 0], [1, 5, 4]),
        code: '123',
      },
    ],
  },
  {
    // Tool change with deprecated G54
    source: 'G54D456*',
    expectedTokens: [
      t(Lexer.G_CODE, '54'),
      t(Lexer.D_CODE, '456'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_CHANGE,
        position: pos([1, 1, 0], [1, 8, 7]),
        code: '456',
      },
    ],
  },
  {
    // Operation with modal graphic type (deprecated)
    source: 'X001Y002*',
    expectedTokens: [
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '001'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '002'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [
      {
        type: Tree.GRAPHIC,
        position: pos([1, 1, 0], [1, 9, 8]),
        graphic: null,
        coordinates: {x: '001', y: '002'},
      },
    ],
  },
  {
    // Move operation with coordinates and graphic type
    source: 'X001Y002D02*',
    expectedTokens: [
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '001'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '002'),
      t(Lexer.D_CODE, '2'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [
      {
        type: Tree.GRAPHIC,
        position: pos([1, 1, 0], [1, 12, 11]),
        graphic: MOVE,
        coordinates: {x: '001', y: '002'},
      },
    ],
  },
  {
    // Segment with coordinates, graphic type, and leading mode (deprecated)
    source: 'G03X001Y002D01*',
    expectedTokens: [
      t(Lexer.G_CODE, '3'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '001'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '002'),
      t(Lexer.D_CODE, '1'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: CCW_ARC,
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 4, 3], [1, 15, 14]),
        graphic: SEGMENT,
        coordinates: {x: '001', y: '002'},
      },
    ],
  },
  {
    // Shape operation with modal coordinates
    source: 'D03*',
    expectedTokens: [t(Lexer.D_CODE, '3'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.GRAPHIC,
        position: pos([1, 1, 0], [1, 4, 3]),
        graphic: SHAPE,
        coordinates: {},
      },
    ],
  },
  {
    // Shape operation with modal coordinates and leading mode (deprecated)
    source: 'G01D03*',
    expectedTokens: [
      t(Lexer.G_CODE, '1'),
      t(Lexer.D_CODE, '3'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: LINE,
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 4, 3], [1, 7, 6]),
        graphic: SHAPE,
        coordinates: {},
      },
    ],
  },
  {
    // Linear interpolation mode
    source: 'G01*',
    expectedTokens: [t(Lexer.G_CODE, '1'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: LINE,
      },
    ],
  },
  {
    // Clockwise arc interpolation mode
    source: 'G02*',
    expectedTokens: [t(Lexer.G_CODE, '2'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: CW_ARC,
      },
    ],
  },
  {
    // Counterclockwise arc interpolation mode
    source: 'G03*',
    expectedTokens: [t(Lexer.G_CODE, '3'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: CCW_ARC,
      },
    ],
  },
  {
    // Region mode on
    source: 'G36*',
    expectedTokens: [t(Lexer.G_CODE, '36'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.REGION_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        region: true,
      },
    ],
  },
  {
    // Region mode off
    source: 'G37*',
    expectedTokens: [t(Lexer.G_CODE, '37'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.REGION_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        region: false,
      },
    ],
  },
  {
    // Single quadrant mode
    source: 'G74*',
    expectedTokens: [t(Lexer.G_CODE, '74'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.QUADRANT_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        quadrant: SINGLE,
      },
    ],
  },
  {
    // Multi quadrant mode
    source: 'G75*',
    expectedTokens: [t(Lexer.G_CODE, '75'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [
      {
        type: Tree.QUADRANT_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        quadrant: MULTI,
      },
    ],
  },
  {
    // Inch mode
    source: '%MOIN*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_UNITS, 'IN'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.UNITS,
        position: pos([1, 2, 1], [1, 6, 5]),
        units: IN,
      },
    ],
  },
  {
    // Millimeter mode
    source: '%MOMM*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_UNITS, 'MM'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.UNITS,
        position: pos([1, 2, 1], [1, 6, 5]),
        units: MM,
      },
    ],
  },
  {
    // Gerber format leading, absolute
    source: '%FSLAX34Y34*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_FORMAT, 'LA'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '34'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '34'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.COORDINATE_FORMAT,
        position: pos([1, 2, 1], [1, 12, 11]),
        zeroSuppression: LEADING,
        mode: ABSOLUTE,
        format: [3, 4],
      },
    ],
  },
  {
    // Gerber format trailing, incremental
    source: '%FSTIX45Y45*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_FORMAT, 'TI'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '45'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '45'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.COORDINATE_FORMAT,
        position: pos([1, 2, 1], [1, 12, 11]),
        zeroSuppression: TRAILING,
        mode: INCREMENTAL,
        format: [4, 5],
      },
    ],
  },
  {
    // Gerber format with stuff missing and extra cruft
    source: '%FSDAN2X22Y22Z22*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_FORMAT, 'DA'),
      t(Lexer.COORD_CHAR, 'N'),
      t(Lexer.NUMBER, '2'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '22'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '22'),
      t(Lexer.COORD_CHAR, 'Z'),
      t(Lexer.NUMBER, '22'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.COORDINATE_FORMAT,
        position: pos([1, 2, 1], [1, 17, 16]),
        zeroSuppression: null,
        mode: ABSOLUTE,
        format: [2, 2],
      },
    ],
  },
  {
    // Gerber format combined with units
    // invalid syntax, but happens in real life
    // https://github.com/tracespace/tracespace/issues/234
    source: '%FSLAX43Y43*MOMM*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_FORMAT, 'LA'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '43'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '43'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.GERBER_UNITS, 'MM'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.COORDINATE_FORMAT,
        position: pos([1, 2, 1], [1, 12, 11]),
        zeroSuppression: LEADING,
        mode: ABSOLUTE,
        format: [4, 3],
      },
      {
        type: Tree.UNITS,
        position: pos([1, 13, 12], [1, 17, 16]),
        units: MM,
      },
    ],
  },
  {
    // Load polarity dark
    source: '%LPD*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_LOAD_POLARITY, 'D'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.LOAD_POLARITY,
        position: pos([1, 2, 1], [1, 5, 4]),
        polarity: DARK,
      },
    ],
  },
  {
    // Load polarity clear
    source: '%LPC*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_LOAD_POLARITY, 'C'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.LOAD_POLARITY,
        position: pos([1, 2, 1], [1, 5, 4]),
        polarity: CLEAR,
      },
    ],
  },
  {
    // Empty step repeat
    source: '%SR*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_STEP_REPEAT, 'SR'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.STEP_REPEAT,
        position: pos([1, 2, 1], [1, 4, 3]),
        stepRepeat: {},
      },
    ],
  },
  {
    // Full step repeat
    source: '%SRX2Y3I4J5*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_STEP_REPEAT, 'SR'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '2'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '3'),
      t(Lexer.COORD_CHAR, 'I'),
      t(Lexer.NUMBER, '4'),
      t(Lexer.COORD_CHAR, 'J'),
      t(Lexer.NUMBER, '5'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.STEP_REPEAT,
        position: pos([1, 2, 1], [1, 12, 11]),
        stepRepeat: {x: 2, y: 3, i: 4, j: 5},
      },
    ],
  },
  {
    // Deprecated / unknown extended commands
    source: '%OFA0B0*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.WORD, 'OFA'),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COORD_CHAR, 'B'),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.UNIMPLEMENTED,
        position: pos([1, 2, 1], [1, 8, 7]),
        value: '%OFA0B0*%',
      },
    ],
  },
]

describe('gerber syntax matches', () => {
  for (const {source, expectedTokens, expectedNodes} of SPECS) {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      let result: MatchState | null = null

      lexer.reset(source)

      for (const token of lexer) {
        result = matchSyntax(result, token, grammar)
      }

      const {tokens, nodes, filetype} = result!

      expect(filetype).to.equal(GERBER)
      expect(nodes).to.eql(expectedNodes)
      expect(simplifyTokens(tokens)).to.eql(simplifyTokens(expectedTokens))
    })
  }
})
