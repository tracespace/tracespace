// drill grammar tests
import {expect} from 'chai'
import {toArray} from 'lodash'

import * as Lexer from '../../lexer'
import * as Tree from '../../tree'
import {
  token as t,
  position as pos,
  simplifyToken,
} from '../../__tests__/helpers'
import {matchSyntax, MatchState} from '..'

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
    expectedNodes: [
      {
        type: Tree.DONE,
        position: pos([1, 1, 0], [1, 4, 3]),
      },
    ],
  },
  {
    // drill file end with M30
    source: 'M30\n',
    expectedTokens: [t(Lexer.M_CODE, '30'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.DONE,
        position: pos([1, 1, 0], [1, 4, 3]),
      },
    ],
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
    expectedNodes: [
      {
        type: Tree.COMMENT,
        position: pos([1, 1, 0], [1, 14, 13]),
        comment: 'hello world',
      },
    ],
  },
  {
    // drill inch units (new style)
    source: 'INCH\n',
    expectedTokens: [t(Lexer.DRILL_UNITS, 'INCH'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.UNITS,
        position: pos([1, 1, 0], [1, 5, 4]),
        units: IN,
      },
    ],
  },
  {
    // drill millimeter units (new style)
    source: 'METRIC\n',
    expectedTokens: [t(Lexer.DRILL_UNITS, 'METRIC'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.UNITS,
        position: pos([1, 1, 0], [1, 7, 6]),
        units: MM,
      },
    ],
  },
  {
    // drill inch units (old style)
    source: 'M72\n',
    expectedTokens: [t(Lexer.M_CODE, '72'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.UNITS,
        position: pos([1, 1, 0], [1, 4, 3]),
        units: IN,
      },
    ],
  },
  {
    // drill millimeter units (new style)
    source: 'M71\n',
    expectedTokens: [t(Lexer.M_CODE, '71'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.UNITS,
        position: pos([1, 1, 0], [1, 4, 3]),
        units: MM,
      },
    ],
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
      {
        type: Tree.UNITS,
        position: pos([1, 1, 0], [1, 5, 4]),
        units: IN,
      },
      {
        type: Tree.COORDINATE_FORMAT,
        position: pos([1, 5, 4], [1, 8, 7]),
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
      {
        type: Tree.UNITS,
        position: pos([1, 1, 0], [1, 4, 3]),
        units: MM,
      },
      {
        type: Tree.COORDINATE_FORMAT,
        position: pos([1, 4, 3], [1, 7, 6]),
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
      {
        type: Tree.UNITS,
        position: pos([1, 1, 0], [1, 4, 3]),
        units: IN,
      },
      {
        type: Tree.COORDINATE_FORMAT,
        position: pos([1, 4, 3], [1, 14, 13]),
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
      {
        type: Tree.UNITS,
        position: pos([1, 1, 0], [1, 7, 6]),
        units: MM,
      },
      {
        type: Tree.COORDINATE_FORMAT,
        position: pos([1, 7, 6], [1, 19, 18]),
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
        position: pos([1, 1, 0], [1, 9, 8]),
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
        position: pos([1, 1, 0], [1, 13, 12]),
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
    expectedNodes: [
      {
        type: Tree.TOOL_CHANGE,
        position: pos([1, 1, 0], [1, 4, 3]),
        code: '3',
      },
    ],
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
    expectedNodes: [
      {
        type: Tree.TOOL_CHANGE,
        position: pos([1, 1, 0], [1, 8, 7]),
        code: '4',
      },
    ],
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
      {
        type: Tree.GRAPHIC,
        position: pos([1, 1, 0], [1, 7, 6]),
        coordinates: {x: '01', y: '02'},
        graphic: null,
      },
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
      {
        type: Tree.TOOL_CHANGE,
        position: pos([1, 1, 0], [1, 4, 3]),
        code: '5',
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 4, 3], [1, 10, 9]),
        coordinates: {x: '01', y: '02'},
        graphic: null,
      },
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
      {
        type: Tree.TOOL_CHANGE,
        position: pos([1, 7, 6], [1, 10, 9]),
        code: '6',
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 1, 0], [1, 7, 6]),
        coordinates: {x: '01', y: '02'},
        graphic: null,
      },
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
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: MOVE,
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 4, 3], [1, 10, 9]),
        coordinates: {x: '05', y: '06'},
        graphic: null,
      },
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
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: LINE,
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 4, 3], [1, 10, 9]),
        coordinates: {x: '05', y: '06'},
        graphic: null,
      },
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
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: CW_ARC,
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 4, 3], [1, 16, 15]),
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
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: CCW_ARC,
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 4, 3], [1, 13, 12]),
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
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: DRILL,
      },
      {
        type: Tree.GRAPHIC,
        position: pos([1, 4, 3], [1, 10, 9]),
        coordinates: {x: '05', y: '06'},
        graphic: null,
      },
    ],
  },
  {
    // route mode without coordinates
    source: 'G00\n',
    expectedTokens: [t(Lexer.G_CODE, '0'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: MOVE,
      },
    ],
  },
  {
    // linear mode without coordinates
    source: 'G01\n',
    expectedTokens: [t(Lexer.G_CODE, '1'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: LINE,
      },
    ],
  },
  {
    // cw mode without coordinates
    source: 'G02\n',
    expectedTokens: [t(Lexer.G_CODE, '2'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: CW_ARC,
      },
    ],
  },
  {
    // ccw mode without coordinates
    source: 'G03\n',
    expectedTokens: [t(Lexer.G_CODE, '3'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: CCW_ARC,
      },
    ],
  },
  {
    // drill mode without coordinates
    source: 'G05\n',
    expectedTokens: [t(Lexer.G_CODE, '5'), t(Lexer.NEWLINE, '\n')],
    expectedNodes: [
      {
        type: Tree.INTERPOLATE_MODE,
        position: pos([1, 1, 0], [1, 4, 3]),
        mode: DRILL,
      },
    ],
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
        position: pos([1, 1, 0], [1, 16, 15]),
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
        position: pos([1, 1, 0], [1, 10, 9]),
        graphic: SLOT,
        coordinates: {x1: '07', y2: '10'},
      },
    ],
  },
]

describe('drill syntax matches', () => {
  SPECS.forEach(({source, expectedTokens, expectedNodes}) => {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      lexer.reset(source)

      const actualTokens = toArray((lexer as unknown) as Array<Lexer.Token>)
      const {tokens, nodes, filetype} = actualTokens.reduce<MatchState>(
        (state, token) => matchSyntax(state, token),
        null
      )
      const simpleTokens = tokens.map(simplifyToken)

      expect(filetype).to.equal(DRILL)
      expect(nodes).to.eql(expectedNodes)
      expect(simpleTokens).to.eql(expectedTokens.map(simplifyToken))
    })
  })
})
