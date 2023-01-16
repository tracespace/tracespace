// Gerber and drill file lexer + tokenizer
import Moo from 'moo'
import type {Token} from './tokens'
import {rules} from './rules'

export * from './tokens'

export interface LexerState extends Moo.LexerState {
  offset: number
}

export interface LexerIterable extends Iterable<[Token, LexerState]> {}

/**
 * The lexing module of the parser.
 *
 * @category Lexer
 */
export interface Lexer {
  feed(chunk: string, state?: LexerState | null): LexerIterable
}

/**
 * {@linkcode Lexer} factory
 *
 * @example
 * ```ts
 * import {createLexer} from '@tracespace/parser'
 *
 * const lexer = createLexer()
 * const tokens = lexer.feed('G04 gerber string*\nM02*\n')
 *
 * for (const token of tokens) {
 *   console.log(`${token.type}: ${token.value}`)
 * }
 * ```
 *
 * @category Lexer
 */
export function createLexer(): Lexer {
  const mooLexer = Moo.compile(rules)

  return {feed}

  function feed(chunk: string, state: LexerState | null = null): LexerIterable {
    mooLexer.reset(chunk, state ?? undefined)
    return tokenIterator(state?.offset ?? 0)
  }

  function tokenIterator(
    offset: number
  ): LexerIterable & Iterator<[Token, LexerState]> {
    return {
      [Symbol.iterator]() {
        return this
      },

      next() {
        const token = mooLexer.next() as Token | undefined

        if (token) {
          const nextToken = {...token, offset: offset + token.offset}
          const nextState = {
            ...mooLexer.save(),
            offset: offset + (mooLexer.index ?? 0),
          }

          return {value: [nextToken, nextState]}
        }

        return {value: undefined, done: true}
      },
    }
  }
}

declare module 'moo' {
  export interface Lexer {
    index?: number
  }
}
