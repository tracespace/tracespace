import moo, {Rule} from 'moo'
import * as Tokens from './tokens'

export type Rules = {
  [t in Tokens.TokenType]: RegExp | string | Array<string> | Rule | Array<Rule>
}

const RE_STRIP_LEADING_ZEROS = /^0*/
const getCodeValue = (text: string): string =>
  text.slice(1).replace(RE_STRIP_LEADING_ZEROS, '') || '0'

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
    match: /FS[LTDAI]+/,
    value: text => text.slice(2),
  },
  [Tokens.GERBER_UNITS]: {
    match: /MO(?:IN|MM)/,
    value: text => text.slice(2),
  },
  [Tokens.GERBER_TOOL_MACRO]: {
    // "-" in a tool name is illegal, but some gerber writers misbehave
    // https://github.com/mcous/gerber-parser/pull/13
    match: /AM[a-zA-Z_.$][\w.-]*/,
    value: text => text.slice(2),
  },
  [Tokens.GERBER_TOOL_DEF]: {
    match: /ADD\d+[a-zA-Z_.$][\w.-]*/,
    value: text => text.slice(3).replace(RE_STRIP_LEADING_ZEROS, ''),
  },
  [Tokens.GERBER_MACRO_VARIABLE]: /\$\d+/,
  [Tokens.SEMICOLON]: /;/,
  [Tokens.DRILL_UNITS]: /^(?:METRIC|INCH)/,
  [Tokens.DRILL_ZERO_INCLUSION]: {
    match: /,(?:TZ|LZ)/,
    value: text => text.slice(1),
  },
  [Tokens.DRILL_TOOL_PROPS]: {
    match: /(?:[CFSBHZ][\d.]+)+/,
    value: text => {
      const diameterMatch = text.match(/C[\d.]+/)
      return diameterMatch ? diameterMatch[0] : ''
    },
  },
  [Tokens.COORD_CHAR]: /[XYZIJA]/,
  [Tokens.NUMBER]: /(?:[+-])?[\d.]+/,
  [Tokens.OPERATOR]: ['x', '/', '+', '-', '(', ')'],
  [Tokens.COMMA]: ',',
  [Tokens.WORD]: /[a-zA-Z]+/,
  [Tokens.WHITESPACE]: /[ \t]+/,
  [Tokens.NEWLINE]: {
    match: /\r?\n/,
    lineBreaks: true,
  },
  [Tokens.CATCHALL]: /[\S]/,
  [Tokens.ERROR]: moo.error,
}
