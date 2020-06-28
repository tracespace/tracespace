import {drillSyntax} from './drill'
import {gerberSyntax} from './gerber'
import {createMatchSyntax} from './match-syntax'

export * from './types'

export const matchSyntax = createMatchSyntax(...gerberSyntax, ...drillSyntax)
