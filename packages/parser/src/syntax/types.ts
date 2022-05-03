import {Token} from '../lexer'
import {ChildNode} from '../tree'
import * as Types from '../types'
import {TokenRule} from './rules'

export interface SyntaxRule<Node = ChildNode> {
  name: string
  rules: TokenRule[]
  createNodes: (tokens: Token[]) => Node[]
  filetype?: Types.Filetype
}

export interface MatchState<Node = ChildNode> {
  candidates: Array<SyntaxRule<Node>>
  tokens: Token[]
  filetype?: Types.Filetype
  nodes?: Node[]
}
