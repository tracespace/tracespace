import {Token} from '../lexer'
import {TokenRule, SINGLE_TOKEN, MIN_TO_MAX} from './rules'
import {SyntaxRule, MatchState} from './types'

const FULL_MATCH = 'FULL_MATCH'
const PARTIAL_MATCH = 'PARTIAL_MATCH'
const NO_MATCH = 'NO_MATCH'

type ListMatch = typeof FULL_MATCH | typeof PARTIAL_MATCH | typeof NO_MATCH

export function createMatchSyntax<M>(
  ...grammar: Array<SyntaxRule<M>>
): (state: MatchState<M> | null, token: Token) => MatchState<M> {
  return (state, token) => matchSyntax(state, token, grammar)
}

export function matchSyntax<M>(
  state: MatchState<M> | null,
  token: Token,
  grammar: Array<SyntaxRule<M>>
): MatchState<M> {
  if (state === null) state = {candidates: grammar, tokens: []}
  const {candidates: previousCandidates} = state
  const candidates = []
  const tokens = [...state.tokens, token]

  let i
  for (i = 0; i < previousCandidates.length; i++) {
    const rule = previousCandidates[i]
    const result = tokenListMatches(rule.rules, tokens)

    if (result === PARTIAL_MATCH) {
      candidates.push(rule)
    } else if (result === FULL_MATCH) {
      const nodes = rule.createNodes(tokens)
      return {candidates: [], tokens, nodes, filetype: rule.filetype}
    }
  }

  return {candidates, tokens}
}

function tokenListMatches(rules: TokenRule[], tokens: Token[]): ListMatch {
  let i = 0
  let j = 0
  let multiMatchCount = 0

  while (i < rules.length && j < tokens.length) {
    const rule = rules[i]
    const token = tokens[j]
    const match = tokenMatches(rule, token)

    if (match) {
      if (
        rule.rule === SINGLE_TOKEN ||
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

function tokenMatches(rule: TokenRule, token: Token): boolean {
  if (rule.rule === SINGLE_TOKEN) {
    const typeResult = rule.type === token.type
    const valueResult =
      rule.value === null ||
      typeof rule.value === 'undefined' ||
      (typeof rule.value === 'string' && rule.value === token.value) ||
      (rule.value instanceof RegExp && rule.value.test(token.value))

    const result = typeResult && valueResult

    return rule.negate ? !result : result
  }

  if (Array.isArray(rule.match)) {
    return rule.match.some(match => tokenMatches(match, token))
  }

  return false
}
