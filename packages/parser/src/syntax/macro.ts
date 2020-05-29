// gerber aperture macro syntax
import * as Lexer from '../lexer'
import {
  MACRO_COMMENT,
  MACRO_VARIABLE,
  MACRO_PRIMITIVE,
  MacroBlock,
  MacroComment,
  MacroPrimitive,
  MacroVariable,
} from '../tree'
import {MacroValue} from '../types'
import {SyntaxRule, MatchState} from './types'
import {token, notToken, zeroOrMore, oneOrMore} from './rules'
import {tokensToPosition} from './map-tokens'
import {matchSyntax} from './match-syntax'

const macroComment: SyntaxRule<MacroBlock> = {
  rules: [
    token(Lexer.NUMBER, '0'),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
  ],
  createNodes: createMacroComment,
}

const macroVariable: SyntaxRule<MacroBlock> = {
  rules: [
    token(Lexer.GERBER_MACRO_VARIABLE),
    token(Lexer.EQUALS),
    oneOrMore([
      token(Lexer.NUMBER),
      token(Lexer.OPERATOR),
      token(Lexer.GERBER_MACRO_VARIABLE),
      token(Lexer.COORD_CHAR, 'X'),
    ]),
    token(Lexer.ASTERISK),
  ],
  createNodes: createMacroVariable,
}

const macroPrimitive: SyntaxRule<MacroBlock> = {
  rules: [
    token(Lexer.NUMBER),
    token(Lexer.COMMA),
    oneOrMore([
      token(Lexer.COMMA),
      token(Lexer.NUMBER),
      token(Lexer.OPERATOR),
      token(Lexer.GERBER_MACRO_VARIABLE),
      token(Lexer.COORD_CHAR, 'X'),
    ]),
    token(Lexer.ASTERISK),
  ],
  createNodes: createMacroPrimitive,
}

function createMacroComment(tokens: Lexer.Token[]): MacroComment[] {
  const comment = tokens
    .slice(1, -1)
    .map(t => t.text)
    .join('')
    .trim()

  return [{type: MACRO_COMMENT, position: tokensToPosition(tokens), comment}]
}

function createMacroPrimitive(tokens: Lexer.Token[]): MacroPrimitive[] {
  const code = tokens[0].value
  const modifiers = tokens
    .slice(2, -1)
    .reduce<Lexer.Token[][]>(
      (groups, token) => {
        const current = groups[groups.length - 1]
        if (token.type !== Lexer.COMMA) {
          current.push(token)
        } else {
          groups.push([])
        }

        return groups
      },
      [[]]
    )
    .map(parseMacroExpression)

  return [
    {
      type: MACRO_PRIMITIVE,
      position: tokensToPosition(tokens),
      code,
      modifiers,
    },
  ]
}

function createMacroVariable(tokens: Lexer.Token[]): MacroVariable[] {
  const name = tokens[0].value
  const value = parseMacroExpression(tokens.slice(2, -1))

  return [
    {type: MACRO_VARIABLE, position: tokensToPosition(tokens), name, value},
  ]
}

function parseMacroExpression(tokens: Lexer.Token[]): MacroValue {
  const toParse = tokens.map<Lexer.Token>(token => {
    return token.type === Lexer.COORD_CHAR
      ? {...token, type: Lexer.OPERATOR, value: 'x'}
      : token
  })

  return parseAddition()

  function peekNextToken(): Lexer.Token | null {
    return toParse[0] ?? null
  }

  // parse numbers, variables, and parenthesis
  function parsePrimary(): MacroValue {
    const token = toParse.shift() as Lexer.Token

    if (token.type === Lexer.NUMBER) return Number(token.value)
    if (token.type === Lexer.GERBER_MACRO_VARIABLE) return token.value

    // else, we've got a parentheses group, so parse it and consume the ")"
    const expression = parseAddition()
    toParse.shift()
    return expression
  }

  // parse multiplication and division operations
  function parseMultiplication(): MacroValue {
    let expression = parsePrimary()
    let nextToken = peekNextToken()

    while (
      nextToken?.type === Lexer.OPERATOR &&
      (nextToken.value === 'x' || nextToken.value === '/')
    ) {
      toParse.shift()
      expression = {
        left: expression,
        right: parsePrimary(),
        operator: nextToken.value,
      }
      nextToken = peekNextToken()
    }

    return expression
  }

  function parseAddition(): MacroValue {
    let expression = parseMultiplication()
    let nextToken = peekNextToken()

    while (
      (nextToken?.type === Lexer.OPERATOR &&
        (nextToken.value === '+' || nextToken.value === '-')) ||
      nextToken?.type === Lexer.NUMBER
    ) {
      let operator: '+' | '-' = '+'
      if (nextToken.type === Lexer.OPERATOR) {
        toParse.shift()
        operator = nextToken.value as '+' | '-'
      }
      const right = parseMultiplication()
      expression = {left: expression, right, operator}
      nextToken = peekNextToken()
    }

    return expression
  }
}

const MACRO_GRAMMAR = [macroPrimitive, macroVariable, macroComment]

export function parseMacroBlocks(tokens: Lexer.Token[]): MacroBlock[] {
  let matchState: MatchState<MacroBlock> | null = null
  const blocks: MacroBlock[] = []

  tokens.forEach(token => {
    matchState = matchSyntax(matchState, token, MACRO_GRAMMAR)
    if (matchState.nodes) blocks.push(...matchState.nodes)
    if (matchState.candidates.length === 0) matchState = null
  })

  return blocks
}
