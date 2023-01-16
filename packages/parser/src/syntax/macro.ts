// Gerber aperture macro syntax
import * as Lexer from '../lexer'
import * as Tree from '../tree'
import type {MacroValue, MacroPrimitiveCode} from '../types'

import {tokensToPosition} from './map-tokens'
import type {SyntaxRule} from './rules'
import {token, notToken, zeroOrMore, oneOrMore, findSyntaxMatch} from './rules'

const macroComment: SyntaxRule<Tree.MacroBlock> = {
  name: 'macroComment',
  rules: [
    token(Lexer.NUMBER, '0'),
    zeroOrMore([notToken(Lexer.ASTERISK)]),
    token(Lexer.ASTERISK),
  ],
  createNodes: createMacroComment,
}

const macroVariable: SyntaxRule<Tree.MacroBlock> = {
  name: 'macroVariable',
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

const macroPrimitive: SyntaxRule<Tree.MacroBlock> = {
  name: 'macroPrimitive',
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

function createMacroComment(tokens: Lexer.Token[]): Tree.MacroComment[] {
  const comment = tokens
    .slice(1, -1)
    .map(t => t.text)
    .join('')
    .trim()

  return [
    {type: Tree.MACRO_COMMENT, position: tokensToPosition(tokens), comment},
  ]
}

function createMacroPrimitive(tokens: Lexer.Token[]): Tree.MacroPrimitive[] {
  const code = tokens[0].value as MacroPrimitiveCode
  const commaDelimitedTokens: Lexer.Token[][] = [[]]
  let currentGroup = commaDelimitedTokens[0]

  for (const token of tokens.slice(2, -1)) {
    if (token.type === Lexer.COMMA) {
      currentGroup = []
      commaDelimitedTokens.push(currentGroup)
    } else {
      currentGroup.push(token)
    }
  }

  const parameters = commaDelimitedTokens.map(tokens =>
    parseMacroExpression(tokens)
  )

  return [
    {
      type: Tree.MACRO_PRIMITIVE,
      position: tokensToPosition(tokens),
      code,
      parameters,
    },
  ]
}

function createMacroVariable(tokens: Lexer.Token[]): Tree.MacroVariable[] {
  const name = tokens[0].value
  const value = parseMacroExpression(tokens.slice(2, -1))

  return [
    {
      type: Tree.MACRO_VARIABLE,
      position: tokensToPosition(tokens),
      name,
      value,
    },
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

  // Parse numbers, variables, and parenthesis
  function parsePrimary(): MacroValue {
    const token = toParse.shift()!

    if (token.type === Lexer.NUMBER) return Number(token.value)
    if (token.type === Lexer.GERBER_MACRO_VARIABLE) return token.value

    // Else, we've got a parentheses group, so parse it and consume the ")"
    const expression = parseAddition()
    toParse.shift()
    return expression
  }

  // Parse multiplication and division operations
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

export function parseMacroBlocks(tokens: Lexer.Token[]): Tree.MacroBlock[] {
  let matchedCandidates = MACRO_GRAMMAR
  let matchedTokens: Lexer.Token[] = []
  const blocks: Tree.MacroBlock[] = []

  for (const token of tokens) {
    const result = findSyntaxMatch([...matchedTokens, token], matchedCandidates)

    if (result.nodes) blocks.push(...result.nodes)
    matchedTokens = result.tokens ?? []
    matchedCandidates = result.candidates ?? MACRO_GRAMMAR
  }

  return blocks
}
