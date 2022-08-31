import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest'
import * as td from 'testdouble'

import type {Token, Lexer, LexerState} from '../lexer'
import {createLexer} from '../lexer'
import {matchSyntax} from '../syntax'
import type {GerberNode} from '../tree'
import {createParser} from '..'

vi.mock('../lexer', () => td.object<unknown>())
vi.mock('../syntax', () => td.object<unknown>())

describe('parser', () => {
  let lexer: Lexer

  beforeEach(async () => {
    lexer = td.object<Lexer>()
    td.when(createLexer()).thenReturn(lexer)
  })

  afterEach(() => {
    td.reset()
  })

  it('should tokenize the input and match the tokens', () => {
    const token1 = {type: 'WHITESPACE'} as Token
    const token2 = {type: 'NEWLINE'} as Token
    const lexerState1 = {offset: 1} as LexerState
    const lexerState2 = {offset: 2} as LexerState

    td.when(lexer.feed('abc123', null)).thenReturn([
      [token1, lexerState1] as [Token, LexerState],
      [token2, lexerState2] as [Token, LexerState],
    ])

    td.when(
      matchSyntax(
        [
          [token1, lexerState1],
          [token2, lexerState2],
        ],
        null
      )
    ).thenReturn({
      filetype: 'gerber',
      nodes: [{type: 'comment'} as GerberNode],
      unmatched: '',
    })

    const subject = createParser()
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

    td.when(lexer.feed('abc123', null)).thenReturn([
      [token1, lexerState1] as [Token, LexerState],
    ])

    td.when(lexer.feed('123def456', lexerState1)).thenReturn([
      [token2, lexerState2] as [Token, LexerState],
    ])

    td.when(lexer.feed('456ghi789', lexerState1)).thenReturn([
      [token3, lexerState3] as [Token, LexerState],
    ])

    td.when(matchSyntax([[token1, lexerState1]], null)).thenReturn({
      filetype: 'gerber',
      nodes: [{type: 'comment'} as GerberNode],
      unmatched: '123',
      lexerState: lexerState1,
    })

    td.when(matchSyntax([[token2, lexerState2]], 'gerber')).thenReturn({
      filetype: null,
      nodes: [{type: 'unimplemented'} as GerberNode],
      unmatched: '456',
      lexerState: null,
    })

    td.when(matchSyntax([[token3, lexerState3]], 'gerber')).thenReturn({
      filetype: null,
      nodes: [{type: 'done'}],
      unmatched: '',
      lexerState: null,
    })

    const subject = createParser()
    const result = subject.feed('abc123').feed('def456').feed('ghi789').result()

    expect(result).to.eql({
      type: 'root',
      filetype: 'gerber',
      children: [{type: 'comment'}, {type: 'unimplemented'}, {type: 'done'}],
    })
  })
})
