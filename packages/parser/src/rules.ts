import {Token} from './lexer'
import {GrammarMatch} from './grammar'

const TOKEN = 'TOKEN'
const NOT_TOKEN = 'NOT_TOKEN'
const MIN_TO_MAX = 'MIN_TO_MAX'

const FULL_MATCH = 'FULL_MATCH'
const PARTIAL_MATCH = 'PARTIAL_MATCH'
const NO_MATCH = 'NO_MATCH'

export interface MatchState {
  candidates: Array<GrammarMatch>
  tokens: Array<Token>
  match: GrammarMatch | null
}

export interface TokenRule {
  rule: typeof TOKEN
  type: Token['type']
  value: Token['value'] | null | undefined
  negate?: boolean
}

export interface MinToMaxRule {
  rule: typeof MIN_TO_MAX
  min: number
  max: number
  match: Array<TokenRule>
}

export type Rule = TokenRule | MinToMaxRule

export function findMatch(state: MatchState, token: Token): MatchState {
  const {candidates, match, tokens} = state

  return candidates.reduce<MatchState>(
    (nextState, cand) => {
      const result = isMatch(cand.match, nextState.tokens)

      if (result === FULL_MATCH) {
        nextState.match = nextState.match || cand
      } else if (result === PARTIAL_MATCH) {
        nextState.candidates.push(cand)
      }

      return nextState
    },
    {candidates: [], match, tokens: [...tokens, token]}
  )
}

export function token(type: Token['type'], value?: Token['value']): TokenRule {
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

export function minToMax(
  min: number,
  max: number,
  match: Array<TokenRule>
): MinToMaxRule {
  return {rule: MIN_TO_MAX, min, max, match}
}

type Match = typeof FULL_MATCH | typeof PARTIAL_MATCH | typeof NO_MATCH

function isMatch(rules: Array<Rule>, tokens: Array<Token>): Match {
  let i = 0
  let j = 0
  let multiMatchCount = 0

  while (i < rules.length && j < tokens.length) {
    let rule = rules[i]
    let token = tokens[j]
    let match = checkToken(rule, token)

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

function checkToken(rule: Rule, token: Token): boolean {
  if (rule.rule === TOKEN) {
    const result =
      rule.type === token.type &&
      (rule.value == null || rule.value === token.value)

    return rule.negate ? !result : result
  }

  if (Array.isArray(rule.match)) {
    return rule.match.some(function checkRuleMatch(match) {
      return checkToken(match, token)
    })
  }

  return false
}
