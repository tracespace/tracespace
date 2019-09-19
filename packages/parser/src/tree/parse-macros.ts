import {
  Token,
  COMMA,
  NUMBER,
  GERBER_MACRO_VARIABLE,
  OPERATOR,
  COORD_CHAR,
} from '../lexer'
import * as Grammar from '../grammar'
import * as Rules from '../rules'

import {
  ToolMacro,
  MacroComment,
  MacroVariable,
  MacroPrimitive,
  MacroValue,
  TOOL_MACRO,
  MACRO_COMMENT,
  MACRO_VARIABLE,
  MACRO_PRIMITIVE,
} from './nodes'

const INITIAL_MATCH_STATE = Rules.initialMatchState(Grammar.macroGrammar)

export function parseMacroDefinition(tokens: Token[]): ToolMacro {
  const name = tokens[1].value
  const blockTokens = tokens.slice(3, -1)
  const matches: Grammar.GrammarMatch<Grammar.MacroGrammarType>[] = []
  let matchState = INITIAL_MATCH_STATE

  blockTokens.forEach(token => {
    matchState = Rules.reduceMatchState(matchState, token)
    if (matchState.match) matches.push(matchState.match)
    if (matchState.candidates.length === 0) matchState = INITIAL_MATCH_STATE
  })

  const blocks = matches.map(match => {
    switch (match.type) {
      case Grammar.MACRO_COMMENT: {
        return parseMacroComment(match.tokens)
      }

      case Grammar.MACRO_VARIABLE: {
        return parseMacroVariable(match.tokens)
      }

      case Grammar.MACRO_PRIMITIVE: {
        return parseMacroPrimitive(match.tokens)
      }
    }
  })

  return {type: TOOL_MACRO, name, blocks}
}

export function parseMacroComment(tokens: Token[]): MacroComment {
  const value = tokens
    .slice(1, -1)
    .map(t => t.text)
    .join('')

  return {type: MACRO_COMMENT, value}
}

export function parseMacroVariable(tokens: Token[]): MacroVariable {
  const name = tokens[0].value
  const value = parseMacroExpression(tokens.slice(2, -1))

  return {type: MACRO_VARIABLE, name, value}
}

export function parseMacroPrimitive(tokens: Token[]): MacroPrimitive {
  const code = tokens[0].value
  const modifiers = tokens
    .slice(2, -1)
    .reduce<Token[][]>(
      (groups, token) => {
        const current = groups[groups.length - 1]
        if (token.type !== COMMA) {
          current.push(token)
        } else {
          groups.push([])
        }

        return groups
      },
      [[]]
    )
    .map(parseMacroExpression)

  return {type: MACRO_PRIMITIVE, code, modifiers}
}

export function parseMacroExpression(tokens: Token[]): MacroValue {
  const toParse = tokens.reduce<Token[]>((result, token, i) => {
    const {type, value} = token
    const prev = tokens[i - 1]
    const startsWithOp = value.indexOf('-') === 0 || value.indexOf('+') === 0

    if (prev && prev.type === NUMBER && type === NUMBER && startsWithOp) {
      result.push({...token, type: OPERATOR, value: value[0]}, token)
    } else if (type === COORD_CHAR) {
      result.push({...token, type: OPERATOR, value: 'x'})
    } else {
      result.push(token)
    }

    return result
  }, [])

  return parseAddition()

  function peekNextToken(): Token | null {
    return toParse[0] || null
  }

  // parse numbers, variables, and parenthesis
  function parsePrimary(): MacroValue {
    const token = toParse.shift() as Token

    if (token.type === NUMBER) return Number(token.value)
    if (token.type === GERBER_MACRO_VARIABLE) return token.value

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
      nextToken &&
      (nextToken.type === OPERATOR &&
        (nextToken.value === 'x' || nextToken.value === '/'))
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
      nextToken &&
      (nextToken.type === OPERATOR &&
        (nextToken.value === '+' || nextToken.value === '-'))
    ) {
      let operator: '+' | '-' = '+'
      if (nextToken.type === OPERATOR) {
        tokens.shift()
        operator = nextToken.value as '+' | '-'
      }
      const right = parseMultiplication()
      expression = {left: expression, right, operator}
      nextToken = peekNextToken()
    }

    return expression
  }
}
