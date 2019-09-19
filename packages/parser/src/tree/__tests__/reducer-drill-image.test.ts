// tree reducer test for drill file images
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
  match: Grammar.GrammarMatch<Grammar.GrammarRuleType>
  expectedImage: Parent
}

const SPECS: {[name: string]: ReducerSpec} = {
  'comment in image': {
    match: {
      type: Grammar.DRILL_COMMENT,
      tokens: [
        t(Lexer.SEMICOLON, ';'),
        t(Lexer.WHITESPACE, ' '),
        t(Lexer.WORD, 'world'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    image: u(Nodes.IMAGE, [u(Nodes.COMMENT, {value: 'hello'})]),
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.COMMENT, {value: 'hello'}),
      u(Nodes.COMMENT, {value: 'world'}),
    ]),
  },
  'tool change': {
    match: {
      type: Grammar.DRILL_TOOL_CHANGE,
      tokens: [t(Lexer.T_CODE, '42'), t(Lexer.NEWLINE, '\n')],
    },
    expectedImage: u(Nodes.IMAGE, [u(Nodes.TOOL_CHANGE, {code: '42'})]),
  },
  'tool change with existing image': {
    match: {
      type: Grammar.DRILL_TOOL_CHANGE,
      tokens: [t(Lexer.T_CODE, '21'), t(Lexer.NEWLINE, '\n')],
    },
    image: u(Nodes.IMAGE, [u(Nodes.TOOL_CHANGE, {code: '42'})]),
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.TOOL_CHANGE, {code: '42'}),
      u(Nodes.TOOL_CHANGE, {code: '21'}),
    ]),
  },
  'default drill operation (hit)': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '123'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '456'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.GRAPHIC, {graphic: null, coordinates: {x: '123', y: '456'}}),
    ]),
  },
  'drill hit after tool has been set': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '123'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '456'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    image: u(Nodes.IMAGE, [u(Nodes.TOOL_CHANGE, {code: '42'})]),
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.TOOL_CHANGE, {code: '42'}),
      u(Nodes.GRAPHIC, {graphic: null, coordinates: {x: '123', y: '456'}}),
    ]),
  },
  'drill hit with tool code inline before coordinates': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [
        t(Lexer.T_CODE, '42'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '123'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '456'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.TOOL_CHANGE, {code: '42'}),
      u(Nodes.GRAPHIC, {graphic: null, coordinates: {x: '123', y: '456'}}),
    ]),
  },
  'drill hit with tool code inline after coordinates': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '123'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '456'),
        t(Lexer.T_CODE, '42'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.TOOL_CHANGE, {code: '42'}),
      u(Nodes.GRAPHIC, {graphic: null, coordinates: {x: '123', y: '456'}}),
    ]),
  },
  'drill slot': {
    match: {
      type: Grammar.DRILL_SLOT,
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '12'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '34'),
        t(Lexer.G_CODE, '85'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '56'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '78'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.GRAPHIC, {
        graphic: 'slot',
        coordinates: {x1: '12', y1: '34', x2: '56', y2: '78'},
      }),
    ]),
  },
  'drill route mode enable': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [
        t(Lexer.G_CODE, '0'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '12'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '34'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.INTERPOLATE_MODE, {mode: 'move'}),
      u(Nodes.GRAPHIC, {graphic: null, coordinates: {x: '12', y: '34'}}),
    ]),
  },
  'drill route line': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [
        t(Lexer.G_CODE, '1'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '12'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '34'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.INTERPOLATE_MODE, {mode: 'line'}),
      u(Nodes.GRAPHIC, {graphic: null, coordinates: {x: '12', y: '34'}}),
    ]),
  },
  'drill route clockwise arc': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [
        t(Lexer.G_CODE, '2'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '12'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '34'),
        t(Lexer.COORD_CHAR, 'I'),
        t(Lexer.NUMBER, '56'),
        t(Lexer.COORD_CHAR, 'J'),
        t(Lexer.NUMBER, '78'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.INTERPOLATE_MODE, {mode: 'cwArc'}),
      u(Nodes.GRAPHIC, {
        graphic: null,
        coordinates: {x: '12', y: '34', i: '56', j: '78'},
      }),
    ]),
  },
  'drill route counter clockwise arc': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [
        t(Lexer.G_CODE, '3'),
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '12'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '34'),
        t(Lexer.COORD_CHAR, 'A'),
        t(Lexer.NUMBER, '56'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.INTERPOLATE_MODE, {mode: 'ccwArc'}),
      u(Nodes.GRAPHIC, {
        graphic: null,
        coordinates: {x: '12', y: '34', a: '56'},
      }),
    ]),
  },
  'drill route mode disable': {
    match: {
      type: Grammar.DRILL_OPERATION,
      tokens: [t(Lexer.G_CODE, '5'), t(Lexer.NEWLINE, '\n')],
    },
    expectedImage: u(Nodes.IMAGE, [u(Nodes.INTERPOLATE_MODE, {mode: null})]),
  },
}

describe('tree reducer for drill file images', () => {
  Object.keys(SPECS).forEach(name => {
    const {
      header = u(Nodes.HEADER, []),
      image = u(Nodes.IMAGE, []),
      match,
      expectedImage,
    } = SPECS[name]

    it(name, () => {
      const tree = u(Nodes.ROOT, [header, image])
      const expectedTree = u(Nodes.ROOT, [header, expectedImage])

      expect(reducer(tree as Nodes.Root, match)).to.eql(expectedTree)
    })
  })
})
