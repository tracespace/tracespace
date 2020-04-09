// gerber grammar tests
import {expect} from 'chai'
import {toArray} from 'lodash'

import * as Lexer from '../../lexer'
import * as Tree from '../../tree'
import {token as t, simplifyToken} from '../../__tests__/helpers'
import {grammar, matchGrammar, MatchState} from '..'

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
} from '../../constants'

const SPECS: Array<{
  source: string
  expectedTokens: Lexer.Token[]
  expectedNodes: Tree.ChildNode[]
}> = [
  {
    // gerber file end with M02
    source: 'M02*',
    expectedTokens: [t(Lexer.M_CODE, '2'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.DONE}],
  },
  {
    // gerber file end with M00
    source: 'M00*',
    expectedTokens: [t(Lexer.M_CODE, '0'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.DONE}],
  },
  {
    // gerber comment
    source: 'G04 foo 123*',
    expectedTokens: [
      t(Lexer.G_CODE, '4'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.WORD, 'foo'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.NUMBER, '123'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [{type: Tree.COMMENT, comment: 'foo 123'}],
  },
  {
    // tool change
    source: 'D123*',
    expectedTokens: [t(Lexer.D_CODE, '123'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.TOOL_CHANGE, code: '123'}],
  },
  {
    // tool change with deprecated G54
    source: 'G54D456*',
    expectedTokens: [
      t(Lexer.G_CODE, '54'),
      t(Lexer.D_CODE, '456'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [{type: Tree.TOOL_CHANGE, code: '456'}],
  },
  {
    // operation with modal graphic type (deprecated)
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
        graphic: null,
        coordinates: {x: '001', y: '002'},
      },
    ],
  },
  {
    // move operation with coordinates and graphic type
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
        graphic: MOVE,
        coordinates: {x: '001', y: '002'},
      },
    ],
  },
  {
    // segment with coordinates, graphic type, and leading mode (deprecated)
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
      {type: Tree.INTERPOLATE_MODE, mode: CCW_ARC},
      {
        type: Tree.GRAPHIC,
        graphic: SEGMENT,
        coordinates: {x: '001', y: '002'},
      },
    ],
  },
  {
    // shape operation with modal coordinates
    source: 'D03*',
    expectedTokens: [t(Lexer.D_CODE, '3'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.GRAPHIC, graphic: SHAPE, coordinates: {}}],
  },
  {
    // shape operation with modal coordinates and leading mode (deprecated)
    source: 'G01D03*',
    expectedTokens: [
      t(Lexer.G_CODE, '1'),
      t(Lexer.D_CODE, '3'),
      t(Lexer.ASTERISK, '*'),
    ],
    expectedNodes: [
      {type: Tree.INTERPOLATE_MODE, mode: LINE},
      {type: Tree.GRAPHIC, graphic: SHAPE, coordinates: {}},
    ],
  },
  {
    // linear interpolation mode
    source: 'G01*',
    expectedTokens: [t(Lexer.G_CODE, '1'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.INTERPOLATE_MODE, mode: LINE}],
  },
  {
    // clockwise arc interpolation mode
    source: 'G02*',
    expectedTokens: [t(Lexer.G_CODE, '2'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.INTERPOLATE_MODE, mode: CW_ARC}],
  },
  {
    // counterclockwise arc interpolation mode
    source: 'G03*',
    expectedTokens: [t(Lexer.G_CODE, '3'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.INTERPOLATE_MODE, mode: CCW_ARC}],
  },
  {
    // region mode on
    source: 'G36*',
    expectedTokens: [t(Lexer.G_CODE, '36'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.REGION_MODE, region: true}],
  },
  {
    // region mode off
    source: 'G37*',
    expectedTokens: [t(Lexer.G_CODE, '37'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.REGION_MODE, region: false}],
  },
  {
    // single quadrant mode
    source: 'G74*',
    expectedTokens: [t(Lexer.G_CODE, '74'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.QUADRANT_MODE, quadrant: SINGLE}],
  },
  {
    // multi quadrant mode
    source: 'G75*',
    expectedTokens: [t(Lexer.G_CODE, '75'), t(Lexer.ASTERISK, '*')],
    expectedNodes: [{type: Tree.QUADRANT_MODE, quadrant: MULTI}],
  },
  {
    // inch mode
    source: '%MOIN*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_UNITS, 'IN'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [{type: Tree.UNITS, units: IN}],
  },
  {
    // millimeter mode
    source: '%MOMM*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_UNITS, 'MM'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [{type: Tree.UNITS, units: MM}],
  },
  {
    // gerber format leading, absolute
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
        zeroSuppression: LEADING,
        mode: ABSOLUTE,
        format: [3, 4],
      },
    ],
  },
  {
    // gerber format trailing, incremental
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
        zeroSuppression: TRAILING,
        mode: INCREMENTAL,
        format: [4, 5],
      },
    ],
  },
  {
    // gerber format with stuff missing and extra cruft
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
        zeroSuppression: null,
        mode: ABSOLUTE,
        format: [2, 2],
      },
    ],
  },
]

describe('gerber grammar matches', () => {
  SPECS.forEach(({source, expectedTokens, expectedNodes}) => {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      lexer.reset(source)

      const actualTokens = toArray((lexer as unknown) as Array<Lexer.Token>)
      const {tokens, nodes, filetype} = actualTokens.reduce<MatchState>(
        (state, token) => matchGrammar(state, token, grammar),
        null
      )

      expect(filetype).to.equal(GERBER)
      expect(nodes).to.eql(expectedNodes)
      expect(tokens.map(simplifyToken)).to.eql(
        expectedTokens.map(simplifyToken)
      )
    })
  })
})
