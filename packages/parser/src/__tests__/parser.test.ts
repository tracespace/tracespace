// tests for @tracespace/parser

import {expect} from 'chai'
import * as td from 'testdouble'
import {select} from 'unist-util-select'

import * as Lexer from '../lexer'
import * as Parser from '..'

type Token = Pick<Lexer.Token, 'type' | 'value'> | null

describe('@tracepace/parser', () => {
  let parser: Parser.Parser

  beforeEach(() => {
    parser = Parser.createParser()
    td.replace(parser, 'lexer')
  })

  afterEach(() => {
    td.reset()
  })

  const feedTokens = (tokens: Array<Token>): void => {
    td.when(parser.lexer.next()).thenReturn(...tokens)
    parser.feed('mock data')
  }

  it('should return an AST', () => {
    const expected: Parser.Root = {
      type: 'root',
      filetype: null,
      done: false,
      children: [{type: 'header', children: []}, {type: 'image', children: []}],
    }

    expect(parser.results()).to.eql(expected)
  })

  it('should feed its input to the lexer', () => {
    parser.feed('mock data')
    td.verify(parser.lexer.reset('mock data'))
    td.verify(parser.lexer.next())
  })

  describe('parsing drill files', () => {
    describe('units', () => {
      it('should add mm units node to header given M71', () => {
        feedTokens([
          {type: Lexer.M_CODE, value: '71'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Units = {type: 'units', units: 'mm'}
        const result = select('root > header > units', parser.results())
        expect(result).to.eql(expected)
      })

      it('should add in units node to header given M72', () => {
        feedTokens([
          {type: Lexer.M_CODE, value: '72'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Units = {type: 'units', units: 'in'}
        const result = select('root > header > units', parser.results())
        expect(result).to.eql(expected)
      })

      it('should add mm units node to header given METRIC', () => {
        feedTokens([
          {type: Lexer.DRILL_UNITS, value: 'METRIC'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Units = {type: 'units', units: 'mm'}
        const result = select('root > header > units', parser.results())
        expect(result).to.eql(expected)
      })

      it('should add "in" units node to header given INCH', () => {
        feedTokens([
          {type: Lexer.DRILL_UNITS, value: 'INCH'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Units = {type: 'units', units: 'in'}
        const result = select('root > header > units', parser.results())
        expect(result).to.eql(expected)
      })
    })

    describe('zero suppression', () => {
      it('should add trailing suppression node to header given ,LZ', () => {
        feedTokens([
          {type: Lexer.DRILL_UNITS, value: 'METRIC'},
          {type: Lexer.DRILL_ZERO_INCLUSION, value: 'LZ'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.CoordinateFormat = {
          type: 'coordinateFormat',
          zeroSuppression: 'trailing',
          format: null,
          mode: null,
        }
        const result = select(
          'root > header > coordinateFormat',
          parser.results()
        )
        expect(result).to.eql(expected)
      })

      it('should add leading suppression node to header given ,TZ', () => {
        feedTokens([
          {type: Lexer.DRILL_UNITS, value: 'METRIC'},
          {type: Lexer.DRILL_ZERO_INCLUSION, value: 'TZ'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.CoordinateFormat = {
          type: 'coordinateFormat',
          zeroSuppression: 'leading',
          format: null,
          mode: null,
        }
        const result = select(
          'root > header > coordinateFormat',
          parser.results()
        )
        expect(result).to.eql(expected)
      })
    })

    describe('coordinate format', () => {
      it('should set coordinate format', () => {
        feedTokens([
          {type: Lexer.DRILL_UNITS, value: 'METRIC'},
          {type: Lexer.DRILL_COORD_FORMAT, value: '000.0000'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.CoordinateFormat = {
          type: 'coordinateFormat',
          format: [3, 4],
          zeroSuppression: null,
          mode: null,
        }
        const result = select(
          'root > header > coordinateFormat',
          parser.results()
        )
        expect(result).to.eql(expected)
      })

      it('should set coordinate format if zero suppression specified', () => {
        feedTokens([
          {type: Lexer.DRILL_UNITS, value: 'METRIC'},
          {type: Lexer.DRILL_ZERO_INCLUSION, value: 'TZ'},
          {type: Lexer.DRILL_COORD_FORMAT, value: '0000.00'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.CoordinateFormat = {
          type: 'coordinateFormat',
          format: [4, 2],
          zeroSuppression: 'leading',
          mode: null,
        }
        const result = select(
          'root > header > coordinateFormat',
          parser.results()
        )
        expect(result).to.eql(expected)
      })
    })

    describe('tools', () => {
      it('should add tool definition to header with TxCx', () => {
        feedTokens([
          {type: Lexer.T_CODE, value: '1'},
          {type: Lexer.DRILL_TOOL_PROPS, value: 'C0.015'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.ToolDefinition = {
          type: 'toolDefinition',
          code: '1',
          shape: {type: 'circle', diameter: 0.015},
          hole: null,
        }
        const result = select(
          'root > header > toolDefinition',
          parser.results()
        )
        expect(result).to.eql(expected)
      })

      it('should add a tool change to the image with Tx', () => {
        feedTokens([
          {type: Lexer.T_CODE, value: '42'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Tool = {
          type: 'tool',
          code: '42',
          children: [],
        }
        const result = select('root > image > tool', parser.results())
        expect(result).to.eql(expected)
      })

      it('should add flash children to the tool change node', () => {
        feedTokens([
          {type: Lexer.T_CODE, value: '42'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '21'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '42'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Graphic = {
          type: 'graphic',
          graphic: 'shape',
          coordinates: {x: '21', y: '42'},
        }
        const result = select('root > image > tool > graphic', parser.results())
        expect(result).to.eql(expected)
      })

      it('should allow tool change before flash coordinate', () => {
        feedTokens([
          {type: Lexer.T_CODE, value: '1'},
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '2'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '3'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Tool = {
          type: 'tool',
          code: '1',
          children: [
            {
              type: 'graphic',
              graphic: 'shape',
              coordinates: {x: '2', y: '3'},
            },
          ],
        }
        const result = select('root > image > tool', parser.results())
        expect(result).to.eql(expected)
      })

      it('should allow tool change after flash coordinate', () => {
        feedTokens([
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '2'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '3'},
          {type: Lexer.T_CODE, value: '1'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Tool = {
          type: 'tool',
          code: '1',
          children: [
            {
              type: 'graphic',
              graphic: 'shape',
              coordinates: {x: '2', y: '3'},
            },
          ],
        }
        const result = select('root > image > tool', parser.results())
        expect(result).to.eql(expected)
      })

      it('should handle multiple tools and flashes', () => {
        feedTokens([
          {type: Lexer.T_CODE, value: '1'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '2'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '3'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '4'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '5'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.T_CODE, value: '6'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '7'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '8'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '9'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '10'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Image = {
          type: 'image',
          children: [
            {
              type: 'tool',
              code: '1',
              children: [
                {
                  type: 'graphic',
                  graphic: 'shape',
                  coordinates: {x: '2', y: '3'},
                },
                {
                  type: 'graphic',
                  graphic: 'shape',
                  coordinates: {x: '4', y: '5'},
                },
              ],
            },
            {
              type: 'tool',
              code: '6',
              children: [
                {
                  type: 'graphic',
                  graphic: 'shape',
                  coordinates: {x: '7', y: '8'},
                },
                {
                  type: 'graphic',
                  graphic: 'shape',
                  coordinates: {x: '9', y: '10'},
                },
              ],
            },
          ],
        }
        const result = select('root > image', parser.results())
        expect(result).to.eql(expected)
      })

      it('should handle missing X or Y', () => {
        feedTokens([
          {type: Lexer.T_CODE, value: '1'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '2'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '3'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.CHAR, value: 'X'},
          {type: Lexer.NUMBER, value: '4'},
          {type: Lexer.NEWLINE, value: '\n'},
          {type: Lexer.CHAR, value: 'Y'},
          {type: Lexer.NUMBER, value: '5'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])

        const expected: Parser.Image = {
          type: 'image',
          children: [
            {
              type: 'tool',
              code: '1',
              children: [
                {
                  type: 'graphic',
                  graphic: 'shape',
                  coordinates: {x: '2', y: '3'},
                },
                {type: 'graphic', graphic: 'shape', coordinates: {x: '4'}},
                {type: 'graphic', graphic: 'shape', coordinates: {y: '5'}},
              ],
            },
          ],
        }
        const result = select('root > image', parser.results())
        expect(result).to.eql(expected)
      })
    })

    describe('root.done', () => {
      it('should set done to true on root with M30', () => {
        feedTokens([
          {type: Lexer.M_CODE, value: '30'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])
        expect(parser.results().done).to.equal(true)
      })

      it('should set done to true on root with M00', () => {
        feedTokens([
          {type: Lexer.M_CODE, value: '0'},
          {type: Lexer.NEWLINE, value: '\n'},
          null,
        ])
        expect(parser.results().done).to.equal(true)
      })
    })
  })
})
