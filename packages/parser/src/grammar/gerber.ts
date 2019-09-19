// gerber file grammar
import * as Lexer from '../lexer'
import {token, notToken, one, zeroOrMore, zeroOrOne, minToMax} from '../rules'
import {GERBER} from '../tree'
import {GrammarRule} from './types'

export const GERBER_DONE = 'GERBER_DONE'
export const GERBER_COMMENT = 'GERBER_COMMENT'
export const GERBER_UNITS = 'GERBER_UNITS'
export const GERBER_FORMAT = 'GERBER_FORMAT'
export const GERBER_TOOL_MACRO = 'GERBER_TOOL_MACRO'
export const GERBER_TOOL_DEFINITION = 'GERBER_TOOL_DEFINITION'
export const GERBER_TOOL_CHANGE = 'GERBER_TOOL_CHANGE'
export const GERBER_OPERATION = 'GERBER_OPERATION'
export const GERBER_INTERPOLATE_MODE = 'GERBER_INTERPOLATE_MODE'
export const GERBER_REGION_MODE = 'GERBER_REGION_MODE'
export const GERBER_QUADRANT_MODE = 'GERBER_QUADRANT_MODE'

export type GerberGrammarType =
  | typeof GERBER_DONE
  | typeof GERBER_COMMENT
  | typeof GERBER_UNITS
  | typeof GERBER_FORMAT
  | typeof GERBER_TOOL_MACRO
  | typeof GERBER_TOOL_DEFINITION
  | typeof GERBER_TOOL_CHANGE
  | typeof GERBER_OPERATION
  | typeof GERBER_INTERPOLATE_MODE
  | typeof GERBER_REGION_MODE
  | typeof GERBER_QUADRANT_MODE

export type GerberGrammarRule = GrammarRule<GerberGrammarType>

const gerberDone: GerberGrammarRule = {
  type: GERBER_DONE,
  filetype: GERBER,
  match: [
    one([token(Lexer.M_CODE, '0'), token(Lexer.M_CODE, '2')]),
    token(Lexer.ASTERISK),
  ],
}

const gerberComment: GerberGrammarRule = {
  type: GERBER_COMMENT,
  filetype: GERBER,
  match: [
    token(Lexer.G_CODE, '4'),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
  ],
}

const gerberFormat: GerberGrammarRule = {
  type: GERBER_FORMAT,
  filetype: GERBER,
  match: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_FORMAT),
    zeroOrMore([token(Lexer.WORD), token(Lexer.NUMBER)]),
    token(Lexer.COORD_CHAR, 'X'),
    token(Lexer.NUMBER),
    token(Lexer.COORD_CHAR, 'Y'),
    token(Lexer.NUMBER),
    zeroOrMore([token(Lexer.WORD), token(Lexer.NUMBER)]),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
}

const gerberUnits: GerberGrammarRule = {
  type: GERBER_UNITS,
  filetype: GERBER,
  match: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_UNITS),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
}

const gerberToolMacro: GerberGrammarRule = {
  type: GERBER_TOOL_MACRO,
  filetype: GERBER,
  match: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_TOOL_MACRO),
    token(Lexer.ASTERISK),
    zeroOrMore([notToken(Lexer.PERCENT)]),
    token(Lexer.PERCENT),
  ],
}

const gerberToolDefinition: GerberGrammarRule = {
  type: GERBER_TOOL_DEFINITION,
  filetype: GERBER,
  match: [
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
}

const gerberToolChange: GerberGrammarRule = {
  type: GERBER_TOOL_CHANGE,
  filetype: GERBER,
  match: [
    zeroOrOne([token(Lexer.G_CODE, '54')]),
    token(Lexer.D_CODE),
    token(Lexer.ASTERISK),
  ],
}

const gerberOperation: GerberGrammarRule = {
  type: GERBER_OPERATION,
  filetype: GERBER,
  match: [
    zeroOrOne([
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
    ]),
    minToMax(2, 8, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    zeroOrOne([token(Lexer.D_CODE)]),
    token(Lexer.ASTERISK),
  ],
}

const gerberInterpolationMode: GerberGrammarRule = {
  type: GERBER_INTERPOLATE_MODE,
  filetype: GERBER,
  match: [
    one([
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
    ]),
    token(Lexer.ASTERISK),
  ],
}

const gerberRegionMode: GerberGrammarRule = {
  type: GERBER_REGION_MODE,
  filetype: GERBER,
  match: [
    one([token(Lexer.G_CODE, '36'), token(Lexer.G_CODE, '37')]),
    token(Lexer.ASTERISK),
  ],
}

const gerberQuadrantMode: GerberGrammarRule = {
  type: GERBER_QUADRANT_MODE,
  filetype: GERBER,
  match: [
    one([token(Lexer.G_CODE, '74'), token(Lexer.G_CODE, '75')]),
    token(Lexer.ASTERISK),
  ],
}

export const gerberGrammar: Array<GerberGrammarRule> = [
  gerberDone,
  gerberFormat,
  gerberUnits,
  gerberToolMacro,
  gerberToolDefinition,
  gerberToolChange,
  gerberOperation,
  gerberInterpolationMode,
  gerberRegionMode,
  gerberQuadrantMode,
  gerberComment,
]
