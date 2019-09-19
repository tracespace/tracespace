// tree reducer test for drill file headers
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
  expectedHeader: Parent
}

const SPECS: {[name: string]: ReducerSpec} = {
  'comment in header': {
    match: {
      type: Grammar.DRILL_COMMENT,
      tokens: [
        t(Lexer.SEMICOLON, ';'),
        t(Lexer.WHITESPACE, ' '),
        t(Lexer.WORD, 'hello'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedHeader: u(Nodes.HEADER, [u(Nodes.COMMENT, {value: 'hello'})]),
  },
  'drill units INCH': {
    match: {
      type: Grammar.DRILL_UNITS,
      tokens: [t(Lexer.DRILL_UNITS, 'INCH'), t(Lexer.NEWLINE, '\n')],
    },
    expectedHeader: u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'in'})]),
  },
  'drill units METRIC': {
    match: {
      type: Grammar.DRILL_UNITS,
      tokens: [t(Lexer.DRILL_UNITS, 'METRIC'), t(Lexer.NEWLINE, '\n')],
    },
    expectedHeader: u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'mm'})]),
  },
  'drill units M71': {
    match: {
      type: Grammar.DRILL_UNITS,
      tokens: [t(Lexer.M_CODE, '71'), t(Lexer.NEWLINE, '\n')],
    },
    expectedHeader: u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'mm'})]),
  },
  'drill units M72': {
    match: {
      type: Grammar.DRILL_UNITS,
      tokens: [t(Lexer.M_CODE, '72'), t(Lexer.NEWLINE, '\n')],
    },
    expectedHeader: u(Nodes.HEADER, [u(Nodes.UNITS, {units: 'in'})]),
  },
  'drill units with zero inclusion': {
    match: {
      type: Grammar.DRILL_UNITS,
      tokens: [
        t(Lexer.DRILL_UNITS, 'INCH'),
        t(Lexer.DRILL_ZERO_INCLUSION, 'TZ'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.UNITS, {units: 'in'}),
      u(Nodes.COORDINATE_FORMAT, {
        mode: null,
        format: null,
        zeroSuppression: 'leading',
      }),
    ]),
  },
  'drill units with format': {
    match: {
      type: Grammar.DRILL_UNITS,
      tokens: [
        t(Lexer.DRILL_UNITS, 'METRIC'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '00.000'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.UNITS, {units: 'mm'}),
      u(Nodes.COORDINATE_FORMAT, {
        mode: null,
        format: [2, 3],
        zeroSuppression: null,
      }),
    ]),
  },
  'drill units with format and zero inclusion': {
    match: {
      type: Grammar.DRILL_UNITS,
      tokens: [
        t(Lexer.M_CODE, 'M72'),
        t(Lexer.DRILL_ZERO_INCLUSION, 'LZ'),
        t(Lexer.COMMA, ','),
        t(Lexer.NUMBER, '000.00000'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.UNITS, {units: 'in'}),
      u(Nodes.COORDINATE_FORMAT, {
        mode: null,
        format: [3, 5],
        zeroSuppression: 'trailing',
      }),
    ]),
  },
  'drill tool definition': {
    match: {
      type: Grammar.DRILL_TOOL_DEFINITION,
      tokens: [
        t(Lexer.T_CODE, '11'),
        t(Lexer.DRILL_TOOL_PROPS, 'C1.234'),
        t(Lexer.NEWLINE, '\n'),
      ],
    },
    expectedHeader: u(Nodes.HEADER, [
      u(Nodes.TOOL_DEFINITION, {
        code: '11',
        shape: {type: 'circle', diameter: 1.234},
        hole: null,
      }),
    ]),
  },
}

describe('tree reducer for drill file headers', () => {
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
