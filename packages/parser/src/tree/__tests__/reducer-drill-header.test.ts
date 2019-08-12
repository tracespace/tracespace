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
  matchType: Grammar.GrammarMatch['type']
  tokens: Array<Lexer.Token>
  expected: Parent
}

const SPECS: {[name: string]: ReducerSpec} = {
  'comment in header': {
    matchType: Grammar.DRILL_COMMENT,
    tokens: [
      t(Lexer.SEMICOLON, ';'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.WORD, 'hello'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [u(Nodes.COMMENT, {value: 'hello'})]),
      u(Nodes.IMAGE, []),
    ]),
  },
  'drill units INCH': {
    matchType: Grammar.DRILL_UNITS,
    tokens: [t(Lexer.DRILL_UNITS, 'INCH'), t(Lexer.NEWLINE, '\n')],
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'in'})]),
      u(Nodes.IMAGE, []),
    ]),
  },
  'drill units METRIC': {
    matchType: Grammar.DRILL_UNITS,
    tokens: [t(Lexer.DRILL_UNITS, 'METRIC'), t(Lexer.NEWLINE, '\n')],
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'mm'})]),
      u(Nodes.IMAGE, []),
    ]),
  },
  'drill units M71': {
    matchType: Grammar.DRILL_UNITS,
    tokens: [t(Lexer.M_CODE, '71'), t(Lexer.NEWLINE, '\n')],
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'mm'})]),
      u(Nodes.IMAGE, []),
    ]),
  },
  'drill units M72': {
    matchType: Grammar.DRILL_UNITS,
    tokens: [t(Lexer.M_CODE, '72'), t(Lexer.NEWLINE, '\n')],
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'in'})]),
      u(Nodes.IMAGE, []),
    ]),
  },
  'drill units with zero inclusion': {
    matchType: Grammar.DRILL_UNITS,
    tokens: [
      t(Lexer.DRILL_UNITS, 'INCH'),
      t(Lexer.DRILL_ZERO_INCLUSION, 'TZ'),
      t(Lexer.NEWLINE, '\n'),
    ],
    tree: u(Nodes.ROOT, [u(Nodes.HEADER, []), u(Nodes.IMAGE, [])]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [
        u(Nodes.UNITS, {units: 'in'}),
        u(Nodes.COORDINATE_FORMAT, {
          mode: null,
          format: null,
          zeroSuppression: 'leading',
        }),
      ]),
      u(Nodes.IMAGE, []),
    ]),
  },
  'drill units with format': {
    matchType: Grammar.DRILL_UNITS,
    tokens: [
      t(Lexer.DRILL_UNITS, 'METRIC'),
      t(Lexer.DRILL_COORD_FORMAT, '00.000'),
      t(Lexer.NEWLINE, '\n'),
    ],
    tree: u(Nodes.ROOT, [u(Nodes.HEADER, []), u(Nodes.IMAGE, [])]),
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [
        u(Nodes.UNITS, {units: 'mm'}),
        u(Nodes.COORDINATE_FORMAT, {
          mode: null,
          format: [2, 3],
          zeroSuppression: null,
        }),
      ]),
      u(Nodes.IMAGE, []),
    ]),
  },
  'drill units with format and zero inclusion': {
    matchType: Grammar.DRILL_UNITS,
    tokens: [
      t(Lexer.M_CODE, 'M72'),
      t(Lexer.DRILL_ZERO_INCLUSION, 'LZ'),
      t(Lexer.DRILL_COORD_FORMAT, '000.00000'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [
        u(Nodes.UNITS, {units: 'in'}),
        u(Nodes.COORDINATE_FORMAT, {
          mode: null,
          format: [3, 5],
          zeroSuppression: 'trailing',
        }),
      ]),
      u(Nodes.IMAGE, []),
    ]),
  },
  'drill tool definition': {
    matchType: Grammar.DRILL_TOOL_DEFINITION,
    tokens: [
      t(Lexer.T_CODE, '11'),
      t(Lexer.DRILL_TOOL_PROPS, 'C1.234'),
      t(Lexer.NEWLINE, '\n'),
    ],
    expected: u(Nodes.ROOT, [
      u(Nodes.HEADER, [
        u(Nodes.TOOL_DEFINITION, {
          code: '11',
          shape: {type: 'circle', diameter: 1.234},
          hole: null,
        }),
      ]),
      u(Nodes.IMAGE, []),
    ]),
  },
}

describe('tree reducer for drill file headers', () => {
  Object.keys(SPECS).forEach(name => {
    const {
      header = u(Nodes.HEADER, []),
      image = u(Nodes.IMAGE, []),
      matchType,
      tokens,
      expected,
    } = SPECS[name]

    it(name, () => {
      const tree = u(Nodes.ROOT, [header, image])
      expect(reducer(tree as Nodes.Root, matchType, tokens)).to.eql(expected)
    })
  })
})
