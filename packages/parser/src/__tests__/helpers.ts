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

export function simplifyToken(
  token: Token
): {type: Token['type']; value: Token['value']} {
  return {type: token.type, value: token.value}
}
