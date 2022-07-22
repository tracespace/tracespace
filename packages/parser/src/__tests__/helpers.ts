import type {Position} from 'unist'
import type {Token} from '../lexer'

export function token(type: Token['type'], value: Token['value']): Token {
  return {
    type,
    value,
    offset: 0,
    text: '',
    lineBreaks: 0,
    line: 0,
    col: 0,
  }
}

export function simplifyTokens(tokens: Token[]): Array<{
  type: Token['type']
  value: Token['value']
}> {
  return tokens.map(({type, value}) => ({type, value}))
}

export function position(
  start: [line: number, column: number, offset: number],
  end: [line: number, column: number, offset: number]
): Position {
  return {
    start: {line: start[0], column: start[1], offset: start[2]},
    end: {line: end[0], column: end[1], offset: end[2]},
  }
}
