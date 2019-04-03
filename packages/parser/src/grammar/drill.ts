// drill file grammar
'use strict'

import * as Lexer from '../lexer'
import {token, one, zeroOrOne, zeroOrMore, minToMax} from '../rules'
import {DRILL} from '../tree'
import {GrammarMatch} from './types'

export const DRILL_UNITS = 'DRILL_UNITS'
export const DRILL_TOOL_DEFINITION = 'DRILL_TOOL_DEFINITION'
export const DRILL_TOOL_CHANGE = 'DRILL_TOOL_CHANGE'
export const DRILL_HIT = 'DRILL_HIT'
export const DRILL_DONE = 'DRILL_DONE'

export type DrillGrammarType =
  | typeof DRILL_UNITS
  | typeof DRILL_TOOL_DEFINITION
  | typeof DRILL_TOOL_CHANGE
  | typeof DRILL_HIT
  | typeof DRILL_DONE

export type DrillGrammarMatch = GrammarMatch<DrillGrammarType>

const drillUnits: DrillGrammarMatch = {
  type: DRILL_UNITS,
  filetype: DRILL,
  match: [
    one([
      token(Lexer.DRILL_UNITS),
      token(Lexer.M_CODE, '71'),
      token(Lexer.M_CODE, '72'),
    ]),
    zeroOrMore([
      token(Lexer.DRILL_ZERO_INCLUSION),
      token(Lexer.DRILL_COORD_FORMAT),
    ]),
    token(Lexer.NEWLINE),
  ],
}

const drillToolDefinition: DrillGrammarMatch = {
  type: DRILL_TOOL_DEFINITION,
  filetype: DRILL,
  match: [
    token(Lexer.T_CODE),
    token(Lexer.DRILL_TOOL_PROPS),
    token(Lexer.NEWLINE),
  ],
}

const drillToolChange: DrillGrammarMatch = {
  type: DRILL_TOOL_CHANGE,
  filetype: DRILL,
  match: [token(Lexer.T_CODE), token(Lexer.NEWLINE)],
}

const drillHit: DrillGrammarMatch = {
  type: DRILL_HIT,
  filetype: DRILL,
  match: [
    zeroOrOne([token(Lexer.T_CODE)]),
    minToMax(2, 4, [token(Lexer.CHAR), token(Lexer.NUMBER)]),
    zeroOrOne([token(Lexer.T_CODE)]),
    token(Lexer.NEWLINE),
  ],
}

const drillDone: DrillGrammarMatch = {
  type: DRILL_DONE,
  filetype: DRILL,
  match: [
    one([token(Lexer.M_CODE, '30'), token(Lexer.M_CODE, '0')]),
    token(Lexer.NEWLINE),
  ],
}

const grammar: Array<DrillGrammarMatch> = [
  drillUnits,
  drillToolDefinition,
  drillToolChange,
  drillHit,
  drillDone,
]

export default grammar
