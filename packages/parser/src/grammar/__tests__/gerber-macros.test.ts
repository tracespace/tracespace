// gerber grammar tests
import {expect} from 'chai'
import {toArray} from 'lodash'

import * as Lexer from '../../lexer'
import * as Tree from '../../tree'
import {token as t, simplifyToken} from '../../__tests__/helpers'
import {grammar, matchGrammar, MatchState} from '..'

import {
  GERBER,
  MACRO_COMMENT,
  MACRO_PRIMITIVE,
  MACRO_CIRCLE,
  MACRO_VECTOR_LINE,
  MACRO_CENTER_LINE,
  MACRO_OUTLINE,
  MACRO_POLYGON,
  MACRO_MOIRE,
  MACRO_THERMAL,
  MACRO_VARIABLE,
} from '../../constants'

const SPECS: Array<{
  source: string
  expectedTokens: Lexer.Token[]
  expectedNodes: Tree.ChildNode[]
}> = [
  {
    // macro with comment primitive
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
        name: 'COMMENT',
        blocks: [{type: MACRO_COMMENT, comment: 'hello world'}],
      },
    ],
  },
  {
    // macro with circle primitive
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
        name: 'CIRCLE',
        blocks: [
          {
            type: MACRO_PRIMITIVE,
            code: MACRO_CIRCLE,
            modifiers: [1, 0.5, 0, 0],
          },
        ],
      },
    ],
  },
  {
    // macro with vector primitive
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
        name: 'VECTOR',
        blocks: [
          {
            type: MACRO_PRIMITIVE,
            code: MACRO_VECTOR_LINE,
            modifiers: [1, 0.25, 0, 0, 0.5, 0.5, 0],
          },
        ],
      },
    ],
  },
  {
    // macro with center-line primitive
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
        name: 'CENTERLINE',
        blocks: [
          {
            type: MACRO_PRIMITIVE,
            code: MACRO_CENTER_LINE,
            modifiers: [1, 0.5, 0.25, 0, 0, 0],
          },
        ],
      },
    ],
  },
  {
    // macro with outline primitive
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
        name: 'OUTLINE',
        blocks: [
          {
            type: MACRO_PRIMITIVE,
            code: MACRO_OUTLINE,
            modifiers: [1, 3, 0, 0, 0, 0.5, 0.5, 0.5, 0, 0, 0],
          },
        ],
      },
    ],
  },
  {
    // macro with polygon primitive
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
        name: 'POLYGON',
        blocks: [
          {
            type: MACRO_PRIMITIVE,
            code: MACRO_POLYGON,
            modifiers: [1, 5, 0, 0, 0.5, 0],
          },
        ],
      },
    ],
  },
  {
    // macro with moire primitive
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
        name: 'MOIRE',
        blocks: [
          {
            type: MACRO_PRIMITIVE,
            code: MACRO_MOIRE,
            modifiers: [0, 0, 0.5, 0.04, 0.03, 2, 0.01, 0.55, 0],
          },
        ],
      },
    ],
  },
  {
    // macro with thermal primitive
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
        name: 'THERMAL',
        blocks: [
          {
            type: MACRO_PRIMITIVE,
            code: MACRO_THERMAL,
            modifiers: [0, 0, 0.5, 0.4, 0.1, 0],
          },
        ],
      },
    ],
  },
  {
    // complex macro with parameters and values
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
        name: 'COMPLEX',
        blocks: [
          {
            type: MACRO_VARIABLE,
            name: '$2',
            value: {left: '$1', right: 14, operator: '+'},
          },
          {
            type: MACRO_VARIABLE,
            name: '$3',
            value: {left: -42, right: '$1', operator: '-'},
          },
          {
            type: MACRO_VARIABLE,
            name: '$4',
            value: {left: '$3', right: 2, operator: '/'},
          },
          {
            type: MACRO_VARIABLE,
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
            type: MACRO_PRIMITIVE,
            code: MACRO_CIRCLE,
            modifiers: [1, {left: '$5', right: 1, operator: '+'}, '$2', 0],
          },
        ],
      },
    ],
  },
]

describe('gerber tool grammar matches', () => {
  SPECS.forEach(({source, expectedTokens, expectedNodes}) => {
    it(`should match on ${source.trim()}`, () => {
      const lexer = Lexer.createLexer()
      lexer.reset(source)

      const actualTokens = toArray((lexer as unknown) as Array<Lexer.Token>)
      const {tokens, nodes, filetype} = actualTokens.reduce<MatchState>(
        (state, token) => matchGrammar(state, token, grammar),
        null
      )

      expect(filetype).to.equal(GERBER)
      expect(nodes).to.eql(expectedNodes)
      expect(tokens.map(simplifyToken)).to.eql(
        expectedTokens.map(simplifyToken)
      )
    })
  })
})
