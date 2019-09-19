import {Filetype} from '../tree'
import {Rule} from '../rules'
import {Token} from '../lexer'

export interface GrammarRule<Type extends string> {
  type: Type
  match: Array<Rule>
  filetype?: Filetype
}

export interface GrammarMatch<Type extends string> {
  type: Type
  tokens: Token[]
  filetype?: Filetype
}
