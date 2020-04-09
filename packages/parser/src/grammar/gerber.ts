// gerber file grammar
import * as Lexer from '../lexer'
import * as Constants from '../constants'
import * as Types from '../types'
import * as Tree from '../tree'
import {token, notToken, one, zeroOrMore, zeroOrOne, minToMax} from './rules'
import {parseMacroBlocks} from './macro'
import {GrammarRule} from './types'

import {
  tokensToCoordinates,
  tokensToMode,
  tokensToGraphic,
  tokensToString,
} from './map-tokens'

const holeParamsToShape = (params: number[]): Types.HoleShape | null => {
  if (params.length === 1) {
    const [diameter] = params
    return {type: Constants.CIRCLE, diameter}
  }

  if (params.length === 2) {
    const [xSize, ySize] = params
    return {type: Constants.RECTANGLE, xSize, ySize}
  }

  return null
}

const done: GrammarRule = {
  rules: [
    one([token(Lexer.M_CODE, '0'), token(Lexer.M_CODE, '2')]),
    token(Lexer.ASTERISK),
  ],
  createNodes: () => [{type: Tree.DONE}],
}

const comment: GrammarRule = {
  rules: [
    token(Lexer.G_CODE, '4'),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {type: Tree.COMMENT, comment: tokensToString(tokens.slice(1, -1))},
  ],
}

const format: GrammarRule = {
  rules: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_FORMAT),
    zeroOrMore([notToken(Lexer.COORD_CHAR, 'X')]),
    token(Lexer.COORD_CHAR, 'X'),
    token(Lexer.NUMBER),
    token(Lexer.COORD_CHAR, 'Y'),
    token(Lexer.NUMBER),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
  createNodes: tokens => {
    let format: Types.Format | null = null
    let zeroSuppression = null
    let mode = null
    const coords = tokensToCoordinates(tokens)

    tokens
      .filter(t => t.type === Lexer.GERBER_FORMAT)
      .forEach(t => {
        if (t.value.indexOf('T') >= 0) zeroSuppression = Constants.TRAILING
        if (t.value.indexOf('L') >= 0) zeroSuppression = Constants.LEADING
        if (t.value.indexOf('I') >= 0) mode = Constants.INCREMENTAL
        if (t.value.indexOf('A') >= 0) mode = Constants.ABSOLUTE
      })

    if (coords.x === coords.y && coords.x?.length === 2) {
      const integers = Number(coords.x[0])
      const decimals = Number(coords.x[1])
      if (integers && decimals) format = [integers, decimals]
    }

    return [{type: Tree.COORDINATE_FORMAT, zeroSuppression, format, mode}]
  },
}

const units: GrammarRule = {
  rules: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_UNITS),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
  createNodes: tokens => [
    {
      type: Tree.UNITS,
      units: tokens[1].value === 'MM' ? Constants.MM : Constants.IN,
    },
  ],
}

const toolMacro: GrammarRule = {
  rules: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_TOOL_MACRO),
    token(Lexer.ASTERISK),
    zeroOrMore([notToken(Lexer.PERCENT)]),
    token(Lexer.PERCENT),
  ],
  createNodes: tokens => {
    const name = tokens[1].value
    const blockTokens = tokens.slice(3, -1)

    return [
      {type: Tree.TOOL_MACRO, blocks: parseMacroBlocks(blockTokens), name},
    ]
  },
}

const toolDefinition: GrammarRule = {
  rules: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_TOOL_DEF),
    zeroOrMore([
      token(Lexer.COMMA),
      token(Lexer.NUMBER),
      token(Lexer.COORD_CHAR, 'X'),
    ]),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
  createNodes: tokens => {
    let shape: Types.ToolShape
    let hole: Types.HoleShape = null

    const toolProps = tokens[1].value.match(/(\d+)(.+)/)
    const [, code = '', name = ''] = toolProps ?? []
    const params: Array<number> = tokens
      .slice(3, -2)
      .filter(t => t.type === Lexer.NUMBER)
      .map(t => Number(t.value))

    if (name === 'C') {
      const [diameter, ...holeParams] = params
      shape = {type: Constants.CIRCLE, diameter}
      hole = holeParamsToShape(holeParams)
    } else if (name === 'R' || name === 'O') {
      const [xSize, ySize, ...holeParams] = params
      const type = name === 'R' ? Constants.RECTANGLE : Constants.OBROUND
      shape = {type, xSize, ySize}
      hole = holeParamsToShape(holeParams)
    } else if (name === 'P') {
      const [diameter, vertices, rotation = null, ...holeParams] = params
      shape = {type: Constants.POLYGON, diameter, vertices, rotation}
      hole = holeParamsToShape(holeParams)
    } else {
      shape = {type: Constants.MACRO_SHAPE, name, params}
    }

    return [{type: Tree.TOOL_DEFINITION, code, shape, hole}]
  },
}

const toolChange: GrammarRule = {
  rules: [
    zeroOrOne([token(Lexer.G_CODE, '54')]),
    token(Lexer.D_CODE),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {
      type: Tree.TOOL_CHANGE,
      code: tokens.find(t => t.type === Lexer.D_CODE)?.value as string,
    },
  ],
}

const createOperationNodes = (tokens: Lexer.Token[]): Tree.ChildNode[] => {
  const graphic = tokensToGraphic(tokens)
  const coordinates = tokensToCoordinates(tokens)
  const mode = tokensToMode(tokens)
  const nodes: Tree.ChildNode[] = [{type: Tree.GRAPHIC, graphic, coordinates}]
  if (mode) nodes.unshift({type: Tree.INTERPOLATE_MODE, mode})
  return nodes
}

const operation: GrammarRule = {
  rules: [
    zeroOrOne([
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
    ]),
    minToMax(2, 8, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    zeroOrOne([
      token(Lexer.D_CODE, '1'),
      token(Lexer.D_CODE, '2'),
      token(Lexer.D_CODE, '3'),
    ]),
    token(Lexer.ASTERISK),
  ],
  createNodes: createOperationNodes,
}

const operationWithoutCoords: GrammarRule = {
  rules: [
    zeroOrOne([
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
    ]),
    one([
      token(Lexer.D_CODE, '1'),
      token(Lexer.D_CODE, '2'),
      token(Lexer.D_CODE, '3'),
    ]),
    token(Lexer.ASTERISK),
  ],
  createNodes: createOperationNodes,
}

const interpolationMode: GrammarRule = {
  rules: [
    one([
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
    ]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {type: Tree.INTERPOLATE_MODE, mode: tokensToMode(tokens)},
  ],
}

const regionMode: GrammarRule = {
  rules: [
    one([token(Lexer.G_CODE, '36'), token(Lexer.G_CODE, '37')]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {type: Tree.REGION_MODE, region: tokens[0].value === '36'},
  ],
}

const quadrantMode: GrammarRule = {
  rules: [
    one([token(Lexer.G_CODE, '74'), token(Lexer.G_CODE, '75')]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {
      type: Tree.QUADRANT_MODE,
      quadrant: tokens[0].value === '74' ? Constants.SINGLE : Constants.MULTI,
    },
  ],
}

export const gerberGrammar: Array<GrammarRule> = [
  operation,
  operationWithoutCoords,
  interpolationMode,
  toolChange,
  toolDefinition,
  toolMacro,
  comment,
  regionMode,
  quadrantMode,
  format,
  units,
  done,
].map(r => ({...r, filetype: Constants.GERBER}))
