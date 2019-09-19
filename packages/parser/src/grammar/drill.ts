// drill file grammar
import * as Lexer from '../lexer'
import {token, notToken, one, zeroOrOne, zeroOrMore, minToMax} from '../rules'
import {DRILL} from '../tree'
import {GrammarRule} from './types'

export const DRILL_UNITS = 'DRILL_UNITS'
export const DRILL_COMMENT = 'DRILL_COMMENT'

export const DRILL_TOOL_DEFINITION = 'DRILL_TOOL_DEFINITION'
export const DRILL_TOOL_CHANGE = 'DRILL_TOOL_CHANGE'
export const DRILL_OPERATION = 'DRILL_OPERATION'
export const DRILL_SLOT = 'DRILL_SLOT'
export const DRILL_DONE = 'DRILL_DONE'

export type DrillGrammarType =
  | typeof DRILL_UNITS
  | typeof DRILL_TOOL_DEFINITION
  | typeof DRILL_TOOL_CHANGE
  | typeof DRILL_OPERATION
  | typeof DRILL_SLOT
  | typeof DRILL_DONE
  | typeof DRILL_COMMENT

export type DrillGrammarRule = GrammarRule<DrillGrammarType>

const drillUnits: DrillGrammarRule = {
  type: DRILL_UNITS,
  filetype: DRILL,
  match: [
    one([
      token(Lexer.DRILL_UNITS),
      token(Lexer.M_CODE, '71'),
      token(Lexer.M_CODE, '72'),
    ]),
    zeroOrMore([
      token(Lexer.COMMA),
      token(Lexer.DRILL_ZERO_INCLUSION),
      token(Lexer.NUMBER, /^0{1,8}\.0{1,8}$/),
    ]),
    token(Lexer.NEWLINE),
  ],
}

const drillToolDefinition: DrillGrammarRule = {
  type: DRILL_TOOL_DEFINITION,
  filetype: DRILL,
  match: [
    token(Lexer.T_CODE),
    token(Lexer.DRILL_TOOL_PROPS),
    token(Lexer.NEWLINE),
  ],
}

const drillToolChange: DrillGrammarRule = {
  type: DRILL_TOOL_CHANGE,
  filetype: DRILL,
  match: [token(Lexer.T_CODE), token(Lexer.NEWLINE)],
}

const drillOperation: DrillGrammarRule = {
  type: DRILL_OPERATION,
  filetype: DRILL,
  match: [
    zeroOrOne([token(Lexer.T_CODE)]),
    zeroOrOne([
      token(Lexer.G_CODE, '0'),
      token(Lexer.G_CODE, '1'),
      token(Lexer.G_CODE, '2'),
      token(Lexer.G_CODE, '3'),
      token(Lexer.G_CODE, '5'),
    ]),
    minToMax(0, 8, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    zeroOrOne([token(Lexer.T_CODE)]),
    token(Lexer.NEWLINE),
  ],
}

const drillSlot: DrillGrammarRule = {
  type: DRILL_SLOT,
  filetype: DRILL,
  match: [
    minToMax(2, 4, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    token(Lexer.G_CODE, '85'),
    minToMax(2, 4, [token(Lexer.COORD_CHAR), token(Lexer.NUMBER)]),
    token(Lexer.NEWLINE),
  ],
}

const drillDone: DrillGrammarRule = {
  type: DRILL_DONE,
  filetype: DRILL,
  match: [
    one([token(Lexer.M_CODE, '30'), token(Lexer.M_CODE, '0')]),
    token(Lexer.NEWLINE),
  ],
}

const drillComment: DrillGrammarRule = {
  type: DRILL_COMMENT,
  filetype: DRILL,
  match: [
    token(Lexer.SEMICOLON),
    zeroOrMore([notToken(Lexer.NEWLINE)]),
    token(Lexer.NEWLINE),
  ],
}

export const drillGrammar: Array<DrillGrammarRule> = [
  drillUnits,
  drillToolDefinition,
  drillToolChange,
  drillOperation,
  drillSlot,
  drillDone,
  drillComment,
]
