// parser class
import {createLexer, Lexer, LexerState, Token} from './lexer'

import * as Tree from './tree'
import {matchSyntax, MatchState} from './syntax'

export class Parser {
  lexer: Lexer
  _root: Tree.Root
  _stash: ''
  _lexerOffset: number
  _lexerState: LexerState

  constructor() {
    this.lexer = createLexer()
    this._stash = ''
    this._lexerOffset = 0
    this._lexerState = this.lexer.save()
    this._root = {
      type: Tree.ROOT,
      filetype: null,
      done: false,
      children: [],
    }
  }

  feed(chunk: string): void {
    const stash = this._stash
    const offset = this._lexerOffset
    let matchState: MatchState | null = null
    let nextToken: Token | undefined

    this._stash = ''
    this.lexer.reset(`${stash}${chunk}`, this._lexerState)

    while ((nextToken = this.lexer.next())) {
      const token = {...nextToken, offset: nextToken.offset + offset}
      this._stash += nextToken.text
      matchState = matchSyntax(matchState, token)

      if (matchState.nodes) {
        const {nodes, filetype = null} = matchState
        this._stash = ''
        this._lexerOffset += this.lexer.index ?? 0
        this._lexerState = this.lexer.save()
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
