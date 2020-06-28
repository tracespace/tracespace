import {Token} from '../lexer'

export const SINGLE_TOKEN = 'TOKEN'
export const MIN_TO_MAX = 'MIN_TO_MAX'

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
  match: Array<SingleTokenRule>
}

export type TokenRule = SingleTokenRule | MinToMaxRule

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

export function one(match: Array<SingleTokenRule>): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 1, max: 1, match}
}

export function zeroOrOne(match: Array<SingleTokenRule>): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 0, max: 1, match}
}

export function zeroOrMore(match: Array<SingleTokenRule>): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 0, max: Infinity, match}
}

export function oneOrMore(match: Array<SingleTokenRule>): MinToMaxRule {
  return {rule: MIN_TO_MAX, min: 1, max: Infinity, match}
}

export function minToMax(
  min: number,
  max: number,
  match: Array<SingleTokenRule>
): MinToMaxRule {
  return {rule: MIN_TO_MAX, min, max, match}
}
