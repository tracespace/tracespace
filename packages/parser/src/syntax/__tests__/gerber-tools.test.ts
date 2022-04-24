// Gerber grammar tests
import {describe, it, expect} from 'vitest'

import * as Lexer from '../../lexer'
import * as Tree from '../../tree'
import {
  token as t,
  position as pos,
  simplifyTokens,
} from '../../__tests__/helpers'
import {matchSyntax, MatchState} from '..'

import {
  GERBER,
  CIRCLE,
  RECTANGLE,
  OBROUND,
  POLYGON,
  MACRO_SHAPE,
} from '../../constants'

const SPECS: Array<{
  source: string
  expectedTokens: Lexer.Token[]
  expectedNodes: Tree.ChildNode[]
}> = [
  {
    // Simple circle tool
    source: '%ADD10C,.025*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '10C'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '.025'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 13, 12]),
        code: '10',
        shape: {type: CIRCLE, diameter: 0.025},
        hole: null,
      },
    ],
  },
  {
    // Circle tool with circular hole
    source: '%ADD11C,0.5X0.25*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '11C'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.25'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 17, 16]),
        code: '11',
        shape: {type: CIRCLE, diameter: 0.5},
        hole: {type: CIRCLE, diameter: 0.25},
      },
    ],
  },
  {
    // Circle tool with rectangular hole
    source: '%ADD12C,10X5X5*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '12C'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '10'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '5'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 15, 14]),
        code: '12',
        shape: {type: CIRCLE, diameter: 10},
        hole: {type: RECTANGLE, xSize: 5, ySize: 5},
      },
    ],
  },
  {
    // Rectangle tool definition with no hole
    source: '%ADD13R,0.5X0.6*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '13R'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.6'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 16, 15]),
        code: '13',
        shape: {type: RECTANGLE, xSize: 0.5, ySize: 0.6},
        hole: null,
      },
    ],
  },
  {
    // Rectangle tool definition with circle hole
    source: '%ADD14R,0.5X0.6X0.2*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '14R'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.6'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.2'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 20, 19]),
        code: '14',
        shape: {type: RECTANGLE, xSize: 0.5, ySize: 0.6},
        hole: {type: CIRCLE, diameter: 0.2},
      },
    ],
  },
  {
    // Rectangle tool definition with rectangle hole
    source: '%ADD15R,0.5X0.6X0.2X0.1*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '15R'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.6'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.2'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.1'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 24, 23]),
        code: '15',
        shape: {type: RECTANGLE, xSize: 0.5, ySize: 0.6},
        hole: {type: RECTANGLE, xSize: 0.2, ySize: 0.1},
      },
    ],
  },
  {
    // Obround tool definition with no hole
    source: '%ADD16O,0.5X0.6*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '16O'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.6'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 16, 15]),
        code: '16',
        shape: {type: OBROUND, xSize: 0.5, ySize: 0.6},
        hole: null,
      },
    ],
  },
  {
    // Obround tool definition with circle hole
    source: '%ADD17O,0.5X0.6X0.2*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '17O'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.6'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.2'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 20, 19]),
        code: '17',
        shape: {type: OBROUND, xSize: 0.5, ySize: 0.6},
        hole: {type: CIRCLE, diameter: 0.2},
      },
    ],
  },
  {
    // Obround tool definition with rectangle hole
    source: '%ADD18O,0.5X0.6X0.2X0.1*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '18O'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.6'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.2'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.1'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 24, 23]),
        code: '18',
        shape: {type: OBROUND, xSize: 0.5, ySize: 0.6},
        hole: {type: RECTANGLE, xSize: 0.2, ySize: 0.1},
      },
    ],
  },
  {
    // Polygon tool definition with no rotation and no hole
    source: '%ADD19P,1.5X3*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '19P'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '1.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '3'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 14, 13]),
        code: '19',
        shape: {type: POLYGON, diameter: 1.5, vertices: 3, rotation: null},
        hole: null,
      },
    ],
  },
  {
    // Polygon tool definition with rotation and no hole
    source: '%ADD20P,2.5X4X12.5*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '20P'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '2.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '4'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '12.5'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 19, 18]),
        code: '20',
        shape: {type: POLYGON, diameter: 2.5, vertices: 4, rotation: 12.5},
        hole: null,
      },
    ],
  },
  {
    // Polygon tool definition with rotation and circle hole
    source: '%ADD21P,2.5X4X12.5X1*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '21P'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '2.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '4'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '12.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '1'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 21, 20]),
        code: '21',
        shape: {type: POLYGON, diameter: 2.5, vertices: 4, rotation: 12.5},
        hole: {type: CIRCLE, diameter: 1},
      },
    ],
  },
  {
    // Polygon tool definition with rotation and circle hole
    source: '%ADD22P,2.5X4X12.5X1X1.5*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '22P'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '2.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '4'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '12.5'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '1.5'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 25, 24]),
        code: '22',
        shape: {type: POLYGON, diameter: 2.5, vertices: 4, rotation: 12.5},
        hole: {type: RECTANGLE, xSize: 1, ySize: 1.5},
      },
    ],
  },
  {
    // Macro tool definition with no parameters
    source: '%ADD23MyMacro*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '23MyMacro'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 14, 13]),
        code: '23',
        shape: {type: MACRO_SHAPE, name: 'MyMacro', params: []},
        hole: null,
      },
    ],
  },
  {
    // Macro tool definition with parameters
    source: '%ADD24MyMacro,0.1X0.2X0.3*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_DEF, '24MyMacro'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.1'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.2'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '0.3'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_DEFINITION,
        position: pos([1, 2, 1], [1, 26, 25]),
        code: '24',
        shape: {type: MACRO_SHAPE, name: 'MyMacro', params: [0.1, 0.2, 0.3]},
        hole: null,
      },
    ],
  },
]

describe('gerber tool syntax matches', () => {
  for (const {source, expectedTokens, expectedNodes} of SPECS) {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      let result: MatchState | null = null

      lexer.reset(source)

      for (const token of lexer) {
        result = matchSyntax(result, token)
      }

      const {tokens, nodes, filetype} = result!

      expect(filetype).to.equal(GERBER)
      expect(nodes).to.eql(expectedNodes)
      expect(simplifyTokens(tokens)).to.eql(simplifyTokens(expectedTokens))
    })
  }
})
