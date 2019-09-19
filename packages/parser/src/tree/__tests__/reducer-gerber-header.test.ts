// tree reducer test
import {expect} from 'chai'
import u from 'unist-builder'
import {Parent} from 'unist'

import * as Lexer from '../../lexer'
import * as Grammar from '../../grammar'
import {token as t} from '../../__tests__/helpers'
import * as Nodes from '../nodes'
import {reducer} from '../reducer'

type ReducerSpec = {
  header?: Parent
  image?: Parent
  match: Grammar.GrammarMatch<Grammar.GerberGrammarType>
  expectedHeader: Parent
}

const wrapExtended = (tokens: Lexer.Token[]): Lexer.Token[] => [
  t(Lexer.PERCENT, '%'),
  ...tokens,
  t(Lexer.ASTERISK, '*'),
  t(Lexer.PERCENT, '%'),
]

const SPECS: {[name: string]: ReducerSpec} = {
  'comment in header': {
    match: {
      type: Grammar.GERBER_COMMENT,
      tokens: [
        t(Lexer.G_CODE, '4'),
        t(Lexer.WHITESPACE, ' '),
        t(Lexer.WORD, 'hello'),
        t(Lexer.ASTERISK, '*'),
      ],
    },
    expectedHeader: u(Nodes.HEADER, [u(Nodes.COMMENT, {value: 'hello'})]),
  },
  'gerber units %MOMM*%': {
    match: {
      type: Grammar.GERBER_UNITS,
      tokens: wrapExtended([t(Lexer.GERBER_UNITS, 'MM')]),
    },
    expectedHeader: u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'mm'})]),
  },
  'gerber units %MOIN*%': {
    match: {
      type: Grammar.GERBER_UNITS,
      tokens: wrapExtended([t(Lexer.GERBER_UNITS, 'IN')]),
    },
    expectedHeader: u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'in'})]),
  },
  'gerber format leading, absolute': {
    match: {
      type: Grammar.GERBER_FORMAT,
      tokens: wrapExtended([
        t(Lexer.GERBER_FORMAT, 'LA'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '34'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '34'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.COORDINATE_FORMAT, {
        format: [3, 4],
        zeroSuppression: Nodes.LEADING,
        mode: Nodes.ABSOLUTE,
      }),
    ]),
  },
  'gerber format trailing, incremental': {
    match: {
      type: Grammar.GERBER_FORMAT,
      tokens: wrapExtended([
        t(Lexer.GERBER_FORMAT, 'TI'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '45'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '45'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.COORDINATE_FORMAT, {
        format: [4, 5],
        zeroSuppression: Nodes.TRAILING,
        mode: Nodes.INCREMENTAL,
      }),
    ]),
  },
  'gerber format with stuff missing and extra cruft': {
    match: {
      type: Grammar.GERBER_FORMAT,
      tokens: wrapExtended([
        t(Lexer.GERBER_FORMAT, 'DA'),
        t(Lexer.WORD, 'N'),
        t(Lexer.NUMBER, '2'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '22'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '22'),
        t(Lexer.WORD, 'Z'),
        t(Lexer.NUMBER, '2'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.COORDINATE_FORMAT, {
        format: [2, 2],
        zeroSuppression: null,
        mode: Nodes.ABSOLUTE,
      }),
    ]),
  },
  'circle tool definition with no hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '10C'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '.025'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '10',
        shape: {type: Nodes.CIRCLE, diameter: 0.025},
        hole: null,
      }),
    ]),
  },
  'circle tool definition with circle hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '11C'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '0.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.1'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '11',
        shape: {type: Nodes.CIRCLE, diameter: 0.5},
        hole: {type: Nodes.CIRCLE, diameter: 0.1},
      }),
    ]),
  },
  'circle tool definition with rectangle hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '12C'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '0.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.1'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.2'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '12',
        shape: {type: Nodes.CIRCLE, diameter: 0.5},
        hole: {type: Nodes.RECTANGLE, xSize: 0.1, ySize: 0.2},
      }),
    ]),
  },
  'rectangle tool definition with no hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '13R'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '0.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.6'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '13',
        shape: {type: Nodes.RECTANGLE, xSize: 0.5, ySize: 0.6},
        hole: null,
      }),
    ]),
  },
  'rectangle tool definition with circle hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '14R'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '0.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.6'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.2'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '14',
        shape: {type: Nodes.RECTANGLE, xSize: 0.5, ySize: 0.6},
        hole: {type: Nodes.CIRCLE, diameter: 0.2},
      }),
    ]),
  },
  'rectangle tool definition with rectangle hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '15R'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '0.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.6'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.2'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.1'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '15',
        shape: {type: Nodes.RECTANGLE, xSize: 0.5, ySize: 0.6},
        hole: {type: Nodes.RECTANGLE, xSize: 0.2, ySize: 0.1},
      }),
    ]),
  },
  'obround tool definition with no hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '16O'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '0.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.6'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '16',
        shape: {type: Nodes.OBROUND, xSize: 0.5, ySize: 0.6},
        hole: null,
      }),
    ]),
  },
  'obround tool definition with circle hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '17O'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '0.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.6'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.2'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '17',
        shape: {type: Nodes.OBROUND, xSize: 0.5, ySize: 0.6},
        hole: {type: Nodes.CIRCLE, diameter: 0.2},
      }),
    ]),
  },
  'obround tool definition with rectangle hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '18O'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '0.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.6'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.2'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '0.1'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '18',
        shape: {type: Nodes.OBROUND, xSize: 0.5, ySize: 0.6},
        hole: {type: Nodes.RECTANGLE, xSize: 0.2, ySize: 0.1},
      }),
    ]),
  },
  'polygon tool definition with no rotation and no hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '19P'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '1.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '3'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '19',
        shape: {
          type: Nodes.POLYGON,
          diameter: 1.5,
          vertices: 3,
          rotation: null,
        },
        hole: null,
      }),
    ]),
  },
  'polygon tool defintion with rotation and no hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '20P'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '2.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '4'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '12.5'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '20',
        shape: {
          type: Nodes.POLYGON,
          diameter: 2.5,
          vertices: 4,
          rotation: 12.5,
        },
        hole: null,
      }),
    ]),
  },
  'polygon tool definition with rotation and circle hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
        t(Lexer.GERBER_TOOL_DEF, '21P'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '2.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '4'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '12.5'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '1'),
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '21',
        shape: {
          type: Nodes.POLYGON,
          diameter: 2.5,
          vertices: 4,
          rotation: 12.5,
        },
        hole: {type: Nodes.CIRCLE, diameter: 1},
      }),
    ]),
  },
  'polygon tool definition with rotation and rectangle hole': {
    match: {
      type: Grammar.GERBER_TOOL_DEFINITION,
      tokens: wrapExtended([
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
      ]),
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '22',
        shape: {
          type: Nodes.POLYGON,
          diameter: 2.5,
          vertices: 4,
          rotation: 12.5,
        },
        hole: {type: Nodes.RECTANGLE, xSize: 1, ySize: 1.5},
      }),
    ]),
  },
}

describe('tree reducer for gerber file headers', () => {
  Object.keys(SPECS).forEach(name => {
    const {
      header = u(Nodes.HEADER, []),
      image = u(Nodes.IMAGE, []),
      match,
      expectedHeader,
    } = SPECS[name]

    it(name, () => {
      const tree = u(Nodes.ROOT, [header, image])
      const expectedTree = u(Nodes.ROOT, [expectedHeader, image])

      expect(reducer(tree as Nodes.Root, match)).to.eql(expectedTree)
    })
  })
})
