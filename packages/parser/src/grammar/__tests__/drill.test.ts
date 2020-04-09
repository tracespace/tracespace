// drill grammar tests
import {expect} from 'chai'
import {toArray} from 'lodash'

import * as Lexer from '../../lexer'
import * as Tree from '../../tree'
import {token as t, simplifyToken} from '../../__tests__/helpers'
import {grammar, matchGrammar, MatchState} from '..'

import {
  DRILL,
  IN,
  MM,
  LEADING,
  TRAILING,
  CIRCLE,
  MOVE,
  LINE,
  CW_ARC,
  CCW_ARC,
  SLOT,
} from '../../constants'

const SPECS: Array<{
  source: string
  expectedTokens: Lexer.Token[]
  expectedNodes: Tree.ChildNode[]
}> = [
  {
    // drill file end with M00
    source: 'M00\n',
    expectedTokens: [t(Lexer.M_CODE, '0'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.DONE}],
  },
  {
    // drill file end with M30
    source: 'M30\n',
    expectedTokens: [t(Lexer.M_CODE, '30'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.DONE}],
  },
  {
    // drill comment
    source: '; hello world\n',
    expectedTokens: [
      t(Lexer.SEMICOLON, ';'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.WORD, 'hello'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.WORD, 'world'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [{type: Tree.COMMENT, comment: 'hello world'}],
  },
  {
    // drill inch units (new style)
    source: 'INCH\n',
    expectedTokens: [t(Lexer.DRILL_UNITS, 'INCH'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.UNITS, units: IN}],
  },
  {
    // drill millimeter units (new style)
    source: 'METRIC\n',
    expectedTokens: [t(Lexer.DRILL_UNITS, 'METRIC'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.UNITS, units: MM}],
  },
  {
    // drill inch units (old style)
    source: 'M72\n',
    expectedTokens: [t(Lexer.M_CODE, '72'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.UNITS, units: IN}],
  },
  {
    // drill millimeter units (new style)
    source: 'M71\n',
    expectedTokens: [t(Lexer.M_CODE, '71'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.UNITS, units: MM}],
  },
  {
    // drill new-style inches with leading zero suppression (keep trailing)
    source: 'INCH,TZ\n',
    expectedTokens: [
      t(Lexer.DRILL_UNITS, 'INCH'),
      t(Lexer.DRILL_ZERO_INCLUSION, 'TZ'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.UNITS, units: IN},
      {
        type: Tree.COORDINATE_FORMAT,
        zeroSuppression: LEADING,
        format: null,
        mode: null,
      },
    ],
  },
  {
    // drill old-style millimeters with trailing zero suppression (keep leading)
    source: 'M71,LZ\n',
    expectedTokens: [
      t(Lexer.M_CODE, '71'),
      t(Lexer.DRILL_ZERO_INCLUSION, 'LZ'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.UNITS, units: MM},
      {
        type: Tree.COORDINATE_FORMAT,
        zeroSuppression: TRAILING,
        format: null,
        mode: null,
      },
    ],
  },
  {
    // drill old-style inches with trailing zero suppression and format
    source: 'M72,LZ,00.000\n',
    expectedTokens: [
      t(Lexer.M_CODE, '72'),
      t(Lexer.DRILL_ZERO_INCLUSION, 'LZ'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '00.000'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.UNITS, units: IN},
      {
        type: Tree.COORDINATE_FORMAT,
        zeroSuppression: TRAILING,
        format: [2, 3],
        mode: null,
      },
    ],
  },
  {
    // drill new-style millimeters with leading zero suppression and format
    source: 'METRIC,TZ,000.0000\n',
    expectedTokens: [
      t(Lexer.DRILL_UNITS, 'METRIC'),
      t(Lexer.DRILL_ZERO_INCLUSION, 'TZ'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '000.0000'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.UNITS, units: MM},
      {
        type: Tree.COORDINATE_FORMAT,
        zeroSuppression: LEADING,
        format: [3, 4],
        mode: null,
      },
    ],
  },
  {
    // simple tool definition
    source: 'T01C0.01\n',
    expectedTokens: [
      t(Lexer.T_CODE, '1'),
      t(Lexer.COORD_CHAR, 'C'),
      t(Lexer.NUMBER, '0.01'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        code: '1',
        shape: {type: CIRCLE, diameter: 0.01},
        hole: null,
      },
    ],
  },
  {
    // tool definition with cruft
    source: 'T02F42C0.05Z\n',
    expectedTokens: [
      t(Lexer.T_CODE, '2'),
      t(Lexer.COORD_CHAR, 'F'),
      t(Lexer.NUMBER, '42'),
      t(Lexer.COORD_CHAR, 'C'),
      t(Lexer.NUMBER, '0.05'),
      t(Lexer.COORD_CHAR, 'Z'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        code: '2',
        shape: {type: CIRCLE, diameter: 0.05},
        hole: null,
      },
    ],
  },
  {
    // tool change
    source: 'T03\n',
    expectedTokens: [t(Lexer.T_CODE, '3'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.TOOL_CHANGE, code: '3'}],
  },
  {
    // tool change with cruft
    source: 'T04F200\n',
    expectedTokens: [
      t(Lexer.T_CODE, '4'),
      t(Lexer.COORD_CHAR, 'F'),
      t(Lexer.NUMBER, '200'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [{type: Tree.TOOL_CHANGE, code: '4'}],
  },
  {
    // simple drill operation
    source: 'X01Y02\n',
    expectedTokens: [
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '01'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '02'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.GRAPHIC, coordinates: {x: '01', y: '02'}, graphic: null},
    ],
  },
  {
    // drill operation with leading tool code
    source: 'T05X01Y02\n',
    expectedTokens: [
      t(Lexer.T_CODE, '5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '01'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '02'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.TOOL_CHANGE, code: '5'},
      {type: Tree.GRAPHIC, coordinates: {x: '01', y: '02'}, graphic: null},
    ],
  },
  {
    // drill operation with trailing tool code
    source: 'X01Y02T06\n',
    expectedTokens: [
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '01'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '02'),
      t(Lexer.T_CODE, '6'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.TOOL_CHANGE, code: '6'},
      {type: Tree.GRAPHIC, coordinates: {x: '01', y: '02'}, graphic: null},
    ],
  },
  {
    // route mode move
    source: 'G00X05Y06\n',
    expectedTokens: [
      t(Lexer.G_CODE, '0'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '05'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '06'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.INTERPOLATE_MODE, mode: MOVE},
      {type: Tree.GRAPHIC, coordinates: {x: '05', y: '06'}, graphic: null},
    ],
  },
  {
    // route mode linear interpolation
    source: 'G01X05Y06\n',
    expectedTokens: [
      t(Lexer.G_CODE, '1'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '05'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '06'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.INTERPOLATE_MODE, mode: LINE},
      {type: Tree.GRAPHIC, coordinates: {x: '05', y: '06'}, graphic: null},
    ],
  },
  {
    // route mode clockwise arc interpolation
    source: 'G02X05Y06I01J02\n',
    expectedTokens: [
      t(Lexer.G_CODE, '2'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '05'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '06'),
      t(Lexer.COORD_CHAR, 'I'),
      t(Lexer.NUMBER, '01'),
      t(Lexer.COORD_CHAR, 'J'),
      t(Lexer.NUMBER, '02'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.INTERPOLATE_MODE, mode: CW_ARC},
      {
        type: Tree.GRAPHIC,
        coordinates: {x: '05', y: '06', i: '01', j: '02'},
        graphic: null,
      },
    ],
  },
  {
    // route mode counter-clockwise arc interpolation
    source: 'G03X05Y06A01\n',
    expectedTokens: [
      t(Lexer.G_CODE, '3'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '05'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '06'),
      t(Lexer.COORD_CHAR, 'A'),
      t(Lexer.NUMBER, '01'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.INTERPOLATE_MODE, mode: CCW_ARC},
      {
        type: Tree.GRAPHIC,
        coordinates: {x: '05', y: '06', a: '01'},
        graphic: null,
      },
    ],
  },
  {
    // drill mode operation
    source: 'G05X05Y06\n',
    expectedTokens: [
      t(Lexer.G_CODE, '5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '05'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '06'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {type: Tree.INTERPOLATE_MODE, mode: DRILL},
      {type: Tree.GRAPHIC, coordinates: {x: '05', y: '06'}, graphic: null},
    ],
  },
  {
    // route mode without coordinates
    source: 'G00\n',
    expectedTokens: [t(Lexer.G_CODE, '0'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.INTERPOLATE_MODE, mode: MOVE}],
  },
  {
    // linear mode without coordinates
    source: 'G01\n',
    expectedTokens: [t(Lexer.G_CODE, '1'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.INTERPOLATE_MODE, mode: LINE}],
  },
  {
    // cw mode without coordinates
    source: 'G02\n',
    expectedTokens: [t(Lexer.G_CODE, '2'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.INTERPOLATE_MODE, mode: CW_ARC}],
  },
  {
    // ccw mode without coordinates
    source: 'G03\n',
    expectedTokens: [t(Lexer.G_CODE, '3'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.INTERPOLATE_MODE, mode: CCW_ARC}],
  },
  {
    // drill mode without coordinates
    source: 'G05\n',
    expectedTokens: [t(Lexer.G_CODE, '5'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [{type: Tree.INTERPOLATE_MODE, mode: DRILL}],
  },
  {
    // drill slot
    source: 'X07Y08G85X09Y10\n',
    expectedTokens: [
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
    expectedNodes: [
      {
        type: Tree.GRAPHIC,
        graphic: SLOT,
        coordinates: {x1: '07', y1: '08', x2: '09', y2: '10'},
      },
    ],
  },
  {
    // drill slot with modal coordinates
    source: 'X07G85Y10\n',
    expectedTokens: [
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '07'),
      t(Lexer.G_CODE, '85'),
      t(Lexer.COORD_CHAR, 'Y'),
      t(Lexer.NUMBER, '10'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expectedNodes: [
      {
        type: Tree.GRAPHIC,
        graphic: SLOT,
        coordinates: {x1: '07', y2: '10'},
      },
    ],
  },
]

describe('drill grammar matches', () => {
  SPECS.forEach(({source, expectedTokens, expectedNodes}) => {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      lexer.reset(source)

      const actualTokens = toArray((lexer as unknown) as Array<Lexer.Token>)
      const {tokens, nodes, filetype} = actualTokens.reduce<MatchState>(
        (state, token) => matchGrammar(state, token, grammar),
        null
      )

      expect(filetype).to.equal(DRILL)
      expect(nodes).to.eql(expectedNodes)
      expect(tokens.map(simplifyToken)).to.eql(
        expectedTokens.map(simplifyToken)
      )
    })
  })
})
