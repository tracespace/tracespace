import {Filetype} from '../tree'
import {Rule} from '../rules'

export interface GrammarMatch<Type> {
  type: Type
  filetype: Filetype
  match: Array<Rule>
}
