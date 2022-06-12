import {Position} from 'unist'
import {Token, NUMBER, COORD_CHAR, G_CODE, D_CODE, M_CODE} from '../lexer'
import {
  Coordinates,
  InterpolateModeType,
  GraphicType,
  DrillMCodeType,
} from '../types'
import {
  SEGMENT,
  MOVE,
  SHAPE,
  LINE,
  CW_ARC,
  CCW_ARC,
  DRILL,
  DRILL_INCH_MEASURE_MODE,
} from '../constants'
import {
  DRILL_ABSOLUTE_MODE,
  DRILL_METRIC_MEASURE_MODE,
  DRILL_RETRACT_WITH_CLAMPING,
  DRILL_RETRACT_NO_CLAMPING,
  DRILL_Z_AXIS_ROUTE_DEPTH,
  DRILL_Z_AXIS_ROUTE_POSITION,
  DRILL_TOOL_TIP_CHECK,
} from '..'

export function tokensToCoordinates(tokens: Array<Token>): Coordinates {
  return tokens.reduce<Coordinates>((coords, token, i) => {
    const prev = tokens[i - 1]

    if (token.type === NUMBER && prev?.type === COORD_CHAR) {
      coords[prev.value.toLowerCase()] = token.value
    }

    return coords
  }, {})
}

export function tokensToMode(tokens: Token[]): InterpolateModeType {
  return tokens
    .filter(t => t.type === G_CODE)
    .reduce<InterpolateModeType>((m, t) => {
      if (t.value === '0') return MOVE
      if (t.value === '1') return LINE
      if (t.value === '2') return CW_ARC
      if (t.value === '3') return CCW_ARC
      if (t.value === '5') return DRILL
      if (t.value === '90') return DRILL_ABSOLUTE_MODE
      return m
    }, null)
}

export function tokensToDrillMCode(tokens: Token[]): DrillMCodeType {
  return tokens
    .filter(t => t.type === M_CODE)
    .reduce<DrillMCodeType>((d, c) => {
      if (c.value === '14') return DRILL_Z_AXIS_ROUTE_DEPTH
      if (c.value === '15') return DRILL_Z_AXIS_ROUTE_POSITION
      if (c.value === '16') return DRILL_RETRACT_WITH_CLAMPING
      if (c.value === '17') return DRILL_RETRACT_NO_CLAMPING
      if (c.value === '18') return DRILL_TOOL_TIP_CHECK
      if (c.value === '71') return DRILL_METRIC_MEASURE_MODE
      if (c.value === '72') return DRILL_INCH_MEASURE_MODE
      return d
    }, null)
}

export function tokensToGraphic(tokens: Array<Token>): GraphicType {
  return tokens
    .filter(t => t.type === D_CODE)
    .reduce<GraphicType>((g, t) => {
      if (t.value === '1') return SEGMENT
      if (t.value === '2') return MOVE
      if (t.value === '3') return SHAPE
      return g
    }, null)
}

export function tokensToString(tokens: Token[]): string {
  return tokens
    .map(t => t.value)
    .join('')
    .trim()
}

export function tokensToPosition(
  tokens: Token[],
  options: Partial<{head: Token; length: number}> = {}
): Position {
  const head = options.head ?? tokens[0]
  const tail = options.length
    ? tokens[tokens.indexOf(head) + options.length - 1]
    : tokens[tokens.length - 1]

  return {
    start: {line: head.line, column: head.col, offset: head.offset},
    end: {line: tail.line, column: tail.col, offset: tail.offset},
  }
}
