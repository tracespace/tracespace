import {TokenRule} from './rules'
import {Token} from '../lexer'
import {ChildNode} from '../tree'
import * as Types from '../types'

export interface GrammarRule<Node = ChildNode> {
  rules: Array<TokenRule>
  createNodes: (tokens: Token[]) => Node[]
  filetype?: Types.Filetype
}

export interface MatchState<Node = ChildNode> {
  candidates: GrammarRule<Node>[]
  tokens: Token[]
  filetype?: Types.Filetype
  nodes?: Node[]
}
