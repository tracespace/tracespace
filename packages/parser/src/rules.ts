import {Token} from './lexer'
import {GrammarRule, GrammarMatch} from './grammar'

const TOKEN = 'TOKEN'
const MIN_TO_MAX = 'MIN_TO_MAX'

const FULL_MATCH = 'FULL_MATCH'
const PARTIAL_MATCH = 'PARTIAL_MATCH'
const NO_MATCH = 'NO_MATCH'

export interface MatchState<Type extends string> {
  candidates: GrammarRule<Type>[]
  tokens: Token[]
  match?: GrammarMatch<Type>
}

export interface TokenRule {
  rule: typeof TOKEN
  type: Token['type']
  value: Token['value'] | RegExp | null | undefined
  negate?: boolean
}

export interface MinToMaxRule {
  rule: typeof MIN_TO_MAX
  min: number
  max: number
  match: Array<TokenRule>
}

export type Rule = TokenRule | MinToMaxRule

export const initialMatchState = <Type extends string>(
  candidates: GrammarRule<Type>[]
): MatchState<Type> => ({
  candidates,
  tokens: [],
})

export function reduceMatchState<Type extends string>(
  state: MatchState<Type>,
  token: Token
): MatchState<Type> {
  const {candidates: prevCandidates} = state
  const candidates = []
  const tokens = [...state.tokens, token]

  let i
  for (i = 0; i < prevCandidates.length; i++) {
    const rule = prevCandidates[i]
    const result = tokenListMatches(rule.match, tokens)

    if (result === FULL_MATCH) {
      const match = {type: rule.type, filetype: rule.filetype, tokens}
      return {candidates: [], tokens, match}
    }

    if (result === PARTIAL_MATCH) {
      candidates.push(rule)
    }
  }

  return {candidates, tokens}
}

export function token(
  type: Token['type'],
  value?: Token['value'] | RegExp
): TokenRule {
  return {rule: TOKEN, type, value}
}

export function notToken(
  type: Token['type'],
  value?: Token['value']
): TokenRule {
  return {rule: TOKEN, type, value, negate: true}
}

export function one(match: Array<TokenRule>): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 1, max: 1, match}
}

export function zeroOrOne(match: Array<TokenRule>): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 0, max: 1, match}
}

export function zeroOrMore(match: Array<TokenRule>): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 0, max: Infinity, match}
}

export function oneOrMore(match: Array<TokenRule>): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 1, max: Infinity, match}
}

export function minToMax(
  min: number,
  max: number,
  match: Array<TokenRule>
): MinToMaxRule {
  return {rule: MIN_TO_MAX, min, max, match}
}

type ListMatch = typeof FULL_MATCH | typeof PARTIAL_MATCH | typeof NO_MATCH

function tokenListMatches(rules: Array<Rule>, tokens: Array<Token>): ListMatch {
  let i = 0
  let j = 0
  let multiMatchCount = 0

  while (i < rules.length && j < tokens.length) {
    let rule = rules[i]
    let token = tokens[j]
    let match = tokenMatches(rule, token)

    if (match) {
      if (
        rule.rule === TOKEN ||
        (rule.rule === MIN_TO_MAX && multiMatchCount >= rule.max - 1)
      ) {
        i++
        j++
        multiMatchCount = 0
      } else if (rule.rule === MIN_TO_MAX) {
        j++
        multiMatchCount++
      }
    } else if (rule.rule === MIN_TO_MAX && multiMatchCount >= rule.min) {
      multiMatchCount = 0
      i++
    } else {
      return NO_MATCH
    }
  }

  if (i < rules.length) return PARTIAL_MATCH
  return FULL_MATCH
}

function tokenMatches(rule: Rule, token: Token): boolean {
  if (rule.rule === TOKEN) {
    const typeResult = rule.type === token.type
    const valueResult =
      rule.value == null ||
      (typeof rule.value === 'string' && rule.value === token.value) ||
      (rule.value instanceof RegExp && rule.value.test(token.value))

    const result = typeResult && valueResult

    return rule.negate ? !result : result
  }

  if (Array.isArray(rule.match)) {
    return rule.match.some(function checkRuleMatch(match) {
      return tokenMatches(match, token)
    })
  }

  return false
}
