import type {Filetype} from '../types'
import type {GerberNode} from '../tree'
import type {Token, LexerIterable, LexerState} from '../lexer'
import {GERBER, DRILL} from '../constants'
import type {SyntaxRule} from './rules'
import {findSyntaxMatch} from './rules'
import {drillGrammar} from './drill'
import {gerberGrammar} from './gerber'

const grammar: SyntaxRule[] = [...gerberGrammar, ...drillGrammar]

export interface MatchResult {
  filetype: Filetype | undefined
  nodes: GerberNode[]
  unmatched: string
  lexerState: LexerState | undefined
}

export function matchSyntax(
  tokens: LexerIterable,
  filetype?: Filetype
): MatchResult {
  const nodes: GerberNode[] = []
  let matchedCandidates = getGrammar()
  let matchedTokens: Token[] = []
  let nextLexerState: LexerState | undefined
  let unmatched = ''

  for (const [token, lexerState] of tokens) {
    matchedTokens.push(token)
    const result = findSyntaxMatch(matchedTokens, matchedCandidates)

    if (result.nodes === undefined) {
      unmatched += token.text
    } else {
      nodes.push(...result.nodes)
      nextLexerState = lexerState
      unmatched = ''
    }

    filetype = filetype ?? result.filetype
    matchedTokens = result.tokens ?? []
    matchedCandidates = result.candidates ?? getGrammar()
  }

  return {
    filetype,
    unmatched,
    nodes,
    lexerState: nextLexerState,
  }

  function getGrammar(): SyntaxRule[] {
    if (filetype === GERBER) return gerberGrammar
    if (filetype === DRILL) return drillGrammar
    return grammar
  }
}
