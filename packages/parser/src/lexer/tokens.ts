import type {Token as MooToken} from 'moo'

/**
 * T-code token type
 *
 * @category Lexer
 */
export const T_CODE = 'T_CODE'

/**
 * G-code token type
 *
 * @category Lexer
 */
export const G_CODE = 'G_CODE'

/**
 * M-code token type
 *
 * @category Lexer
 */
export const M_CODE = 'M_CODE'

/**
 * D-code token type
 *
 * @category Lexer
 */
export const D_CODE = 'D_CODE'

/**
 * Asterisk token type
 *
 * @category Lexer
 */
export const ASTERISK = 'ASTERISK'

/**
 * Percent sign token type
 *
 * @category Lexer
 */
export const PERCENT = 'PERCENT'

/**
 * Equals sign token type
 *
 * @category Lexer
 */
export const EQUALS = 'EQUALS'

/**
 * Comma token type
 *
 * @category Lexer
 */
export const COMMA = 'COMMA'

/**
 * Arithmatic operator token type
 *
 * @category Lexer
 */
export const OPERATOR = 'OPERATOR'

/**
 * Gerber format specification token type
 *
 * @category Lexer
 */
export const GERBER_FORMAT = 'GERBER_FORMAT'

/**
 * Gerber units specification token type
 *
 * @category Lexer
 */
export const GERBER_UNITS = 'GERBER_UNITS'

/**
 * Gerber tool macro token type
 *
 * @category Lexer
 */
export const GERBER_TOOL_MACRO = 'GERBER_TOOL_MACRO'

/**
 * Gerber tool definition token type
 *
 * @category Lexer
 */
export const GERBER_TOOL_DEF = 'GERBER_TOOL_DEF'

/**
 * Gerber load polarity token type
 *
 * @category Lexer
 */
export const GERBER_LOAD_POLARITY = 'GERBER_LOAD_POLARITY'

/**
 * Gerber step repear token type
 *
 * @category Lexer
 */
export const GERBER_STEP_REPEAT = 'GERBER_STEP_REPEAT'

/**
 * Gerber macro variable token type
 *
 * @category Lexer
 */
export const GERBER_MACRO_VARIABLE = 'GERBER_MACRO_VARIABLE'

/**
 * Semicolor token type
 *
 * @category Lexer
 */
export const SEMICOLON = 'SEMICOLON'

/**
 * Drill file units token type
 *
 * @category Lexer
 */
export const DRILL_UNITS = 'DRILL_UNITS'

/**
 * Drill zero-inclusion token type
 *
 * @category Lexer
 */
export const DRILL_ZERO_INCLUSION = 'DRILL_ZERO_INCLUSION'

/**
 * Coordinate axis character token type
 *
 * @category Lexer
 */
export const COORD_CHAR = 'COORD_CHAR'

/**
 * Number token type
 *
 * @category Lexer
 */
export const NUMBER = 'NUMBER'

/**
 * Word token type
 *
 * @category Lexer
 */
export const WORD = 'WORD'

/**
 * Whitespace token type
 *
 * @category Lexer
 */
export const WHITESPACE = 'WHITESPACE'

/**
 * Newline token type
 *
 * @category Lexer
 */
export const NEWLINE = 'NEWLINE'

/**
 * Catchall token type
 *
 * @category Lexer
 */
export const CATCHALL = 'CATCHALL'

/**
 * Error token type
 *
 * @category Lexer
 */
export const ERROR = 'ERROR'

/**
 * Union of all available token types
 *
 * @category Lexer
 */
export type TokenType =
  | typeof T_CODE
  | typeof G_CODE
  | typeof M_CODE
  | typeof D_CODE
  | typeof ASTERISK
  | typeof PERCENT
  | typeof EQUALS
  | typeof COMMA
  | typeof OPERATOR
  | typeof GERBER_FORMAT
  | typeof GERBER_UNITS
  | typeof GERBER_TOOL_MACRO
  | typeof GERBER_TOOL_DEF
  | typeof GERBER_LOAD_POLARITY
  | typeof GERBER_STEP_REPEAT
  | typeof GERBER_MACRO_VARIABLE
  | typeof SEMICOLON
  | typeof DRILL_UNITS
  | typeof DRILL_ZERO_INCLUSION
  | typeof COORD_CHAR
  | typeof NUMBER
  | typeof WORD
  | typeof WHITESPACE
  | typeof NEWLINE
  | typeof CATCHALL
  | typeof ERROR

/**
 * {@linkcode Lexer} token
 *
 * @category Lexer
 */
export interface Token extends MooToken {
  /** Token identifier */
  type: TokenType
}
