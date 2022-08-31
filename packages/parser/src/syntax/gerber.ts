// Gerber file syntax
import * as Lexer from '../lexer'
import * as Constants from '../constants'
import type * as Types from '../types'
import * as Tree from '../tree'
import {parseMacroBlocks} from './macro'
import type {SyntaxRule} from './rules'
import {token, notToken, one, zeroOrMore, zeroOrOne, minToMax} from './rules'

import {
  tokensToCoordinates,
  tokensToMode,
  tokensToGraphic,
  tokensToString,
  tokensToPosition,
} from './map-tokens'

const holeShape = (parameters: number[]): Types.HoleShape | null => {
  if (parameters.length === 1) {
    const [diameter] = parameters
    return {type: Constants.CIRCLE, diameter}
  }

  if (parameters.length === 2) {
    const [xSize, ySize] = parameters
    return {type: Constants.RECTANGLE, xSize, ySize}
  }

  return null
}

const done: SyntaxRule = {
  name: 'done',
  rules: [
    one([token(Lexer.M_CODE, '0'), token(Lexer.M_CODE, '2')]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {type: Tree.DONE, position: tokensToPosition(tokens)},
  ],
}

const comment: SyntaxRule = {
  name: 'comment',
  rules: [
    token(Lexer.G_CODE, '4'),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {
      type: Tree.COMMENT,
      position: tokensToPosition(tokens),
      comment: tokensToString(tokens.slice(1, -1)),
    },
  ],
}

const format: SyntaxRule = {
  name: 'format',
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
    // Including units here is invalid syntax, but Cadence Allegro does it
    // https://github.com/tracespace/tracespace/issues/234
    minToMax(0, 2, [token(Lexer.GERBER_UNITS), token(Lexer.ASTERISK)]),
    token(Lexer.PERCENT),
  ],
  createNodes(tokens) {
    let format: Types.Format | null = null
    let zeroSuppression: Types.ZeroSuppression | null = null
    let mode: Types.Mode | null = null
    const coords = tokensToCoordinates(tokens)
    const formatEndIdx = tokens.findIndex(t => t.type === Lexer.ASTERISK)
    const unitsToken = tokens.find(t => t.type === Lexer.GERBER_UNITS)

    for (const t of tokens.filter(t => t.type === Lexer.GERBER_FORMAT)) {
      if (t.value.includes('T')) zeroSuppression = Constants.TRAILING
      if (t.value.includes('L')) zeroSuppression = Constants.LEADING
      if (t.value.includes('I')) mode = Constants.INCREMENTAL
      if (t.value.includes('A')) mode = Constants.ABSOLUTE
    }

    if (coords.x === coords.y && coords.x?.length === 2) {
      const integers = Number(coords.x[0])
      const decimals = Number(coords.x[1])
      if (integers && decimals) format = [integers, decimals]
    }

    const nodes: Tree.ChildNode[] = [
      {
        type: Tree.COORDINATE_FORMAT,
        position: tokensToPosition(tokens.slice(1, formatEndIdx + 1)),
        zeroSuppression,
        format,
        mode,
      },
    ]

    if (unitsToken) {
      nodes.push({
        type: Tree.UNITS,
        position: tokensToPosition(tokens.slice(1, -1), {head: unitsToken}),
        units: unitsToken.value === 'MM' ? Constants.MM : Constants.IN,
      })
    }

    return nodes
  },
}

const units: SyntaxRule = {
  name: 'units',
  rules: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_UNITS),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
  createNodes: tokens => [
    {
      type: Tree.UNITS,
      position: tokensToPosition(tokens.slice(1, -1)),
      units: tokens[1].value === 'MM' ? Constants.MM : Constants.IN,
    },
  ],
}

const toolMacro: SyntaxRule = {
  name: 'toolMacro',
  rules: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_TOOL_MACRO),
    token(Lexer.ASTERISK),
    zeroOrMore([notToken(Lexer.PERCENT)]),
    token(Lexer.PERCENT),
  ],
  createNodes(tokens) {
    const name = tokens[1].value
    const position = tokensToPosition(tokens.slice(1, -1))
    const blockTokens = tokens.slice(3, -1)

    return [
      {
        type: Tree.TOOL_MACRO,
        position,
        children: parseMacroBlocks(blockTokens),
        name,
      },
    ]
  },
}

