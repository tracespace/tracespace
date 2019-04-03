// tests for @tracespace/parser

import {expect} from 'chai'
import * as td from 'testdouble'
import {select} from 'unist-util-select'

import * as Lexer from '../lexer'
import * as Parser from '..'
import {token as t} from './helpers'

describe('@tracepace/parser with gerber files', () => {
  let parser: Parser.Parser

  beforeEach(() => {
    parser = Parser.createParser()
    td.replace(parser, 'lexer')
  })

  afterEach(() => {
    td.reset()
  })

  const feedTokens = (tokens: Array<Lexer.Token>): void => {
    td.when(parser.lexer.next()).thenReturn(...tokens, undefined)
    parser.feed('mock data')
  }

  describe('root.done', () => {
    it('should set done to true on root with M02', () => {
      feedTokens([t(Lexer.M_CODE, '2'), t(Lexer.ASTERISK, '*')])
      expect(parser.results().done).to.equal(true)
    })

    it('should set done to true on root with M00', () => {
      feedTokens([t(Lexer.M_CODE, '0'), t(Lexer.ASTERISK, '*')])
      expect(parser.results().done).to.equal(true)
    })
  })

  describe('extended blocks', () => {
    const feedExtended = (tokens: Array<Lexer.Token>): void =>
      feedTokens([
        t(Lexer.PERCENT, '%'),
        ...tokens,
        t(Lexer.ASTERISK, '*'),
        t(Lexer.PERCENT, '%'),
      ])

    describe('%FS', () => {
      it('should add node with leading suppression and absolute', () => {
        feedExtended([
          t(Lexer.GERBER_FORMAT, 'LA'),
          t(Lexer.CHAR, 'X'),
          t(Lexer.NUMBER, '34'),
          t(Lexer.CHAR, 'Y'),
          t(Lexer.NUMBER, '34'),
        ])

        const expected: Parser.CoordinateFormat = {
          type: 'coordinateFormat',
          format: [3, 4],
          zeroSuppression: 'leading',
          mode: 'absolute',
        }
        const result = select(
          'root > header > coordinateFormat',
          parser.results()
        )
        expect(result).to.eql(expected)
      })

      it('should add node with trailing suppression and incremental', () => {
        feedExtended([
          t(Lexer.GERBER_FORMAT, 'TI'),
          t(Lexer.CHAR, 'X'),
          t(Lexer.NUMBER, '45'),
          t(Lexer.CHAR, 'Y'),
          t(Lexer.NUMBER, '45'),
        ])

        const expected: Parser.CoordinateFormat = {
          type: 'coordinateFormat',
          format: [4, 5],
          zeroSuppression: 'trailing',
          mode: 'incremental',
        }
        const result = select(
          'root > header > coordinateFormat',
          parser.results()
        )
        expect(result).to.eql(expected)
      })

      it('should allow missing specs and ignore other stuff', () => {
        feedExtended([
          t(Lexer.GERBER_FORMAT, 'DA'),
          t(Lexer.CATCHALL, 'N'),
          t(Lexer.NUMBER, '2'),
          t(Lexer.CHAR, 'X'),
          t(Lexer.NUMBER, '22'),
          t(Lexer.CHAR, 'Y'),
          t(Lexer.NUMBER, '22'),
          t(Lexer.CATCHALL, 'Z'),
          t(Lexer.NUMBER, '2'),
        ])

        const expected: Parser.CoordinateFormat = {
          type: 'coordinateFormat',
          format: [2, 2],
          zeroSuppression: null,
          mode: 'absolute',
        }
        const result = select(
          'root > header > coordinateFormat',
          parser.results()
        )
        expect(result).to.eql(expected)
      })
    })

    describe('%MO', () => {
      it('should add inches units node with %MOIN*%', () => {
        feedExtended([t(Lexer.GERBER_UNITS, 'IN')])

        const expected: Parser.Units = {type: 'units', units: 'in'}
        const result = select('root > header > units', parser.results())
        expect(result).to.eql(expected)
      })

      it('should add inches units node with %MOMM*%', () => {
        feedExtended([t(Lexer.GERBER_UNITS, 'MM')])

        const expected: Parser.Units = {type: 'units', units: 'mm'}
        const result = select('root > header > units', parser.results())
        expect(result).to.eql(expected)
      })
    })

    describe('%AD', () => {
      type SpecItem = {
        name: string
        tokens: Array<Lexer.Token>
        expected: Parser.ToolDefinition
      }

      const makeExpected = (
        code: string,
        shape: Parser.ToolShape,
        hole: Parser.HoleShape | null = null
      ): Parser.ToolDefinition => ({type: 'toolDefinition', code, shape, hole})

      const SPECS: Array<SpecItem> = [
        // %ADD10C,.025*%
        {
          name: 'circle with no hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '10'),
            t(Lexer.GERBER_TOOL_NAME, 'C'),
            t(Lexer.NUMBER, '.025'),
          ],
          expected: makeExpected('10', {type: 'circle', diameter: 0.025}),
        },
        // %ADD10C,0.5X0.1*%
        {
          name: 'circle with circle hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '10'),
            t(Lexer.GERBER_TOOL_NAME, 'C'),
            t(Lexer.NUMBER, '0.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.1'),
          ],
          expected: makeExpected(
            '10',
            {type: 'circle', diameter: 0.5},
            {type: 'circle', diameter: 0.1}
          ),
        },
        // %ADD10C,0.5X0.1X0.2*%
        {
          name: 'circle with rectangle hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '10'),
            t(Lexer.GERBER_TOOL_NAME, 'C'),
            t(Lexer.NUMBER, '0.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.1'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.2'),
          ],
          expected: makeExpected(
            '10',
            {type: 'circle', diameter: 0.5},
            {type: 'rectangle', xSize: 0.1, ySize: 0.2}
          ),
        },
        // %ADD11R,0.5X0.6*%
        {
          name: 'rectangle with no hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '11'),
            t(Lexer.GERBER_TOOL_NAME, 'R'),
            t(Lexer.NUMBER, '0.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.6'),
          ],
          expected: makeExpected('11', {
            type: 'rectangle',
            xSize: 0.5,
            ySize: 0.6,
          }),
        },
        // %ADD11R,0.5X0.6X0.2*%
        {
          name: 'rectangle with circle hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '11'),
            t(Lexer.GERBER_TOOL_NAME, 'R'),
            t(Lexer.NUMBER, '0.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.6'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.2'),
          ],
          expected: makeExpected(
            '11',
            {type: 'rectangle', xSize: 0.5, ySize: 0.6},
            {type: 'circle', diameter: 0.2}
          ),
        },
        // %ADD11R,0.5X0.6X0.2X0.1*%
        {
          name: 'rectangle with rectangle hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '11'),
            t(Lexer.GERBER_TOOL_NAME, 'R'),
            t(Lexer.NUMBER, '0.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.6'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.2'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.1'),
          ],
          expected: makeExpected(
            '11',
            {type: 'rectangle', xSize: 0.5, ySize: 0.6},
            {type: 'rectangle', xSize: 0.2, ySize: 0.1}
          ),
        },
        // %ADD12O,0.5X0.6*%
        {
          name: 'obround with no hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '12'),
            t(Lexer.GERBER_TOOL_NAME, 'O'),
            t(Lexer.NUMBER, '0.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.6'),
          ],
          expected: makeExpected('12', {
            type: 'obround',
            xSize: 0.5,
            ySize: 0.6,
          }),
        },
        // %ADD12O,0.5X0.6X0.2*%
        {
          name: 'obround with circle hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '12'),
            t(Lexer.GERBER_TOOL_NAME, 'O'),
            t(Lexer.NUMBER, '0.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.6'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.2'),
          ],
          expected: makeExpected(
            '12',
            {type: 'obround', xSize: 0.5, ySize: 0.6},
            {type: 'circle', diameter: 0.2}
          ),
        },
        // %ADD12O,0.5X0.6X0.2X0.1*%
        {
          name: 'obround with rectangle hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '12'),
            t(Lexer.GERBER_TOOL_NAME, 'O'),
            t(Lexer.NUMBER, '0.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.6'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.2'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '0.1'),
          ],
          expected: makeExpected(
            '12',
            {type: 'obround', xSize: 0.5, ySize: 0.6},
            {type: 'rectangle', xSize: 0.2, ySize: 0.1}
          ),
        },
        // %ADD13P,1.5X3*%
        {
          name: 'polygon with no rotation and no hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '13'),
            t(Lexer.GERBER_TOOL_NAME, 'P'),
            t(Lexer.NUMBER, '1.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '3'),
          ],
          expected: makeExpected('13', {
            type: 'polygon',
            diameter: 1.5,
            vertices: 3,
            rotation: null,
          }),
        },
        // %ADD13P,2.5X4X12.5*%
        {
          name: 'polygon with rotation and no hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '13'),
            t(Lexer.GERBER_TOOL_NAME, 'P'),
            t(Lexer.NUMBER, '2.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '4'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '12.5'),
          ],
          expected: makeExpected('13', {
            type: 'polygon',
            diameter: 2.5,
            vertices: 4,
            rotation: 12.5,
          }),
        },
        // %ADD13P,2.5X4X12.5X1*%
        {
          name: 'polygon with rotation and circle hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '13'),
            t(Lexer.GERBER_TOOL_NAME, 'P'),
            t(Lexer.NUMBER, '2.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '4'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '12.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '1'),
          ],
          expected: makeExpected(
            '13',
            {type: 'polygon', diameter: 2.5, vertices: 4, rotation: 12.5},
            {type: 'circle', diameter: 1}
          ),
        },
        // %ADD13P,2.5X4X12.5X1X1.5*%
        {
          name: 'polygon with rotation and rectangle hole',
          tokens: [
            t(Lexer.GERBER_TOOL_DEF, '13'),
            t(Lexer.GERBER_TOOL_NAME, 'P'),
            t(Lexer.NUMBER, '2.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '4'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '12.5'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '1'),
            t(Lexer.CHAR, 'X'),
            t(Lexer.NUMBER, '1.5'),
          ],
          expected: makeExpected(
            '13',
            {type: 'polygon', diameter: 2.5, vertices: 4, rotation: 12.5},
            {type: 'rectangle', xSize: 1, ySize: 1.5}
          ),
        },
      ]

      SPECS.forEach(spec =>
        it(spec.name, () => {
          feedExtended(spec.tokens)
          const res = select('root > header > toolDefinition', parser.results())
          expect(res).to.eql(spec.expected)
        })
      )
    })

    describe.skip('%AM', () => {})

    describe.skip('%LP', () => {})
  })
})
