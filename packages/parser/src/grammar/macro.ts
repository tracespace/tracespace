// gerber aperture macro grammar
import * as Lexer from '../lexer'
import {token, notToken, zeroOrMore, oneOrMore} from '../rules'
import {GrammarRule} from './types'

export const MACRO_COMMENT = 'MACRO_COMMENT'
export const MACRO_VARIABLE = 'MACRO_VARIABLE'
export const MACRO_PRIMITIVE = 'MACRO_PRIMITIVE'

export type MacroGrammarType =
  | typeof MACRO_COMMENT
  | typeof MACRO_VARIABLE
  | typeof MACRO_PRIMITIVE

export type MacroGrammarRule = GrammarRule<MacroGrammarType>

const macroComment: MacroGrammarRule = {
  type: MACRO_COMMENT,
  match: [
    token(Lexer.NUMBER, '0'),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
  ],
}

const macroVariable: MacroGrammarRule = {
  type: MACRO_VARIABLE,
  match: [
    token(Lexer.GERBER_MACRO_VARIABLE),
    token(Lexer.EQUALS),
    oneOrMore([
      token(Lexer.NUMBER),
      token(Lexer.OPERATOR),
      token(Lexer.GERBER_MACRO_VARIABLE),
      token(Lexer.COORD_CHAR, 'X'),
    ]),
    token(Lexer.ASTERISK),
  ],
}

const macroPrimitive: MacroGrammarRule = {
  type: MACRO_PRIMITIVE,
  match: [
    token(Lexer.NUMBER),
    token(Lexer.COMMA),
    oneOrMore([
      token(Lexer.COMMA),
      token(Lexer.NUMBER),
      token(Lexer.OPERATOR),
      token(Lexer.GERBER_MACRO_VARIABLE),
      token(Lexer.COORD_CHAR, 'X'),
    ]),
    token(Lexer.ASTERISK),
  ],
}

export const macroGrammar = [macroComment, macroVariable, macroPrimitive]
