import {Token, NUMBER, COORD_CHAR, G_CODE, D_CODE} from '../lexer'
import {Coordinates, InterpolateModeType, GraphicType} from '../types'
import {SEGMENT, MOVE, SHAPE, LINE, CW_ARC, CCW_ARC, DRILL} from '../constants'

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
      return m
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
