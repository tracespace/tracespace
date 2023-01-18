import type {Position} from 'unist'
import type {Token} from '../lexer'
import {NUMBER, COORD_CHAR, G_CODE, D_CODE} from '../lexer'
import type {Coordinates, InterpolateModeType, GraphicType} from '../types'
import {SEGMENT, MOVE, SHAPE, LINE, CW_ARC, CCW_ARC, DRILL} from '../constants'

export function tokensToCoordinates(tokens: Token[]): Coordinates {
  return Object.fromEntries(
    tokens
      .map<[Token, Token | undefined]>((token, index) => [
        token,
        index > 0 ? tokens[index - 1] : undefined,
      ])
      .filter((tokenPair): tokenPair is [Token, Token] => {
        const [token, previousToken] = tokenPair
        return token.type === NUMBER && previousToken?.type === COORD_CHAR
      })
      .map(([token, previousToken]) => {
        return [previousToken.value.toLowerCase(), token.value]
      })
  )
}

export function tokensToMode(tokens: Token[]): InterpolateModeType | undefined {
  const maybeMode = tokens
    .filter(t => t.type === G_CODE)
    .map(t => {
      if (t.value === '0') return MOVE
      if (t.value === '1') return LINE
      if (t.value === '2') return CW_ARC
      if (t.value === '3') return CCW_ARC
      if (t.value === '5') return DRILL
      return false
    })

  return typeof maybeMode[0] === 'string' ? maybeMode[0] : undefined
}

export function tokensToGraphic(tokens: Token[]): GraphicType | undefined {
  const maybeGraphic = tokens
    .filter(t => t.type === D_CODE)
    .map(t => {
      if (t.value === '1') return SEGMENT
      if (t.value === '2') return MOVE
      if (t.value === '3') return SHAPE
      return false
    })

  return typeof maybeGraphic[0] === 'string' ? maybeGraphic[0] : undefined
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
  const {head = tokens[0], length = 0} = options
  const tail =
    length > 0
      ? tokens[tokens.indexOf(head) + length - 1]
      : tokens[tokens.length - 1]

  return {
    start: {line: head.line, column: head.col, offset: head.offset},
    end: {line: tail.line, column: tail.col, offset: tail.offset},
  }
}
