// Tests for @tracespace/parser

import {describe, it, beforeEach, expect} from 'vitest'
import type {Parser} from '..'
import {ROOT, COMMENT, DONE, GERBER, createParser} from '..'

describe('@tracespace/parser', () => {
  let parser: Parser

  beforeEach(() => {
    parser = createParser()
  })

  it('should raise if no AST yet', () => {
    expect(parser.result).to.throw('File type not recognized')
  })

  it('should feed its input into the tree', () => {
    parser.feed('G04 hello world*')

    expect(parser.result()).to.eql({
      type: ROOT,
      filetype: GERBER,
      children: [
        {
          type: COMMENT,
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 16, offset: 15},
          },
          comment: 'hello world',
        },
      ],
    })
  })

  it('should be chainable', () => {
    const result = parser.feed('G04 hello world*').result()
    expect(result).to.eql({
      type: ROOT,
      filetype: GERBER,
      children: [
        {
          type: COMMENT,
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 16, offset: 15},
          },
          comment: 'hello world',
        },
      ],
    })
  })

  it('should handle multiple feedings', () => {
    parser.feed('G04 hello world*\n')
    parser.feed('M00*')

    expect(parser.result()).to.eql({
      type: ROOT,
      filetype: GERBER,
      children: [
        {
          type: COMMENT,
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 16, offset: 15},
          },
          comment: 'hello world',
        },
        {
          type: DONE,
          position: {
            start: {line: 2, column: 1, offset: 17},
            end: {line: 2, column: 4, offset: 20},
          },
        },
      ],
    })
  })

  it('should handle multiple feedings with unexpected splits for streaming support', () => {
    parser.feed('G0')
    parser.feed('4 hello ')
    parser.feed('world*\nM')
    parser.feed('00')
    parser.feed('*\n')

    expect(parser.result()).to.eql({
      type: ROOT,
      filetype: GERBER,
      children: [
        {
          type: COMMENT,
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 16, offset: 15},
          },
          comment: 'hello world',
        },
        {
          type: DONE,
          position: {
            start: {line: 2, column: 1, offset: 17},
            end: {line: 2, column: 4, offset: 20},
          },
        },
      ],
    })
  })
})
