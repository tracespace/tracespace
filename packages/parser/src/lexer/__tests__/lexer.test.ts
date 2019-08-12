// tests for @tracespace/parser lexer
import {expect} from 'chai'
import {toArray} from 'lodash'
import {createLexer, Lexer, Token} from '..'

function getResults(
  lexer: Lexer,
  filterType?: string
): Array<Pick<Token, 'type' | 'value'>> {
  return toArray((lexer as unknown) as Array<Token>)
    .filter(r => r.type === filterType || r.type !== 'NEWLINE')
    .map(r => ({type: r.type, value: r.value}))
}

describe('lexer', () => {
  let lexer: Lexer

  beforeEach(() => (lexer = createLexer()))

  describe('common tokens', () => {
    it('should lex whitespace', () => {
      lexer.reset('\t   ')

      expect(getResults(lexer)).to.eql([{type: 'WHITESPACE', value: '\t   '}])
    })

    it('should lex newlines', () => {
      lexer.reset('\n\r\n')

      expect(getResults(lexer, 'NEWLINE')).to.eql([
        {type: 'NEWLINE', value: '\n'},
        {type: 'NEWLINE', value: '\r\n'},
      ])
    })

    it('should lex coordinates', () => {
      lexer.reset(['X1', 'Y+2', 'I-3.4', 'J24.42', 'A001234'].join('\n'))

      expect(getResults(lexer)).to.eql([
        {type: 'COORD_CHAR', value: 'X'},
        {type: 'NUMBER', value: '1'},
        {type: 'COORD_CHAR', value: 'Y'},
        {type: 'NUMBER', value: '+2'},
        {type: 'COORD_CHAR', value: 'I'},
        {type: 'NUMBER', value: '-3.4'},
        {type: 'COORD_CHAR', value: 'J'},
        {type: 'NUMBER', value: '24.42'},
        {type: 'COORD_CHAR', value: 'A'},
        {type: 'NUMBER', value: '001234'},
      ])
    })

    it('should lex g-codes', () => {
      lexer.reset(['G1', 'G02', 'G00003', 'G0400', 'G00'].join('\n'))

      expect(getResults(lexer)).to.eql([
        {type: 'G_CODE', value: '1'},
        {type: 'G_CODE', value: '2'},
        {type: 'G_CODE', value: '3'},
        {type: 'G_CODE', value: '400'},
        {type: 'G_CODE', value: '0'},
      ])
    })

    it('should lex m-codes', () => {
      lexer.reset(['M1', 'M02', 'M00003', 'M0400', 'M00'].join('\n'))

      expect(getResults(lexer)).to.eql([
        {type: 'M_CODE', value: '1'},
        {type: 'M_CODE', value: '2'},
        {type: 'M_CODE', value: '3'},
        {type: 'M_CODE', value: '400'},
        {type: 'M_CODE', value: '0'},
      ])
    })
  })

  describe('gerber file tokens', () => {
    it('should lex block end', () => {
      lexer.reset('*')

      expect(getResults(lexer)).to.eql([{type: 'ASTERISK', value: '*'}])
    })

    it('should lex percentage sign', () => {
      lexer.reset('%')

      expect(getResults(lexer)).to.eql([{type: 'PERCENT', value: '%'}])
    })

    it('should lex gerber format specs', () => {
      lexer.reset(
        [
          '%FSLAX34Y34*%',
          '%FSTAX22Y22*%',
          '%FSDIX44Y44*%',
          '%FSLAN2X42Y42*%',
        ].join('\n')
      )

      expect(getResults(lexer)).to.eql([
        // %FSLAX34Y34*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_FORMAT', value: 'LA'},
        {type: 'COORD_CHAR', value: 'X'},
        {type: 'NUMBER', value: '34'},
        {type: 'COORD_CHAR', value: 'Y'},
        {type: 'NUMBER', value: '34'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
        // %FSTAX22Y22*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_FORMAT', value: 'TA'},
        {type: 'COORD_CHAR', value: 'X'},
        {type: 'NUMBER', value: '22'},
        {type: 'COORD_CHAR', value: 'Y'},
        {type: 'NUMBER', value: '22'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
        // %FSDIX44Y44*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_FORMAT', value: 'DI'},
        {type: 'COORD_CHAR', value: 'X'},
        {type: 'NUMBER', value: '44'},
        {type: 'COORD_CHAR', value: 'Y'},
        {type: 'NUMBER', value: '44'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
        // %FSLAN2X42Y42*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_FORMAT', value: 'LA'},
        {type: 'WORD', value: 'N'},
        {type: 'NUMBER', value: '2'},
        {type: 'COORD_CHAR', value: 'X'},
        {type: 'NUMBER', value: '42'},
        {type: 'COORD_CHAR', value: 'Y'},
        {type: 'NUMBER', value: '42'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
      ])
    })

    it('should lex gerber units', () => {
      lexer.reset(['%MOIN*%', '%MOMM*%'].join('\n'))

      expect(getResults(lexer)).to.eql([
        // %MOIN*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_UNITS', value: 'IN'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
        // %MOMM*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_UNITS', value: 'MM'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
      ])
    })

    it('should lex gerber circle tool defs', () => {
      lexer.reset(
        ['%ADD10C,.025*%', '%ADD11C,0.5X0.25*%', '%ADD12C,10X5X5*%'].join('\n')
      )

      expect(getResults(lexer)).to.eql([
        // %ADD10C,.025*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_TOOL_DEF', value: '10'},
        {type: 'GERBER_TOOL_NAME', value: 'C'},
        {type: 'NUMBER', value: '.025'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
        // %ADD11C,0.5X0.25*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_TOOL_DEF', value: '11'},
        {type: 'GERBER_TOOL_NAME', value: 'C'},
        {type: 'NUMBER', value: '0.5'},
        {type: 'COORD_CHAR', value: 'X'},
        {type: 'NUMBER', value: '0.25'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
        // %ADD12C,10X5X5*%
        {type: 'PERCENT', value: '%'},
        {type: 'GERBER_TOOL_DEF', value: '12'},
        {type: 'GERBER_TOOL_NAME', value: 'C'},
        {type: 'NUMBER', value: '10'},
        {type: 'COORD_CHAR', value: 'X'},
        {type: 'NUMBER', value: '5'},
        {type: 'COORD_CHAR', value: 'X'},
        {type: 'NUMBER', value: '5'},
        {type: 'ASTERISK', value: '*'},
        {type: 'PERCENT', value: '%'},
      ])
    })

    it('should gerber tool changes', () => {
      lexer.reset(['D10*', 'D11*'].join('\n'))

      expect(getResults(lexer)).to.eql([
        // D10*
        {type: 'D_CODE', value: '10'},
        {type: 'ASTERISK', value: '*'},
        // D11*
        {type: 'D_CODE', value: '11'},
        {type: 'ASTERISK', value: '*'},
      ])
    })
  })

  describe('drill file tokens', () => {
    it('should lex a drill comment', () => {
      lexer.reset('; comment\n')

      expect(getResults(lexer)).to.eql([
        {type: 'SEMICOLON', value: ';'},
        {type: 'WHITESPACE', value: ' '},
        {type: 'WORD', value: 'comment'},
      ])
    })

    it('should lex a unit setting', () => {
      lexer.reset(['METRIC', 'M71', 'INCH', 'M72'].join('\n'))

      expect(getResults(lexer)).to.eql([
        {type: 'DRILL_UNITS', value: 'METRIC'},
        {type: 'M_CODE', value: '71'},
        {type: 'DRILL_UNITS', value: 'INCH'},
        {type: 'M_CODE', value: '72'},
      ])
    })

    it('should lex a unit setting with zero suppression', () => {
      lexer.reset(['METRIC,TZ', 'M71,LZ', 'INCH,LZ', 'M72,TZ'].join('\n'))

      expect(getResults(lexer)).to.eql([
        {type: 'DRILL_UNITS', value: 'METRIC'},
        {type: 'DRILL_ZERO_INCLUSION', value: 'TZ'},
        {type: 'M_CODE', value: '71'},
        {type: 'DRILL_ZERO_INCLUSION', value: 'LZ'},
        {type: 'DRILL_UNITS', value: 'INCH'},
        {type: 'DRILL_ZERO_INCLUSION', value: 'LZ'},
        {type: 'M_CODE', value: '72'},
        {type: 'DRILL_ZERO_INCLUSION', value: 'TZ'},
      ])
    })

    it('should lex a unit setting with format', () => {
      lexer.reset(
        ['METRIC,TZ,0000.00', 'M71,00.000', 'INCH,0.0,LZ', 'M72,00.00'].join(
          '\n'
        )
      )

      expect(getResults(lexer)).to.eql([
        {type: 'DRILL_UNITS', value: 'METRIC'},
        {type: 'DRILL_ZERO_INCLUSION', value: 'TZ'},
        {type: 'DRILL_COORD_FORMAT', value: '0000.00'},
        {type: 'M_CODE', value: '71'},
        {type: 'DRILL_COORD_FORMAT', value: '00.000'},
        {type: 'DRILL_UNITS', value: 'INCH'},
        {type: 'DRILL_COORD_FORMAT', value: '0.0'},
        {type: 'DRILL_ZERO_INCLUSION', value: 'LZ'},
        {type: 'M_CODE', value: '72'},
        {type: 'DRILL_COORD_FORMAT', value: '00.00'},
      ])
    })

    it('should lex tool code', () => {
      lexer.reset(['T1', 'T4', 'T00042', 'T0600', 'T0'].join('\n'))

      expect(getResults(lexer)).to.eql([
        {type: 'T_CODE', value: '1'},
        {type: 'T_CODE', value: '4'},
        {type: 'T_CODE', value: '42'},
        {type: 'T_CODE', value: '600'},
        {type: 'T_CODE', value: '0'},
      ])
    })

    it('should lex tool properties', () => {
      lexer.reset(
        [
          'T1C0.015',
          'T4C0.01F100S5',
          'T00042F200S65C0.02',
          'T0600F200C0.03S65',
          'T0F200',
        ].join('\n')
      )

      expect(getResults(lexer)).to.eql([
        {type: 'T_CODE', value: '1'},
        {type: 'DRILL_TOOL_PROPS', value: 'C0.015'},
        {type: 'T_CODE', value: '4'},
        {type: 'DRILL_TOOL_PROPS', value: 'C0.01'},
        {type: 'T_CODE', value: '42'},
        {type: 'DRILL_TOOL_PROPS', value: 'C0.02'},
        {type: 'T_CODE', value: '600'},
        {type: 'DRILL_TOOL_PROPS', value: 'C0.03'},
        {type: 'T_CODE', value: '0'},
        {type: 'DRILL_TOOL_PROPS', value: ''},
      ])
    })
  })
})
