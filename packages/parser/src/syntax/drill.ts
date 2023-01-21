// Drill file grammar
import * as Lexer from '../lexer'
import * as Tree from '../tree'
import * as Constants from '../constants'
import type * as Types from '../types'
import type {SyntaxRule} from './rules'
import {token, notToken, one, zeroOrOne, zeroOrMore, minToMax} from './rules'

import {
  tokensToCoordinates,
  tokensToMode,
  tokensToString,
  tokensToPosition,
} from './map-tokens'

const units: SyntaxRule = {
  name: 'units',
  rules: [
    one([
      token(Lexer.DRILL_UNITS),
      token(Lexer.M_CODE, '71'),
      token(Lexer.M_CODE, '72'),
    ]),
    zeroOrMore([
      token(Lexer.COMMA),
      token(Lexer.DRILL_ZERO_INCLUSION),
      token(Lexer.NUMBER, /^0{1,8}\.0{1,8}$/),
    ]),
    token(Lexer.NEWLINE),
  ],
  createNodes(tokens) {
    const units =
      tokens[0].value === 'INCH' || tokens[0].value === '72'
        ? Constants.IN
        : Constants.MM

    const zeroSuppression = tokens
      .filter(t => t.type === Lexer.DRILL_ZERO_INCLUSION)
      .map(t => (t.value === 'LZ' ? Constants.TRAILING : Constants.LEADING))

    const format = tokens
      .filter(t => t.type === Lexer.NUMBER)
      .map<Types.Format>(t => {
        const [integer = '', decimal = ''] = t.value.split('.')
        return [integer.length, decimal.length]
      })

    const nodes: Tree.ChildNode[] = [
      {type: Tree.UNITS, position: tokensToPosition(tokens.slice(0, 2)), units},
    ]

    if (zeroSuppression.length > 0 || format.length > 0) {
      nodes.push({
        type: Tree.COORDINATE_FORMAT,
        position: tokensToPosition(tokens.slice(1)),
        mode: undefined,
        format: format[0],
        zeroSuppression: zeroSuppression[0],
      })
    }

    return nodes
  },
}

const tool: SyntaxRule = {
  name: 'tool',
  rules: [
    token(Lexer.T_CODE),
    minToMax(0, 12, [
      token(Lexer.COORD_CHAR, 'C'),
      token(Lexer.COORD_CHAR, 'F'),
      token(Lexer.COORD_CHAR, 'S'),
      token(Lexer.COORD_CHAR, 'B'),
      token(Lexer.COORD_CHAR, 'H'),
      token(Lexer.COORD_CHAR, 'Z'),
      token(Lexer.NUMBER),
    ]),
    token(Lexer.NEWLINE),
  ],
  createNodes(tokens) {
    const code = tokens[0].value
    const position = tokensToPosition(tokens)
    const {c} = tokensToCoordinates(tokens.slice(1, -1))

    return c === undefined
      ? [{type: Tree.TOOL_CHANGE, position, code}]
      : [
          {
            type: Tree.TOOL_DEFINITION,
            shape: {type: Constants.CIRCLE, diameter: Number(c)},
            hole: undefined,
            position,
            code,
          },
        ]
  },
}

const mode: SyntaxRule = {
  name: 'operationMode',
  rules: [
    one([
      token(Lexer.G_CODE, '0'),
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
      token(Lexer.G_CODE, '5'),
    ]),
    token(Lexer.NEWLINE),
  ],
  createNodes: tokens => [
    {
      type: Tree.INTERPOLATE_MODE,
      position: tokensToPosition(tokens),
      mode: tokensToMode(tokens),
    },
  ],
}

const operation: SyntaxRule = {
  name: 'operation',
  rules: [
    minToMax(0, 2, [
      token(Lexer.T_CODE),
      token(Lexer.G_CODE, '0'),
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
      token(Lexer.G_CODE, '5'),
    ]),
    minToMax(2, 8, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    zeroOrOne([token(Lexer.T_CODE)]),
    token(Lexer.NEWLINE),
  ],
  createNodes(tokens) {
    const graphicTokens = tokens.filter(
      t => t.type === Lexer.COORD_CHAR || t.type === Lexer.NUMBER
    )
    const modeToken = tokens.find(t => t.type === Lexer.G_CODE)
    const toolToken = tokens.find(t => t.type === Lexer.T_CODE)
    const coordinates = tokensToCoordinates(graphicTokens)
    const code = toolToken?.value
    const mode = tokensToMode(tokens)

    const graphicPosition = tokensToPosition(tokens, {
      head: graphicTokens[0],
      length: graphicTokens.length + 1,
    })
    const modePosition = tokensToPosition(tokens, {head: modeToken, length: 2})
    const toolPosition = tokensToPosition(tokens, {head: toolToken, length: 2})

    const nodes: Tree.ChildNode[] = [
      {
        type: Tree.GRAPHIC,
        position: graphicPosition,
        graphic: undefined,
        coordinates,
      },
    ]

    if (mode !== undefined) {
      nodes.unshift({type: Tree.INTERPOLATE_MODE, position: modePosition, mode})
    }

    if (code !== undefined) {
      nodes.unshift({type: Tree.TOOL_CHANGE, position: toolPosition, code})
    }

    return nodes
  },
}

const slot: SyntaxRule = {
  name: 'slot',
  rules: [
    minToMax(2, 4, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    token(Lexer.G_CODE, '85'),
    minToMax(2, 4, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    token(Lexer.NEWLINE),
  ],
  createNodes(tokens) {
    const gCode = tokens.find(t => t.type === Lexer.G_CODE)
    const splitIndex = gCode === undefined ? -1 : tokens.indexOf(gCode)
    const start = Object.fromEntries(
      Object.entries(tokensToCoordinates(tokens.slice(0, splitIndex))).map(
        ([axis, value]) => [`${axis}0`, value]
      )
    )
    const end = tokensToCoordinates(tokens.slice(splitIndex))

    return [
      {
        type: Tree.GRAPHIC,
        position: tokensToPosition(tokens),
        graphic: Constants.SLOT,
        coordinates: {...start, ...end},
      },
    ]
  },
}

const done: SyntaxRule = {
  name: 'done',
  rules: [
    one([token(Lexer.M_CODE, '30'), token(Lexer.M_CODE, '0')]),
    token(Lexer.NEWLINE),
  ],
  createNodes: tokens => [
    {type: Tree.DONE, position: tokensToPosition(tokens)},
  ],
}

const header: SyntaxRule = {
  name: 'header',
  rules: [
    one([token(Lexer.M_CODE, '48'), token(Lexer.PERCENT)]),
    token(Lexer.NEWLINE),
  ],
  createNodes: tokens => [
    {type: Tree.DRILL_HEADER, position: tokensToPosition(tokens)},
  ],
}

const comment: SyntaxRule = {
  name: 'comment',
  rules: [
    token(Lexer.SEMICOLON),
    zeroOrMore([notToken(Lexer.NEWLINE)]),
    token(Lexer.NEWLINE),
  ],
  createNodes: tokens => [
    {
      type: Tree.COMMENT,
      comment: tokensToString(tokens.slice(1, -1)),
      position: tokensToPosition(tokens),
    },
  ],
}

export const drillGrammar: SyntaxRule[] = [
  tool,
  mode,
  operation,
  slot,
  comment,
  units,
  done,
  header,
].map(r => ({...r, filetype: Constants.DRILL}))
