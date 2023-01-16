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
  filetype: Filetype | null
  nodes: GerberNode[]
  unmatched: string
  lexerState: LexerState | null
}

export function matchSyntax(
  tokens: LexerIterable,
  filetype: Filetype | null = null
): MatchResult {
  const nodes: GerberNode[] = []
  let matchedCandidates = getGrammar()
  let matchedTokens: Token[] = []
  let nextLexerState: LexerState | null = null
  let unmatched = ''

  for (const [token, lexerState] of tokens) {
    const result = findSyntaxMatch([...matchedTokens, token], matchedCandidates)

    if (result.nodes) {
      nodes.push(...result.nodes)
      nextLexerState = lexerState
      unmatched = ''
    } else {
      unmatched += token.text
    }

    filetype = filetype ?? result.filetype ?? null
    matchedTokens = result.tokens ?? []
    matchedCandidates = result.candidates ?? getGrammar()
  }

  return {
    filetype,
    unmatched,
    nodes,
    lexerState: nextLexerState,
  }

  function getGrammar() {
    if (filetype === GERBER) return gerberGrammar
    if (filetype === DRILL) return drillGrammar
    return grammar
  }
}
