// Gerber grammar tests
import {describe, it, expect} from 'vitest'

import * as Lexer from '../../lexer'
import * as Tree from '../../tree'
import {
  token as t,
  position as pos,
  simplifyTokens,
} from '../../__tests__/helpers'
import {matchSyntax} from '..'

import {
  GERBER,
  MACRO_CIRCLE,
  MACRO_VECTOR_LINE,
  MACRO_CENTER_LINE,
  MACRO_OUTLINE,
  MACRO_POLYGON,
  MACRO_MOIRE_DEPRECATED,
  MACRO_THERMAL,
} from '../../constants'

const SPECS: Array<{
  source: string
  expectedTokens: Lexer.Token[]
  expectedNodes: Tree.Child[]
}> = [
  {
    // Macro with comment primitive
    source: '%AMCOMMENT*0 hello world*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'COMMENT'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NUMBER, '0'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.WORD, 'hello'),
      t(Lexer.WHITESPACE, ' '),
      t(Lexer.WORD, 'world'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [1, 25, 24]),
        name: 'COMMENT',
        children: [
          {
            type: Tree.MACRO_COMMENT,
            position: pos([1, 12, 11], [1, 25, 24]),
            comment: 'hello world',
          },
        ],
      },
    ],
  },
  {
    // Macro with circle primitive
    source: '%AMCIRCLE*1,1,0.5,0,0*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'CIRCLE'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [1, 22, 21]),
        name: 'CIRCLE',
        children: [
          {
            type: Tree.MACRO_PRIMITIVE,
            position: pos([1, 11, 10], [1, 22, 21]),
            code: MACRO_CIRCLE,
            parameters: [1, 0.5, 0, 0],
          },
        ],
      },
    ],
  },
  {
    // Macro with vector primitive
    source: '%AMVECTOR*20,1,0.25,0,0,.5,.5,0*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'VECTOR'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NUMBER, '20'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.25'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [1, 32, 31]),
        name: 'VECTOR',
        children: [
          {
            type: Tree.MACRO_PRIMITIVE,
            position: pos([1, 11, 10], [1, 32, 31]),
            code: MACRO_VECTOR_LINE,
            parameters: [1, 0.25, 0, 0, 0.5, 0.5, 0],
          },
        ],
      },
    ],
  },
  {
    // Macro with center-line primitive
    source: '%AMCENTERLINE*21,1,0.5,0.25,0,0,0*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'CENTERLINE'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NUMBER, '21'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.25'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [1, 34, 33]),
        name: 'CENTERLINE',
        children: [
          {
            type: Tree.MACRO_PRIMITIVE,
            position: pos([1, 15, 14], [1, 34, 33]),
            code: MACRO_CENTER_LINE,
            parameters: [1, 0.5, 0.25, 0, 0, 0],
          },
        ],
      },
    ],
  },
  {
    // Macro with outline primitive
    source: '%AMOUTLINE*4,1,3,0,0,0,0.5,0.5,0.5,0,0,0*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'OUTLINE'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NUMBER, '4'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '3'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [1, 41, 40]),
        name: 'OUTLINE',
        children: [
          {
            type: Tree.MACRO_PRIMITIVE,
            position: pos([1, 12, 11], [1, 41, 40]),
            code: MACRO_OUTLINE,
            parameters: [1, 3, 0, 0, 0, 0.5, 0.5, 0.5, 0, 0, 0],
          },
        ],
      },
    ],
  },
  {
    // Macro with polygon primitive
    source: '%AMPOLYGON*5,1,5,0,0,0.5,0*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'POLYGON'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NUMBER, '5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [1, 27, 26]),
        name: 'POLYGON',
        children: [
          {
            type: Tree.MACRO_PRIMITIVE,
            position: pos([1, 12, 11], [1, 27, 26]),
            code: MACRO_POLYGON,
            parameters: [1, 5, 0, 0, 0.5, 0],
          },
        ],
      },
    ],
  },
  {
    // Macro with moire primitive
    source: '%AMMOIRE*6,0,0,0.5,0.04,0.03,2,0.01,0.55,0*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'MOIRE'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NUMBER, '6'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.04'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.03'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '2'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.01'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.55'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [1, 43, 42]),
        name: 'MOIRE',
        children: [
          {
            type: Tree.MACRO_PRIMITIVE,
            position: pos([1, 10, 9], [1, 43, 42]),
            code: MACRO_MOIRE_DEPRECATED,
            parameters: [0, 0, 0.5, 0.04, 0.03, 2, 0.01, 0.55, 0],
          },
        ],
      },
    ],
  },
  {
    // Macro with thermal primitive
    source: '%AMTHERMAL*7,0,0,0.5,0.4,0.1,0*%',
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'THERMAL'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NUMBER, '7'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.5'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.4'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0.1'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [1, 31, 30]),
        name: 'THERMAL',
        children: [
          {
            type: Tree.MACRO_PRIMITIVE,
            position: pos([1, 12, 11], [1, 31, 30]),
            code: MACRO_THERMAL,
            parameters: [0, 0, 0.5, 0.4, 0.1, 0],
          },
        ],
      },
    ],
  },
  {
    // Complex macro with parameters and values
    source: `%AMCOMPLEX*
$2=$1+14*
$3=-42-$1*
$4=$3/2*
$5=(1+(2-$4))x4*
1,1,$5+1,$2,0*
%`,
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'COMPLEX'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NEWLINE, '\n'),
      t(Lexer.GERBER_MACRO_VARIABLE, '$2'),
      t(Lexer.EQUALS, '='),
      t(Lexer.GERBER_MACRO_VARIABLE, '$1'),
      t(Lexer.NUMBER, '+14'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NEWLINE, '\n'),
      t(Lexer.GERBER_MACRO_VARIABLE, '$3'),
      t(Lexer.EQUALS, '='),
      t(Lexer.NUMBER, '-42'),
      t(Lexer.OPERATOR, '-'),
      t(Lexer.GERBER_MACRO_VARIABLE, '$1'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NEWLINE, '\n'),
      t(Lexer.GERBER_MACRO_VARIABLE, '$4'),
      t(Lexer.EQUALS, '='),
      t(Lexer.GERBER_MACRO_VARIABLE, '$3'),
      t(Lexer.OPERATOR, '/'),
      t(Lexer.NUMBER, '2'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NEWLINE, '\n'),
      t(Lexer.GERBER_MACRO_VARIABLE, '$5'),
      t(Lexer.EQUALS, '='),
      t(Lexer.OPERATOR, '('),
      t(Lexer.NUMBER, '1'),
      t(Lexer.OPERATOR, '+'),
      t(Lexer.OPERATOR, '('),
      t(Lexer.NUMBER, '2'),
      t(Lexer.OPERATOR, '-'),
      t(Lexer.GERBER_MACRO_VARIABLE, '$4'),
      t(Lexer.OPERATOR, ')'),
      t(Lexer.OPERATOR, ')'),
      t(Lexer.OPERATOR, 'x'),
      t(Lexer.NUMBER, '4'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NEWLINE, '\n'),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COMMA, ','),
      t(Lexer.GERBER_MACRO_VARIABLE, '$5'),
      t(Lexer.NUMBER, '+1'),
      t(Lexer.COMMA, ','),
      t(Lexer.GERBER_MACRO_VARIABLE, '$2'),
      t(Lexer.COMMA, ','),
      t(Lexer.NUMBER, '0'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NEWLINE, '\n'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [6, 15, 73]),
        name: 'COMPLEX',
        children: [
          {
            type: Tree.MACRO_VARIABLE,
            position: pos([2, 1, 12], [2, 9, 20]),
            name: '$2',
            value: {left: '$1', right: 14, operator: '+'},
          },
          {
            type: Tree.MACRO_VARIABLE,
            position: pos([3, 1, 22], [3, 10, 31]),
            name: '$3',
            value: {left: -42, right: '$1', operator: '-'},
          },
          {
            type: Tree.MACRO_VARIABLE,
            position: pos([4, 1, 33], [4, 8, 40]),
            name: '$4',
            value: {left: '$3', right: 2, operator: '/'},
          },
          {
            type: Tree.MACRO_VARIABLE,
            position: pos([5, 1, 42], [5, 16, 57]),
            name: '$5',
            value: {
              left: {
                left: 1,
                right: {left: 2, right: '$4', operator: '-'},
                operator: '+',
              },
              right: 4,
              operator: 'x',
            },
          },
          {
            type: Tree.MACRO_PRIMITIVE,
            position: pos([6, 1, 59], [6, 14, 72]),
            code: MACRO_CIRCLE,
            parameters: [1, {left: '$5', right: 1, operator: '+'}, '$2', 0],
          },
        ],
      },
    ],
  },
  {
    // Macro using `X` instead of `x` for multiplication
    source: `%AMBAD_MULTIPLY*
$1=1X2*
%`,
    expectedTokens: [
      t(Lexer.PERCENT, '%'),
      t(Lexer.GERBER_TOOL_MACRO, 'BAD_MULTIPLY'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NEWLINE, '\n'),
      t(Lexer.GERBER_MACRO_VARIABLE, '$1'),
      t(Lexer.EQUALS, '='),
      t(Lexer.NUMBER, '1'),
      t(Lexer.COORD_CHAR, 'X'),
      t(Lexer.NUMBER, '2'),
      t(Lexer.ASTERISK, '*'),
      t(Lexer.NEWLINE, '\n'),
      t(Lexer.PERCENT, '%'),
    ],
    expectedNodes: [
      {
        type: Tree.TOOL_MACRO,
        position: pos([1, 2, 1], [2, 8, 24]),
        name: 'BAD_MULTIPLY',
        children: [
          {
            type: Tree.MACRO_VARIABLE,
            position: pos([2, 1, 17], [2, 7, 23]),
            name: '$1',
            value: {left: 1, right: 2, operator: 'x'},
          },
        ],
      },
    ],
  },
]

describe('gerber macro syntax matches', () => {
  for (const {source, expectedTokens, expectedNodes} of SPECS) {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      const lexerResult = [...lexer.feed(source)]
      const tokens = lexerResult.map(([t]) => t)
      const result = matchSyntax(lexerResult)

      expect(result.filetype).to.equal(GERBER)
      expect(result.nodes).to.eql(expectedNodes)
      expect(simplifyTokens(tokens)).to.eql(simplifyTokens(expectedTokens))
    })
  }
})
