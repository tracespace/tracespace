import {createLexer, Lexer, Token} from './lexer'
import {matchSyntax, gerberGrammar, drillGrammar, MatchState} from './syntax'
import {Filetype} from './types'
import {Root, ChildNode, ROOT} from './tree'
import {GERBER} from './constants'

/**
 * Gerber and NC drill file parser.
 *
 * @category Parser
 */
export interface Parser {
  /** Parser's {@linkcode Lexer} instance */
  lexer: Lexer
  /** Feed the parser with all or part of the source file */
  feed(chunk: string): void
  /** Get the resulting AST when you are done feeding the parser */
  results(): Root
}

/**
 * {@linkcode Parser} factory and the primary export of the library.
 *
 * @example
 * ```ts
 * import {createParser} from '@tracespace/parser'
 *
 * // create a parser to parse a single file
 * const parser = createParser()
 *
 * // feed the parser the source file contents
 * parser.feed('G04 gerber file contents*\nM02*\n')
 *
 * // get the resulting AST
 * const tree = parser.results()
 * ```
 *
 * @category Parser
 */
export function createParser(): Parser {
  const lexer = createLexer()
  const children: ChildNode[] = []
  let grammar = [...gerberGrammar, ...drillGrammar]
  let filetype: Filetype | null = null
  let stash = ''
  let lexerOffset = 0
  let lexerState = lexer.save()

  return {lexer, feed, results}

  function feed(chunk: string): void {
    const currentStash = stash
    const currentOffset = lexerOffset
    let matchState: MatchState | null = null
    let nextToken: Token | undefined

    stash = ''
    lexer.reset(`${currentStash}${chunk}`, lexerState)

    while ((nextToken = lexer.next())) {
      const token = {...nextToken, offset: nextToken.offset + currentOffset}
      stash += nextToken.text
      matchState = matchSyntax(matchState, token, grammar)

      if (matchState.nodes) {
        const {nodes, filetype: matchedFiletype = null} = matchState
        stash = ''
        lexerOffset += lexer.index ?? 0
        lexerState = lexer.save()
        children.push(...nodes)

        if (filetype === null && matchedFiletype !== null) {
          filetype = matchedFiletype
          grammar = matchedFiletype === GERBER ? gerberGrammar : drillGrammar
        }
      }

      if (matchState.candidates.length === 0) {
        matchState = null
      }
    }
  }

  function results(): Root {
    if (filetype === null) {
      throw new Error('File type not recognized')
    }

    return {type: ROOT, filetype, children}
  }
}