const toolDefinition: SyntaxRule = {
  name: 'toolDefinition',
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
  createNodes(tokens) {
    let shape: Types.ToolShape
    let hole: Types.HoleShape | null = null

    const toolProps = /(\d+)(.+)/.exec(tokens[1].value)
    const [, code = '', name = ''] = toolProps ?? []
    const parameters: number[] = tokens
      .slice(3, -2)
      .filter(t => t.type === Lexer.NUMBER)
      .map(t => Number(t.value))

    switch (name) {
      case 'C': {
        const [diameter, ...holeParameters] = parameters
        shape = {type: Constants.CIRCLE, diameter}
        hole = holeShape(holeParameters)
        break
      }

      case 'R':
      case 'O': {
        const [xSize, ySize, ...holeParameters] = parameters
        const type = name === 'R' ? Constants.RECTANGLE : Constants.OBROUND
        shape = {type, xSize, ySize}
        hole = holeShape(holeParameters)
        break
      }

      case 'P': {
        const [diameter, vertices, rotation = null, ...holeParameters] =
          parameters
        shape = {type: Constants.POLYGON, diameter, vertices, rotation}
        hole = holeShape(holeParameters)
        break
      }

      default: {
        shape = {type: Constants.MACRO_SHAPE, name, variableValues: parameters}
      }
    }

    return [
      {
        type: Tree.TOOL_DEFINITION,
        position: tokensToPosition(tokens.slice(1, -1)),
        code,
        shape,
        hole,
      },
    ]
  },
}

const toolChange: SyntaxRule = {
  name: 'toolChange',
  rules: [
    zeroOrOne([token(Lexer.G_CODE, '54')]),
    token(Lexer.D_CODE),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {
      type: Tree.TOOL_CHANGE,
      position: tokensToPosition(tokens),
      code: tokens.find(t => t.type === Lexer.D_CODE)!.value,
    },
  ],
}

const createOperationNodes = (tokens: Lexer.Token[]): Tree.ChildNode[] => {
  const graphic = tokensToGraphic(tokens)
  const coordinates = tokensToCoordinates(tokens)
  const mode = tokensToMode(tokens)
  const position = tokensToPosition(tokens, {
    head: mode ? tokens[1] : tokens[0],
  })
  const nodes: Tree.ChildNode[] = [
    {type: Tree.GRAPHIC, position, graphic, coordinates},
  ]
  if (mode) {
    const modePosition = tokensToPosition(tokens, {head: tokens[0], length: 2})
    nodes.unshift({type: Tree.INTERPOLATE_MODE, position: modePosition, mode})
  }

  return nodes
}

const operation: SyntaxRule = {
  name: 'operation',
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

const operationWithoutCoords: SyntaxRule = {
  name: 'operationWithoutCoords',
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

const interpolationMode: SyntaxRule = {
  name: 'interpolationMode',
  rules: [
    one([
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
    ]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {
      type: Tree.INTERPOLATE_MODE,
      position: tokensToPosition(tokens),
      mode: tokensToMode(tokens),
    },
  ],
}

const regionMode: SyntaxRule = {
  name: 'regionMode',
  rules: [
    one([token(Lexer.G_CODE, '36'), token(Lexer.G_CODE, '37')]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {
      type: Tree.REGION_MODE,
      position: tokensToPosition(tokens),
      region: tokens[0].value === '36',
    },
  ],
}

const quadrantMode: SyntaxRule = {
  name: 'quadrantMode',
  rules: [
    one([token(Lexer.G_CODE, '74'), token(Lexer.G_CODE, '75')]),
    token(Lexer.ASTERISK),
  ],
  createNodes: tokens => [
    {
      type: Tree.QUADRANT_MODE,
      position: tokensToPosition(tokens),
      quadrant: tokens[0].value === '74' ? Constants.SINGLE : Constants.MULTI,
    },
  ],
}

const loadPolarity: SyntaxRule = {
  name: 'loadPolarity',
  rules: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_LOAD_POLARITY),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
  createNodes: tokens => [
    {
      type: Tree.LOAD_POLARITY,
      position: tokensToPosition(tokens.slice(1, -1)),
      polarity: tokens[1].value === 'D' ? Constants.DARK : Constants.CLEAR,
    },
  ],
}

const stepRepeat: SyntaxRule = {
  name: 'stepRepeat',
  rules: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_STEP_REPEAT),
    zeroOrMore([token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
  createNodes(tokens) {
    const coordinates = tokensToCoordinates(tokens)
    const parameters = Object.fromEntries(
      Object.entries(coordinates).map(([axis, coordinateString]) => [
        axis,
        Number(coordinateString),
      ])
    )

    return [
      {
        type: Tree.STEP_REPEAT,
        position: tokensToPosition(tokens.slice(1, -1)),
        stepRepeat: parameters,
      },
    ]
  },
}

const unimplementedExtendedCommand: SyntaxRule = {
  name: 'unimplementedExtendedCommand',
  rules: [
    token(Lexer.PERCENT),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
  createNodes: tokens => [
    {
      type: Tree.UNIMPLEMENTED,
      position: tokensToPosition(tokens.slice(1, -1)),
      value: tokensToString(tokens),
    },
  ],
}

export const gerberGrammar: SyntaxRule[] = [
  operation,
  operationWithoutCoords,
  interpolationMode,
  toolChange,
  toolDefinition,
  toolMacro,
  comment,
  regionMode,
  quadrantMode,
  loadPolarity,
  stepRepeat,
  format,
  units,
  done,
  unimplementedExtendedCommand,
].map(r => ({...r, filetype: Constants.GERBER}))
