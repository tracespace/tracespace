import {Position} from 'unist'
import {Token} from '../lexer'

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

export function simplifyToken(token: Token): {
  type: Token['type']
  value: Token['value']
} {
  return {type: token.type, value: token.value}
}

export function position(
  start: [number, number, number],
  end: [number, number, number]
): Position {
  return {
    start: {line: start[0], column: start[1], offset: start[2]},
    end: {line: end[0], column: end[1], offset: end[2]},
  }
}
