/* eslint-disable @typescript-eslint/no-unused-vars */
// drill file grammar
import * as Lexer from '../lexer'
import * as Tree from '../tree'
import * as Constants from '../constants'
import * as Types from '../types'
import {token, notToken, one, zeroOrOne, zeroOrMore, minToMax} from './rules'
import {SyntaxRule} from './types'

import {
  tokensToCoordinates,
  tokensToMode,
  tokensToString,
  tokensToPosition,
} from './map-tokens'

const units: SyntaxRule = {
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
  createNodes: tokens => {
    const units =
      tokens[0].value === 'INCH' || tokens[0].value === '72'
        ? Constants.IN
        : Constants.MM

    const zeroSuppression = tokens
      .filter(t => t.type === Lexer.DRILL_ZERO_INCLUSION)
      .reduce<Types.ZeroSuppression | null>((z, t) => {
        if (t.value === 'LZ') return Constants.TRAILING
        if (t.value === 'TZ') return Constants.LEADING
        return z
      }, null)

    const format = tokens
      .filter(t => t.type === Lexer.NUMBER)
      .reduce<Types.Format | null>((_, t) => {
        const [integer = '', decimal = ''] = t.value.split('.')
        return [integer.length, decimal.length]
      }, null)

    const nodes: Tree.ChildNode[] = [
      {type: Tree.UNITS, position: tokensToPosition(tokens.slice(0, 2)), units},
    ]

    if (zeroSuppression || format) {
      nodes.push({
        type: Tree.COORDINATE_FORMAT,
        position: tokensToPosition(tokens.slice(1)),
        mode: null,
        format,
        zeroSuppression,
      })
    }
    return nodes
  },
}
const tool: SyntaxRule = {
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
  createNodes: tokens => {
    const code = tokens[0].value
    const position = tokensToPosition(tokens)
    const {c = null} = tokensToCoordinates(tokens.slice(1, -1))
    const shape: Types.ToolShape | null =
      c !== null ? {type: Constants.CIRCLE, diameter: Number(c)} : null

    return shape
      ? [{type: Tree.TOOL_DEFINITION, hole: null, position, shape, code}]
      : [{type: Tree.TOOL_CHANGE, position, code}]
  },
}

const mode: SyntaxRule = {
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
  createNodes: tokens => {
    const graphicTokens = tokens.filter(
      t => t.type === Lexer.COORD_CHAR || t.type === Lexer.NUMBER
    )
    const modeToken = tokens.find(t => t.type === Lexer.G_CODE)
    const toolToken = tokens.find(t => t.type === Lexer.T_CODE)
    const coordinates = tokensToCoordinates(graphicTokens)
    const code = toolToken ? toolToken.value : null
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
        graphic: null,
        coordinates,
      },
    ]

    if (mode) {
      nodes.unshift({type: Tree.INTERPOLATE_MODE, position: modePosition, mode})
    }
    if (code) {
      nodes.unshift({type: Tree.TOOL_CHANGE, position: toolPosition, code})
    }
    return nodes
  },
}

const slot: SyntaxRule = {
  rules: [
    minToMax(2, 4, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    token(Lexer.G_CODE, '85'),
    minToMax(2, 4, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    token(Lexer.NEWLINE),
  ],
  createNodes: tokens => {
    const gCode = tokens.find(t => t.type === Lexer.G_CODE)
    const splitIdx = gCode ? tokens.indexOf(gCode) : -1
    const start = tokensToCoordinates(tokens.slice(0, splitIdx))
    const end = tokensToCoordinates(tokens.slice(splitIdx))
    const coordinates: Types.Coordinates = {}

    Object.keys(start).forEach(k => (coordinates[`${k}1`] = start[k]))
    Object.keys(end).forEach(k => (coordinates[`${k}2`] = end[k]))

    return [
      {
        type: Tree.GRAPHIC,
        position: tokensToPosition(tokens),
        graphic: Constants.SLOT,
        coordinates,
      },
    ]
  },
}

const headerStart: SyntaxRule = {
  rules: [token(Lexer.M_CODE, '48'), token(Lexer.NEWLINE)],
  createNodes: tokens => [
    {type: Tree.HEADER_START, position: tokensToPosition(tokens)},
  ],
}

const headerEnd: SyntaxRule = {
  rules: [
    one([token(Lexer.PERCENT), token(Lexer.M_CODE, '95')]),
    token(Lexer.NEWLINE),
  ],
  createNodes: tokens => [
    {type: Tree.HEADER_END, position: tokensToPosition(tokens)},
  ],
}

const done: SyntaxRule = {
  rules: [
    one([token(Lexer.M_CODE, '30'), token(Lexer.M_CODE, '0')]),
    token(Lexer.NEWLINE),
  ],
  createNodes: tokens => [
    {type: Tree.DONE, position: tokensToPosition(tokens)},
  ],
}

const comment: SyntaxRule = {
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

export const drillSyntax: Array<SyntaxRule> = [
  tool,
  mode,
  operation,
  slot,
  headerStart,
  headerEnd,
  comment,
  units,
  done,
].map(r => ({...r, filetype: Constants.DRILL}))
