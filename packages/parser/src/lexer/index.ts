// gerber and drill file lexer + tokenizer
'use strict'

import moo, {Lexer as MooLexer} from 'moo'
import {Token} from './tokens'
import {rules} from './rules'

export {LexerState} from 'moo'

export * from './tokens'

export function createLexer(): Lexer {
  return moo.compile(rules) as Lexer
}

export interface Lexer extends MooLexer {
  index?: number
  next(): Token | undefined
  [Symbol.iterator](): Iterator<Token>
}
