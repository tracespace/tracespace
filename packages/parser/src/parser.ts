// parser class
import {createLexer, Lexer, Token} from './lexer'

import * as Tree from './tree'
import {grammar, matchGrammar, MatchState} from './grammar'

export class Parser {
  lexer: Lexer
  _root: Tree.Root
  _stash: ''

  constructor() {
    this.lexer = createLexer()
    this._stash = ''
    this._root = {
      type: Tree.ROOT,
      filetype: null,
      done: false,
      children: [],
    }
  }

  feed(chunk: string): void {
    const stash = this._stash
    let matchState: MatchState | null = null
    let nextToken: Token | undefined

    this._stash = ''
    this.lexer.reset(`${stash}${chunk}`)

    while ((nextToken = this.lexer.next())) {
      this._stash += nextToken.text
      matchState = matchGrammar(matchState, nextToken, grammar)

      if (matchState.nodes) {
        const {nodes, filetype = null} = matchState
        this._stash = ''
        this._root = Tree.reducer(this._root, nodes, filetype)
      }

      if (matchState.candidates.length === 0) {
        matchState = null
      }
    }
  }

  results(): Readonly<Tree.Root> {
    return this._root
  }
}
