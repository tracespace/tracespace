import {gerberGrammar, GerberGrammarType} from './gerber'
import {drillGrammar, DrillGrammarType} from './drill'
import {GrammarRule} from './types'

export * from './gerber'
export * from './drill'
export * from './macro'
export * from './types'

export type GrammarRuleType = GerberGrammarType | DrillGrammarType

export const grammar: GrammarRule<GrammarRuleType>[] = [
  ...gerberGrammar,
  ...drillGrammar,
]
