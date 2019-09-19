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
  match: Grammar.GrammarMatch<Grammar.GrammarRuleType>
  expectedImage: Parent
}

const SPECS: {[name: string]: ReducerSpec} = {
  'tool change': {
    match: {
      type: Grammar.GERBER_TOOL_CHANGE,
      tokens: [t(Lexer.D_CODE, '10'), t(Lexer.ASTERISK, '*')],
    },
    expectedImage: u(Nodes.IMAGE, [u(Nodes.TOOL_CHANGE, {code: '10'})]),
  },
  'tool change with G54': {
    match: {
      type: Grammar.GERBER_TOOL_CHANGE,
      tokens: [
        t(Lexer.G_CODE, '54'),
        t(Lexer.D_CODE, '42'),
        t(Lexer.ASTERISK, '*'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [u(Nodes.TOOL_CHANGE, {code: '42'})]),
  },
  'tool change with existing tool image': {
    match: {
      type: Grammar.GERBER_TOOL_CHANGE,
      tokens: [t(Lexer.D_CODE, '11'), t(Lexer.ASTERISK, '*')],
    },
    image: u(Nodes.IMAGE, [u(Nodes.TOOL_CHANGE, {code: '10'})]),
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.TOOL_CHANGE, {code: '10'}),
      u(Nodes.TOOL_CHANGE, {code: '11'}),
    ]),
  },
  'interpolation mode line (G01)': {
    match: {
      type: Grammar.GERBER_INTERPOLATE_MODE,
      tokens: [t(Lexer.G_CODE, '1'), t(Lexer.ASTERISK, '*')],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.INTERPOLATE_MODE, {mode: Nodes.LINE}),
    ]),
  },
  'interpolation mode CW arc (G02)': {
    match: {
      type: Grammar.GERBER_INTERPOLATE_MODE,
      tokens: [t(Lexer.G_CODE, '2'), t(Lexer.ASTERISK, '*')],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.INTERPOLATE_MODE, {mode: Nodes.CW_ARC}),
    ]),
  },
  'interpolation mode CCW arc (G03)': {
    match: {
      type: Grammar.GERBER_INTERPOLATE_MODE,
      tokens: [t(Lexer.G_CODE, '3'), t(Lexer.ASTERISK, '*')],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.INTERPOLATE_MODE, {mode: Nodes.CCW_ARC}),
    ]),
  },
  'region mode on (G36)': {
    match: {
      type: Grammar.GERBER_REGION_MODE,
      tokens: [t(Lexer.G_CODE, '36'), t(Lexer.ASTERISK, '*')],
    },
    expectedImage: u(Nodes.IMAGE, [u(Nodes.REGION_MODE, {region: true})]),
  },
  'region mode off (G37)': {
    match: {
      type: Grammar.GERBER_REGION_MODE,
      tokens: [t(Lexer.G_CODE, '37'), t(Lexer.ASTERISK, '*')],
    },
    expectedImage: u(Nodes.IMAGE, [u(Nodes.REGION_MODE, {region: false})]),
  },
  'single-quadrant mode (G74)': {
    match: {
      type: Grammar.GERBER_QUADRANT_MODE,
      tokens: [t(Lexer.G_CODE, '74'), t(Lexer.ASTERISK, '*')],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.QUADRANT_MODE, {quadrant: 'single'}),
    ]),
  },
  'multi-quadrant mode (G75)': {
    match: {
      type: Grammar.GERBER_QUADRANT_MODE,
      tokens: [t(Lexer.G_CODE, '75'), t(Lexer.ASTERISK, '*')],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.QUADRANT_MODE, {quadrant: 'multi'}),
    ]),
  },
  'operation with no mode': {
    match: {
      type: Grammar.GERBER_OPERATION,
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.ASTERISK, '*'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.GRAPHIC, {graphic: null, coordinates: {x: '001', y: '002'}}),
    ]),
  },
  'flash operation': {
    match: {
      type: Grammar.GERBER_OPERATION,
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.D_CODE, '3'),
        t(Lexer.ASTERISK, '*'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.GRAPHIC, {
        graphic: Nodes.SHAPE,
        coordinates: {x: '001', y: '002'},
      }),
    ]),
  },
  'move operation': {
    match: {
      type: Grammar.GERBER_OPERATION,
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.D_CODE, '2'),
        t(Lexer.ASTERISK, '*'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.GRAPHIC, {
        graphic: Nodes.MOVE,
        coordinates: {x: '001', y: '002'},
      }),
    ]),
  },
  'interpolate operation': {
    match: {
      type: Grammar.GERBER_OPERATION,
      tokens: [
        t(Lexer.COORD_CHAR, 'X'),
        t(Lexer.NUMBER, '001'),
        t(Lexer.COORD_CHAR, 'Y'),
        t(Lexer.NUMBER, '002'),
        t(Lexer.COORD_CHAR, 'I'),
        t(Lexer.NUMBER, '003'),
        t(Lexer.D_CODE, '1'),
        t(Lexer.ASTERISK, '*'),
      ],
    },
    expectedImage: u(Nodes.IMAGE, [
      u(Nodes.GRAPHIC, {
        graphic: Nodes.SEGMENT,
        coordinates: {x: '001', y: '002', i: '003'},
      }),
    ]),
  },
}

describe('tree reducer for gerber file images', () => {
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
