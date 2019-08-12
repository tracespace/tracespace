// gerber file grammar
'use strict'

import * as Lexer from '../lexer'
import {token, notToken, one, zeroOrMore, zeroOrOne, minToMax} from '../rules'
import {GERBER} from '../tree'
import {GrammarMatch} from './types'

export const GERBER_DONE = 'GERBER_DONE'
export const GERBER_COMMENT = 'GERBER_COMMENT'
export const GERBER_UNITS = 'GERBER_UNITS'
export const GERBER_FORMAT = 'GERBER_FORMAT'
export const GERBER_TOOL_DEFINITION = 'GERBER_TOOL_DEFINITION'
export const GERBER_TOOL_CHANGE = 'GERBER_TOOL_CHANGE'
export const GERBER_OPERATION = 'GERBER_OPERATION'

export type GerberGrammarType =
  | typeof GERBER_DONE
  | typeof GERBER_COMMENT
  | typeof GERBER_UNITS
  | typeof GERBER_FORMAT
  | typeof GERBER_TOOL_DEFINITION
  | typeof GERBER_TOOL_CHANGE
  | typeof GERBER_OPERATION

export type GerberGrammarMatch = GrammarMatch<GerberGrammarType>

const gerberDone: GerberGrammarMatch = {
  type: GERBER_DONE,
  filetype: GERBER,
  match: [
    one([token(Lexer.M_CODE, '0'), token(Lexer.M_CODE, '2')]),
    token(Lexer.ASTERISK),
  ],
}

const gerberComment: GerberGrammarMatch = {
  type: GERBER_COMMENT,
  filetype: GERBER,
  match: [
    token(Lexer.G_CODE, '4'),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
  ],
}

const gerberFormat: GerberGrammarMatch = {
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

const gerberUnits: GerberGrammarMatch = {
  type: GERBER_UNITS,
  filetype: GERBER,
  match: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_UNITS),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
}

const gerberToolDef: GerberGrammarMatch = {
  type: GERBER_TOOL_DEFINITION,
  filetype: GERBER,
  match: [
    token(Lexer.PERCENT),
    token(Lexer.GERBER_TOOL_DEF),
    token(Lexer.GERBER_TOOL_NAME),
    token(Lexer.NUMBER),
    zeroOrMore([token(Lexer.COORD_CHAR, 'X'), token(Lexer.NUMBER)]),
    token(Lexer.ASTERISK),
    token(Lexer.PERCENT),
  ],
}

const gerberToolChange: GerberGrammarMatch = {
  type: GERBER_TOOL_CHANGE,
  filetype: GERBER,
  match: [
    zeroOrOne([token(Lexer.G_CODE, '54')]),
    token(Lexer.D_CODE),
    token(Lexer.ASTERISK),
  ],
}

const gerberOperation: GerberGrammarMatch = {
  type: GERBER_OPERATION,
  filetype: GERBER,
  match: [
    zeroOrOne([token(Lexer.G_CODE)]),
    minToMax(2, 8, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    zeroOrOne([token(Lexer.D_CODE)]),
    token(Lexer.ASTERISK),
  ],
}

const grammar: Array<GerberGrammarMatch> = [
  gerberDone,
  gerberFormat,
  gerberUnits,
  gerberToolDef,
  gerberToolChange,
  gerberOperation,
  gerberComment,
]

export default grammar
