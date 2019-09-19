// parser class
import {createLexer, Lexer, Token} from './lexer'

import * as Tree from './tree'
import * as Rules from './rules'
import {grammar} from './grammar'

const INITIAL_MATCH_STATE = Rules.initialMatchState(grammar)

export class Parser {
  lexer: Lexer
  _header: Tree.Header
  _image: Tree.Image
  _root: Tree.Root

  constructor() {
    this.lexer = createLexer()
    this._header = {type: Tree.HEADER, children: []}
    this._image = {type: Tree.IMAGE, children: []}
    this._root = {
      type: Tree.ROOT,
      filetype: null,
      done: false,
      children: [this._header, this._image],
    }
  }

  feed(chunk: string): void {
    let next: Token | undefined
    let matchState = INITIAL_MATCH_STATE

    this.lexer.reset(chunk)

    while ((next = this.lexer.next())) {
      matchState = Rules.reduceMatchState(matchState, next)

      if (matchState.match) {
        this._root = Tree.reducer(this._root, matchState.match)
      }

      if (matchState.candidates.length === 0) {
        matchState = INITIAL_MATCH_STATE
      }
    }
  }

  results(): Tree.Root {
    return this._root
  }
}
