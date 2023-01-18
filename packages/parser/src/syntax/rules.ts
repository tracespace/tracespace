import type {Token} from '../lexer'
import type {Filetype} from '../types'
import type {GerberNode} from '../tree'

export const SINGLE_TOKEN = 'TOKEN'
export const MIN_TO_MAX = 'MIN_TO_MAX'

export interface SyntaxRule<Node = GerberNode> {
  name: string
  rules: TokenRule[]
  createNodes: (tokens: Token[]) => Node[]
  filetype?: Filetype
}

export type TokenRule = SingleTokenRule | MinToMaxRule

export interface SingleTokenRule {
  rule: typeof SINGLE_TOKEN
  type: Token['type']
  value: Token['value'] | RegExp | null | undefined
  negate?: boolean
}

export interface MinToMaxRule {
  rule: typeof MIN_TO_MAX
  min: number
  max: number
  match: SingleTokenRule[]
}

export function token(
  type: Token['type'],
  value?: Token['value'] | RegExp
): SingleTokenRule {
  return {rule: SINGLE_TOKEN, type, value}
}

export function notToken(
  type: Token['type'],
  value?: Token['value']
): SingleTokenRule {
  return {rule: SINGLE_TOKEN, type, value, negate: true}
}

export function one(match: SingleTokenRule[]): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 1, max: 1, match}
}

export function zeroOrOne(match: SingleTokenRule[]): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 0, max: 1, match}
}

export function zeroOrMore(match: SingleTokenRule[]): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 0, max: Number.POSITIVE_INFINITY, match}
}

export function oneOrMore(match: SingleTokenRule[]): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 1, max: Number.POSITIVE_INFINITY, match}
}

export function minToMax(
  min: number,
  max: number,
  match: SingleTokenRule[]
): MinToMaxRule {
  return {rule: MIN_TO_MAX, min, max, match}
}

export interface MatchSearchResult<Node> {
  filetype?: Filetype
  nodes?: Node[]
  tokens?: Token[]
  candidates?: Array<SyntaxRule<Node>>
}

export function findSyntaxMatch<Node>(
  tokens: Token[],
  candidates: Array<SyntaxRule<Node>>
): MatchSearchResult<Node> {
  const remainingCandidates: Array<SyntaxRule<Node>> = []

  for (const candidate of candidates) {
    const matchType = tokenListMatches(tokens, candidate.rules)

    if (matchType === PARTIAL_MATCH) {
      remainingCandidates.push(candidate)
    } else if (matchType === FULL_MATCH) {
      return {
        filetype: candidate.filetype,
        nodes: candidate.createNodes(tokens),
      }
    }
  }

  return remainingCandidates.length > 0
    ? {candidates: remainingCandidates, tokens}
    : {}
}

const FULL_MATCH = 'FULL_MATCH'
const PARTIAL_MATCH = 'PARTIAL_MATCH'
const NO_MATCH = 'NO_MATCH'

type TokenMatchType = typeof FULL_MATCH | typeof PARTIAL_MATCH | typeof NO_MATCH

function tokenListMatches(tokens: Token[], rules: TokenRule[]): TokenMatchType {
  let rulesIndex = 0
  let tokensIndex = 0
  let multiMatchCount = 0

  while (rulesIndex < rules.length && tokensIndex < tokens.length) {
    const rule = rules[rulesIndex]
    const token = tokens[tokensIndex]
    const match = tokenMatches(rule, token)

    if (match) {
      if (rule.rule === SINGLE_TOKEN || multiMatchCount >= rule.max - 1) {
        rulesIndex++
        tokensIndex++
        multiMatchCount = 0
      } else {
        tokensIndex++
        multiMatchCount++
      }
    } else if (rule.rule === MIN_TO_MAX && multiMatchCount >= rule.min) {
      multiMatchCount = 0
      rulesIndex++
    } else {
      return NO_MATCH
    }
  }

  if (rulesIndex < rules.length) return PARTIAL_MATCH
  return FULL_MATCH
}

function tokenMatches(rule: TokenRule, token: Token): boolean {
  if (rule.rule === SINGLE_TOKEN) {
    const typeResult = rule.type === token.type
    const valueResult =
      rule.value === null ||
      rule.value === undefined ||
      (typeof rule.value === 'string' && rule.value === token.value) ||
      (rule.value instanceof RegExp && rule.value.test(token.value))

    const result = typeResult && valueResult

    return rule.negate === true ? !result : result
  }

  if (Array.isArray(rule.match)) {
    return rule.match.some(match => tokenMatches(match, token))
  }

  return false
}
