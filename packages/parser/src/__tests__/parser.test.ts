import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

import type {Token, Lexer, LexerState} from '../lexer'
import type {GerberNode} from '../tree'
import type {Parser} from '..'

vi.mock('../lexer', () => td.object<unknown>())
vi.mock('../syntax', () => td.object<unknown>())

describe('parser', () => {
  let lexerCreator: typeof import('../lexer')
  let syntaxMatcher: typeof import('../syntax')
  let lexer: Lexer
  let subject: Parser

  beforeEach(async () => {
    lexerCreator = await replaceEsm('../lexer')
    syntaxMatcher = await replaceEsm('../syntax')
    lexer = td.object<Lexer>()

    td.when(lexerCreator.createLexer()).thenReturn(lexer)

    const {createParser} = await import('..')
    subject = createParser()
  })

  afterEach(() => {
    reset()
  })

  it('should tokenize the input and match the tokens', () => {
    const token1 = {type: 'WHITESPACE'} as Token
    const token2 = {type: 'NEWLINE'} as Token
    const lexerState1 = {offset: 1} as LexerState
    const lexerState2 = {offset: 2} as LexerState

    td.when(lexer.feed('abc123', undefined)).thenReturn([
      [token1, lexerState1] as [Token, LexerState],
      [token2, lexerState2] as [Token, LexerState],
    ])

    td.when(
      syntaxMatcher.matchSyntax(
        [
          [token1, lexerState1],
          [token2, lexerState2],
        ],
        undefined
      )
    ).thenReturn({
      filetype: 'gerber',
      nodes: [{type: 'comment'} as GerberNode],
      unmatched: '',
    })

    const result = subject.feed('abc123').result()

    expect(result).to.eql({
      type: 'root',
      filetype: 'gerber',
      children: [{type: 'comment'}],
    })
  })

  it('should preserve state across feedings', () => {
    const token1 = {type: 'WHITESPACE'} as Token
    const token2 = {type: 'NEWLINE'} as Token
    const token3 = {type: 'CATCHALL'} as Token
    const lexerState1 = {offset: 1} as LexerState
    const lexerState2 = {offset: 2} as LexerState
    const lexerState3 = {offset: 3} as LexerState

    td.when(lexer.feed('abc123', undefined)).thenReturn([
      [token1, lexerState1] as [Token, LexerState],
    ])

    td.when(lexer.feed('123def456', lexerState1)).thenReturn([
      [token2, lexerState2] as [Token, LexerState],
    ])

    td.when(lexer.feed('456ghi789', lexerState1)).thenReturn([
      [token3, lexerState3] as [Token, LexerState],
    ])

    td.when(
      syntaxMatcher.matchSyntax([[token1, lexerState1]], undefined)
    ).thenReturn({
      filetype: 'gerber',
      nodes: [{type: 'comment'} as GerberNode],
      unmatched: '123',
      lexerState: lexerState1,
    })

    td.when(
      syntaxMatcher.matchSyntax([[token2, lexerState2]], 'gerber')
    ).thenReturn({
      filetype: undefined,
      nodes: [{type: 'unimplemented'} as GerberNode],
      unmatched: '456',
      lexerState: undefined,
    })

    td.when(
      syntaxMatcher.matchSyntax([[token3, lexerState3]], 'gerber')
    ).thenReturn({
      filetype: undefined,
      nodes: [{type: 'done'}],
      unmatched: '',
      lexerState: undefined,
    })

    const result = subject.feed('abc123').feed('def456').feed('ghi789').result()

    expect(result).to.eql({
      type: 'root',
      filetype: 'gerber',
      children: [{type: 'comment'}, {type: 'unimplemented'}, {type: 'done'}],
    })
  })
})
