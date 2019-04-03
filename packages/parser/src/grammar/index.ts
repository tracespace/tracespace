import gerberGrammar, {GerberGrammarMatch} from './gerber'
import drillGrammar, {DrillGrammarMatch} from './drill'

export * from './gerber'
export * from './drill'

export type GrammarMatch = GerberGrammarMatch | DrillGrammarMatch

export const grammar: Array<GrammarMatch> = [...gerberGrammar, ...drillGrammar]
