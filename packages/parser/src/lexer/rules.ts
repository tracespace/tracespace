import Moo from 'moo'
import * as Tokens from './tokens'

export type Rules = {
  [t in Tokens.TokenType]: RegExp | string | string[] | Moo.Rule | Moo.Rule[]
}

const RE_STRIP_LEADING_ZEROS = /^0*/

const stripLeadingZeros = (text: string): string => {
  return text.replace(RE_STRIP_LEADING_ZEROS, '')
}

const getCodeValue = (text: string): string => {
  const leadingZerosRemoved = stripLeadingZeros(text.slice(1))
  return leadingZerosRemoved === '' ? '0' : leadingZerosRemoved
}

export const rules: Rules = {
  [Tokens.T_CODE]: {
    match: /T\d+/,
    value: getCodeValue,
  },
  [Tokens.G_CODE]: {
    match: /G\d+/,
    value: getCodeValue,
  },
  [Tokens.M_CODE]: {
    match: /M\d+/,
    value: getCodeValue,
  },
  [Tokens.D_CODE]: {
    match: /D\d+/,
    value: getCodeValue,
  },
  [Tokens.ASTERISK]: '*',
  [Tokens.PERCENT]: '%',
  [Tokens.EQUALS]: '=',
  [Tokens.GERBER_FORMAT]: {
    match: /FS[ADILT]+/,
    value: (text: string): string => text.slice(2),
  },
  [Tokens.GERBER_UNITS]: {
    match: /MO(?:IN|MM)/,
    value: (text: string): string => text.slice(2),
  },
  [Tokens.GERBER_TOOL_MACRO]: {
    // "-" in a tool name is illegal, but some gerber writers misbehave
    // https://github.com/mcous/gerber-parser/pull/13
    match: /AM[$.A-Z_a-z][\w.-]*/,
    value: (text: string): string => text.slice(2),
  },
  [Tokens.GERBER_TOOL_DEF]: {
    match: /ADD\d+[$.A-Z_a-z][\w.-]*/,
    value: (text: string): string => stripLeadingZeros(text.slice(3)),
  },
  [Tokens.GERBER_LOAD_POLARITY]: {
    match: /LP[CD]/,
    value: (text: string): string => text.slice(2),
  },
  [Tokens.GERBER_STEP_REPEAT]: 'SR',
  [Tokens.GERBER_MACRO_VARIABLE]: /\$\d+/,
  [Tokens.SEMICOLON]: ';',
  [Tokens.DRILL_UNITS]: /^(?:METRIC|INCH)/,
  [Tokens.DRILL_ZERO_INCLUSION]: {
    match: /,(?:TZ|LZ)/,
    value: (text: string): string => text.slice(1),
  },
  [Tokens.COORD_CHAR]: /[A-CFH-JNSX-Z]/,
  [Tokens.NUMBER]: /[+-]?[\d.]+/,
  [Tokens.OPERATOR]: ['x', '/', '+', '-', '(', ')'],
  [Tokens.COMMA]: ',',
  [Tokens.WORD]: /[A-Za-z]+/,
  [Tokens.WHITESPACE]: /[\t ]+/,
  [Tokens.NEWLINE]: {
    match: /\r?\n/,
    lineBreaks: true,
  },
  [Tokens.CATCHALL]: /\S/,
  [Tokens.ERROR]: Moo.error,
}
