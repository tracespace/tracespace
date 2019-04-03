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
  matchType: Grammar.GrammarMatch['type']
  tokens: Array<Lexer.Token>
  tree: Parent
  expected: Parent
}

const SPECS: {[name: string]: ReducerSpec} = {
  'tool change with blank image': {
    matchType: Grammar.GERBER_TOOL_CHANGE,
    tokens: [t(Lexer.D_CODE, '10'), t(Lexer.ASTERISK, '*')],
    tree: u(Nodes.ROOT, [u(Nodes.HEADER, []), u(Nodes.IMAGE, [])]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [u(Nodes.TOOL, {code: '10'}, [])]),
    ]),
  },
  'tool change with G54': {
    matchType: Grammar.GERBER_TOOL_CHANGE,
    tokens: [
      t(Lexer.G_CODE, '54'),
      t(Lexer.D_CODE, '42'),
      t(Lexer.ASTERISK, '*'),
    ],
    tree: u(Nodes.ROOT, [u(Nodes.HEADER, []), u(Nodes.IMAGE, [])]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [u(Nodes.TOOL, {code: '42'}, [])]),
    ]),
  },
  'tool change with existing tool image': {
    matchType: Grammar.GERBER_TOOL_CHANGE,
    tokens: [t(Lexer.D_CODE, '11'), t(Lexer.ASTERISK, '*')],
    tree: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [u(Nodes.TOOL, {code: '10'}, [])]),
    ]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [
        u(Nodes.TOOL, {code: '10'}, []),
        u(Nodes.TOOL, {code: '11'}, []),
      ]),
    ]),
  },
  'tool change in nested image': {
    matchType: Grammar.GERBER_TOOL_CHANGE,
    tokens: [t(Lexer.D_CODE, '12'), t(Lexer.ASTERISK, '*')],
    tree: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [u(Nodes.IMAGE, [])]),
    ]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [u(Nodes.IMAGE, [u(Nodes.TOOL, {code: '12'}, [])])]),
    ]),
  },
  'tool change in nested image with existing tools': {
    matchType: Grammar.GERBER_TOOL_CHANGE,
    tokens: [t(Lexer.D_CODE, '14'), t(Lexer.ASTERISK, '*')],
    tree: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [
        u(Nodes.TOOL, {code: '12'}, []),
        u(Nodes.IMAGE, [u(Nodes.TOOL, {code: '13'}, [])]),
      ]),
    ]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [
        u(Nodes.TOOL, {code: '12'}, []),
        u(Nodes.IMAGE, [
          u(Nodes.TOOL, {code: '13'}, []),
          u(Nodes.TOOL, {code: '14'}, []),
        ]),
      ]),
    ]),
  },
  'operation with no mode': {
    matchType: Grammar.GERBER_OPERATION,
    tokens: [
      t(Lexer.CHAR, 'X'),
      t(Lexer.NUMBER, '001'),
      t(Lexer.CHAR, 'Y'),
      t(Lexer.NUMBER, '002'),
      t(Lexer.ASTERISK, '*'),
    ],
    tree: u(Nodes.ROOT, [u(Nodes.HEADER, []), u(Nodes.IMAGE, [])]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [
        u(Nodes.GRAPHIC, {graphic: null, coordinates: {x: '001', y: '002'}}),
      ]),
    ]),
  },
  'flash operation': {
    matchType: Grammar.GERBER_OPERATION,
    tokens: [
      t(Lexer.CHAR, 'X'),
      t(Lexer.NUMBER, '001'),
      t(Lexer.CHAR, 'Y'),
      t(Lexer.NUMBER, '002'),
      t(Lexer.D_CODE, '3'),
      t(Lexer.ASTERISK, '*'),
    ],
    tree: u(Nodes.ROOT, [u(Nodes.HEADER, []), u(Nodes.IMAGE, [])]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [
        u(Nodes.GRAPHIC, {
          graphic: Nodes.SHAPE,
          coordinates: {x: '001', y: '002'},
        }),
      ]),
    ]),
  },
  'move operation': {
    matchType: Grammar.GERBER_OPERATION,
    tokens: [
      t(Lexer.CHAR, 'X'),
      t(Lexer.NUMBER, '001'),
      t(Lexer.CHAR, 'Y'),
      t(Lexer.NUMBER, '002'),
      t(Lexer.D_CODE, '2'),
      t(Lexer.ASTERISK, '*'),
    ],
    tree: u(Nodes.ROOT, [u(Nodes.HEADER, []), u(Nodes.IMAGE, [])]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [
        u(Nodes.GRAPHIC, {
          graphic: Nodes.MOVE,
          coordinates: {x: '001', y: '002'},
        }),
      ]),
    ]),
  },
  'interpolate operation': {
    matchType: Grammar.GERBER_OPERATION,
    tokens: [
      t(Lexer.CHAR, 'X'),
      t(Lexer.NUMBER, '001'),
      t(Lexer.CHAR, 'Y'),
      t(Lexer.NUMBER, '002'),
      t(Lexer.CHAR, 'I'),
      t(Lexer.NUMBER, '003'),
      t(Lexer.D_CODE, '1'),
      t(Lexer.ASTERISK, '*'),
    ],
    tree: u(Nodes.ROOT, [u(Nodes.HEADER, []), u(Nodes.IMAGE, [])]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, []),
      u(Nodes.IMAGE, [
        u(Nodes.GRAPHIC, {
          graphic: Nodes.SEGMENT,
          coordinates: {x: '001', y: '002', i: '003'},
        }),
      ]),
    ]),
  },
}

describe('tree reducer', () => {
  Object.keys(SPECS).forEach(name => {
    const {tree, matchType, tokens, expected} = SPECS[name]
    it(name, () => {
      expect(reducer(tree as Nodes.Root, matchType, tokens)).to.eql(expected)
    })
  })
})
