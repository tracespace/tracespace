// test suite for the top level gerber parser class
// test subset - parsing gerber files
'use strict'

var expect = require('chai').expect
var partial = require('lodash/partial')

var parser = require('..')

describe('gerber parser with gerber files', function() {
  var p
  var pFactory = partial(parser, {filetype: 'gerber'})

  // convenience function to expect an array of results
  var expectResults = function(expected, done) {
    var handleData = function(res) {
      expect(res).to.eql(expected.shift())
      if (!expected.length) {
        return done()
      }
    }

    p.on('data', handleData)
  }

  beforeEach(function() {
    p = pFactory()
  })

  afterEach(function() {
    p.removeAllListeners('data')
    p.removeAllListeners('warning')
    p.removeAllListeners('error')
  })

  it('should do nothing with comments', function(done) {
    p.once('data', function() {
      p.removeAllListeners('warning').removeAllListeners('error')
      throw new Error('should not have emitted from comments')
    })
    p.once('warning', function() {
      p.removeAllListeners('data').removeAllListeners('error')
      throw new Error('should not have warned from comments')
    })
    p.once('error', function() {
      p.removeAllListeners('warning').removeAllListeners('data')
      throw new Error('should not have errored from comments')
    })

    p.write('G04 MOIN*')
    p.write('G04 this is a comment*')
    p.write('G04 D03*')
    p.write('G04 D02*')
    p.write('G04 G36*')
    p.write('G04 M02*')
    setTimeout(done, 1)
  })

  it('should do nothing with "empty" blocks', function(done) {
    p.once('data', function() {
      p.removeAllListeners('warning').removeAllListeners('error')
      throw new Error('should not have emitted from empty block')
    })
    p.once('warning', function() {
      p.removeAllListeners('data').removeAllListeners('error')
      throw new Error('should not have warned from empty block')
    })
    p.once('error', function() {
      p.removeAllListeners('warning').removeAllListeners('data')
      throw new Error('should not have errored from empty block')
    })

    p.write('*\n')
    p.write('\n')
    p.write('')
    p.write('\n\n\n')
    setTimeout(done, 1)
  })

  it('should warn if a block is unhandled', function(done) {
    p.once('warning', function(w) {
      expect(w.line).to.equal(0)
      expect(w.message).to.match(/not recognized/)
      done()
    })

    p.write('foobarbaz*\n')
  })

  it('should handle split blocks', function(done) {
    p.once('data', function() {
      p.removeAllListeners('warning').removeAllListeners('error')
      throw new Error('should not have emitted from split comment')
    })
    p.once('warning', function() {
      p.removeAllListeners('data').removeAllListeners('error')
      throw new Error('should not have warned from split comment')
    })
    p.once('error', function() {
      p.removeAllListeners('warning').removeAllListeners('data')
      throw new Error('should not have errored from split comment')
    })

    p.write('G04 thi')
    p.write('s is a comment*\n')
    setTimeout(done, 1)
  })

  it('should end the file with a M02', function(done) {
    var expected = [{type: 'done', line: 0}]

    expectResults(expected, done)
    p.write('M02*\n')
  })

  describe('general set commands (G-codes)', function() {
    it('should set region mode on/off with G36/7', function(done) {
      var expected = [
        {type: 'set', prop: 'region', value: true, line: 0},
        {type: 'set', prop: 'region', value: false, line: 1},
      ]

      expectResults(expected, done)
      p.write('G36*\nG37*\n')
    })

    it('should set interpolation mode with G01/2/3', function(done) {
      var expected = [
        {type: 'set', prop: 'mode', value: 'i', line: 0},
        {type: 'set', prop: 'mode', value: 'cw', line: 1},
        {type: 'set', prop: 'mode', value: 'ccw', line: 2},
        {type: 'set', prop: 'mode', value: 'i', line: 3},
        {type: 'set', prop: 'mode', value: 'cw', line: 4},
        {type: 'set', prop: 'mode', value: 'ccw', line: 5},
      ]

      expectResults(expected, done)
      p.write('G01*\nG02*\nG03*\n')
      p.write('G1*\nG2*\nG3*\n')
    })

    it('should set the arc mode with G74/5', function(done) {
      var expected = [
        {type: 'set', prop: 'arc', value: 's', line: 0},
        {type: 'set', prop: 'arc', value: 'm', line: 1},
      ]

      expectResults(expected, done)
      p.write('G74*\nG75*\n')
    })
  })

  describe('unit set commands (MO parameter)', function() {
    it('should set units with %MOIN*% and %MOMM*%', function(done) {
      var expected = [
        {type: 'set', prop: 'units', value: 'in', line: 0},
        {type: 'set', prop: 'units', value: 'mm', line: 1},
      ]

      expectResults(expected, done)
      p.write('%MOIN*%\n')
      p.write('%MOMM*%\n')
    })

    it('should set backup units with G70/1', function(done) {
      var expected = [
        {type: 'set', prop: 'backupUnits', value: 'in', line: 0},
        {type: 'set', prop: 'backupUnits', value: 'mm', line: 1},
      ]

      expectResults(expected, done)
      p.write('G70*\nG71*\n')
    })
  })

  describe('format block', function() {
    it('should parse zero suppression', function() {
      var format = '%FSLAX34Y34*%'
      p.write(format)
      expect(p.format.zero).to.equal('L')

      p = pFactory()
      format = '%FSTAX34Y34*%'
      p.write(format)
      expect(p.format.zero).to.equal('T')
    })

    it('should warn trailing suppression is deprected', function(done) {
      p.once('warning', function(w) {
        expect(w.line).to.equal(0)
        expect(w.message).to.match(/trailing zero suppression/)
        done()
      })

      p.write('%FSTAX34Y34*%\n')
    })

    it('should parse places format', function() {
      var format = '%FSLAX34Y34*%'
      p.write(format)
      expect(p.format.places).to.eql([3, 4])

      p = pFactory()
      format = '%FSLAX77Y77*%'
      p.write(format)
      expect(p.format.places).to.eql([7, 7])
    })

    it('should not override user-set places or suppression', function() {
      var format = '%FSLAX34Y34*%'
      p.format.zero = 'T'
      p.format.places = [7, 7]
      p.write(format)
      expect(p.format.zero).to.equal('T')
      expect(p.format.places).to.eql([7, 7])
    })

    it('should set notation and epsilon', function(done) {
      var format1 = '%FSLAX34Y34*%\n'
      var format2 = '%FSLIX77Y77*%\n'
      // ensure it parses if suppression is missing
      var format3 = '%FSAX66Y66*%\n'
      var expected = [
        {type: 'set', line: 0, prop: 'nota', value: 'A'},
        {type: 'set', line: 0, prop: 'epsilon', value: 1.5 * Math.pow(10, -4)},
        {type: 'set', line: 1, prop: 'nota', value: 'I'},
        {type: 'set', line: 1, prop: 'epsilon', value: 1.5 * Math.pow(10, -7)},
        {type: 'set', line: 2, prop: 'nota', value: 'A'},
        {type: 'set', line: 2, prop: 'epsilon', value: 1.5 * Math.pow(10, -6)},
      ]

      expectResults(expected, done)
      // clear places format between writes to simulate new parsers
      p.write(format1)
      p.format.places = null
      p.write(format2)
      p.format.places = null
      p.write(format3)
    })

    it('should warn and set leading if suppression missing', function(done) {
      var format = '%FSAX34Y34*%\n'
      p.once('warning', function(w) {
        expect(w.line).to.equal(0)
        expect(w.message).to.match(/suppression missing/)
        expect(p.format.zero).to.equal('L')
        done()
      })

      p.write(format)
    })

    it('should be able to set backup notation with G90/1', function(done) {
      var expected = [
        {type: 'set', line: 0, prop: 'backupNota', value: 'A'},
        {type: 'set', line: 1, prop: 'backupNota', value: 'I'},
      ]

      expectResults(expected, done)
      p.write('G90*\n')
      p.write('G91*\n')
    })

    it('should warn but still set format if there are extra characters', function(done) {
      var format = '%FSLAN2X34Y34*%\n'

      p.once('warning', function(w) {
        expect(w.line).to.equal(0)
        expect(w.message).to.match(/unknown characters/)
        expect(p.format.zero).to.equal('L')
        expect(p.format.places).to.eql([3, 4])
        done()
      })

      p.write(format)
    })
  })

  describe('new level commands (SR/LP parameters)', function() {
    it('should parse a new level polarity', function(done) {
      var expected = [
        {type: 'level', line: 0, level: 'polarity', value: 'D'},
        {type: 'level', line: 1, level: 'polarity', value: 'C'},
      ]

      expectResults(expected, done)
      p.write('%LPD*%\n%LPC*%')
    })

    it('should parse a new step-repeat level', function(done) {
      var expected = [
        {
          type: 'level',
          line: 0,
          level: 'stepRep',
          value: {x: 1, y: 1, i: 0, j: 0},
        },
        {
          type: 'level',
          line: 1,
          level: 'stepRep',
          value: {x: 2, y: 3, i: 2, j: 3},
        },
        {
          type: 'level',
          line: 2,
          level: 'stepRep',
          value: {x: 1, y: 1, i: 0, j: 0},
        },
      ]

      expectResults(expected, done)
      p.format.places = [2, 2]
      p.write('%SRX1Y1I0J0*%\n')
      p.write('%SRX2Y3I2.0J3.0*%\n')
      p.write('%SR*%\n')
    })
  })

  describe('tool changes and definitions', function() {
    beforeEach(function() {
      p.format.zero = 'L'
      p.format.places = [2, 2]
    })

    it('should parse a tool change block', function(done) {
      var expected = [
        {type: 'set', line: 0, prop: 'tool', value: '10'},
        {type: 'set', line: 1, prop: 'tool', value: '11'},
        {type: 'set', line: 2, prop: 'tool', value: '12'},
      ]

      expectResults(expected, done)
      p.write('D10*\n')
      p.write('G54D11*\n')
      p.write('D00012*\n')
    })

    it('should handle standard circles', function(done) {
      var expectedTools = [
        {shape: 'circle', params: [1], hole: []},
        {shape: 'circle', params: [1], hole: [0.1]},
        {shape: 'circle', params: [1], hole: [0.2, 0.3]},
      ]
      var expected = [
        {type: 'tool', line: 0, code: '10', tool: expectedTools[0]},
        {type: 'tool', line: 1, code: '11', tool: expectedTools[1]},
        {type: 'tool', line: 2, code: '12', tool: expectedTools[2]},
      ]

      expectResults(expected, done)
      p.write('%ADD10C,1*%\n')
      p.write('%ADD11C,1X0.1*%\n')
      p.write('%ADD12C,1X0.2X0.3*%\n')
    })

    it('should handle standard rectangles/obrounds', function(done) {
      var expectedTools = [
        {shape: 'rect', params: [1, 2], hole: []},
        {shape: 'obround', params: [3, 4], hole: [0.1]},
        {shape: 'rect', params: [5, 6], hole: [0.2, 0.3]},
      ]
      var expected = [
        {type: 'tool', line: 0, code: '10', tool: expectedTools[0]},
        {type: 'tool', line: 1, code: '11', tool: expectedTools[1]},
        {type: 'tool', line: 2, code: '12', tool: expectedTools[2]},
      ]

      expectResults(expected, done)
      p.write('%ADD10R,1X2*%\n')
      p.write('%ADD11O,3.0X4.0X0.1*%\n')
      p.write('%ADD12R,5X6X0.2X0.3*%\n')
    })

    it('should handle standard polygons', function(done) {
      var expectedTools = [
        {shape: 'poly', params: [1, 5, 0], hole: []},
        {shape: 'poly', params: [2, 6, 45], hole: []},
        {shape: 'poly', params: [3, 7, 0], hole: [0.1]},
        {shape: 'poly', params: [4, 8, 0], hole: [0.2, 0.3]},
      ]
      var expected = [
        {type: 'tool', line: 0, code: '10', tool: expectedTools[0]},
        {type: 'tool', line: 1, code: '11', tool: expectedTools[1]},
        {type: 'tool', line: 2, code: '12', tool: expectedTools[2]},
        {type: 'tool', line: 3, code: '13', tool: expectedTools[3]},
      ]

      expectResults(expected, done)
      p.write('%ADD10P,1X5*%\n')
      p.write('%ADD11P,2X6X45*%\n')
      p.write('%ADD12P,3X7X0X0.1*%\n')
      p.write('%ADD13P,4X8X0X0.2X0.3*%\n')
    })

    it('should handle aperture macro tools', function(done) {
      var expectedTools = [
        {shape: 'CIRC', params: [1, 0.5], hole: []},
        {shape: 'RECT', params: [], hole: []},
      ]
      var expected = [
        {type: 'tool', line: 0, code: '10', tool: expectedTools[0]},
        {type: 'tool', line: 1, code: '11', tool: expectedTools[1]},
      ]

      expectResults(expected, done)
      p.write('%ADD10CIRC,1X0.5*%\n')
      p.write('%ADD11RECT*%\n')
    })

    it('should handle tool defs with leading zeros', function(done) {
      var expectedTools = [{shape: 'circle', params: [1], hole: []}]
      var expected = [
        {type: 'tool', line: 0, code: '10', tool: expectedTools[0]},
      ]

      expectResults(expected, done)
      p.write('%ADD0010C,1*%\n')
    })
  })

  describe('aperture macros', function() {
    it('should parse the name of the macro properly', function(done) {
      var expected = [
        {type: 'macro', line: 0, name: 'NAME1', blocks: []},
        {type: 'macro', line: 1, name: 'CRAZY8', blocks: []},
        {type: 'macro', line: 2, name: 'NAME-1', blocks: []},
        {type: 'macro', line: 3, name: 'Name1.0', blocks: []},
        {type: 'macro', line: 4, name: '$Name1', blocks: []},
      ]

      expectResults(expected, done)
      p.write('%AMNAME1*%\n')
      p.write('%AMCRAZY8*%\n')
      p.write('%AMNAME-1*%\n')
      p.write('%AMName1.0*%\n')
      p.write('%AM$Name1*%\n')
    })

    it('should warn that hyphens in macro names are invalid', function(done) {
      p.once('warning', function(w) {
        expect(w.line).to.equal(0)
        expect(w.message).to.match(/hyphen/)
        done()
      })

      p.write('%AMNAME-1*%\n')
    })

    describe('primitive blocks', function() {
      var exp = 1

      it('should parse comments', function(done) {
        var expectedBlocks = [{type: 'comment'}]
        var expected = [
          {type: 'macro', line: 1, name: 'NAME1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMNAME1*\n')
        p.write('0 a comment*%\n')
      })

      it('should parse circle primitives', function(done) {
        var expectedBlocks = [
          {type: 'circle', exp: exp, dia: 5, cx: 1, cy: 2, rot: 0},
          {type: 'circle', exp: exp, dia: 3, cx: 4, cy: 5, rot: 20},
        ]
        var expected = [
          {type: 'macro', line: 2, name: 'CIRC1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMCIRC1*\n')
        p.write('1,1,5,1,2*\n')
        p.write('1,1,3,4,5,20*%\n')
      })

      it('should parse vector primitives', function(done) {
        var expectedBlocks = [
          {
            type: 'vect',
            exp: exp,
            width: 2,
            x1: 3,
            y1: 4,
            x2: 5,
            y2: 6,
            rot: 7,
          },
          {
            type: 'vect',
            exp: exp,
            width: 2,
            x1: 3,
            y1: 4,
            x2: 5,
            y2: 6,
            rot: 7,
          },
        ]
        var expected = [
          {type: 'macro', line: 2, name: 'VECT1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMVECT1*\n')
        p.write('2,1,2,3,4,5,6,7*\n')
        p.write('20,1,2,3,4,5,6,7*%\n')
      })

      it('should warn that primitive code 2 is deprecated', function(done) {
        p.once('warning', function(w) {
          expect(w.line).to.equal(1)
          expect(w.message).to.match(/vector.*deprecated/)
          done()
        })

        p.write('%AMVECT1*\n')
        p.write('2,1,2,3,4,5,6,7*%\n')
      })

      it('should parse rectangle primitives', function(done) {
        var expectedBlocks = [
          {type: 'rect', exp: exp, width: 2, height: 3, cx: 4, cy: 5, rot: 6},
        ]
        var expected = [
          {type: 'macro', line: 1, name: 'RECT1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMRECT1*\n')
        p.write('21,1,2,3,4,5,6*%\n')
      })

      it('should parse a lower left rectangle primitive', function(done) {
        var expectedBlocks = [
          {type: 'rectLL', exp: exp, width: 2, height: 3, x: 4, y: 5, rot: 6},
        ]
        var expected = [
          {type: 'macro', line: 1, name: 'RECTLL1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMRECTLL1*\n')
        p.write('22,1,2,3,4,5,6*%\n')
      })

      it('should warn that primitive code 22 is deprecated', function(done) {
        p.once('warning', function(w) {
          expect(w.line).to.equal(1)
          expect(w.message).to.match(/lower-left.*deprecated/)
          done()
        })

        p.write('%AMRECTLL1*\n')
        p.write('22,1,2,3,4,5,6*%\n')
      })

      it('should parse an outline polygon primitive', function(done) {
        var expectedBlocks = [
          {type: 'outline', exp: exp, points: [3, 4, 5, 6, 7, 8], rot: 9},
        ]
        var expected = [
          {type: 'macro', line: 1, name: 'OUT1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMOUT1*\n')
        p.write('4,1,2,3,4,5,6,7,8,9*%\n')
      })

      it('should parse a regular polygon primitive', function(done) {
        var expectedBlocks = [
          {type: 'poly', exp: exp, vertices: 3, cx: 4, cy: 5, dia: 6, rot: 7},
        ]
        var expected = [
          {type: 'macro', line: 1, name: 'POLY1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMPOLY1*\n')
        p.write('5,1,3,4,5,6,7*%\n')
      })

      it('should parse a moire primitive', function(done) {
        var expectedBlocks = [
          {
            type: 'moire',
            exp: 1,
            cx: 1,
            cy: 2,
            dia: 3,
            ringThx: 4,
            ringGap: 5,
            maxRings: 6,
            crossThx: 7,
            crossLen: 8,
            rot: 9,
          },
        ]
        var expected = [
          {type: 'macro', line: 1, name: 'MOIRE1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMMOIRE1*\n')
        p.write('6,1,2,3,4,5,6,7,8,9*%\n')
      })

      it('should parse a thermal primitive', function(done) {
        var expectedBlocks = [
          {
            type: 'thermal',
            exp: 1,
            cx: 1,
            cy: 2,
            outerDia: 3,
            innerDia: 4,
            gap: 5,
            rot: 6,
          },
        ]
        var expected = [
          {type: 'macro', line: 1, name: 'THERMAL1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMTHERMAL1*\n')
        p.write('7,1,2,3,4,5,6*%\n')
      })

      it('should warn if the primitive is unrecognized', function(done) {
        p.once('warning', function(w) {
          expect(w.line).to.equal(1)
          expect(w.message).to.match(/unrecognized primitive/)
          done()
        })

        p.write('%AMNOTAREALPRIMITIVE*\n')
        p.write('8,1,2,3,4,5,6,7*%\n')
      })

      it('should parse primitives with negative parameters', function(done) {
        var expectedBlocks = [
          {type: 'circle', exp: exp, dia: 5, cx: -1, cy: -2.5, rot: 0},
        ]
        var expected = [
          {type: 'macro', line: 1, name: 'CIRC1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMCIRC1*\n')
        p.write('1,1,5,-1,-2.5*%\n')
      })

      it('should ignore empty blocks', function(done) {
        var expectedBlocks = [
          {type: 'circle', exp: exp, dia: 5, cx: 1, cy: 2, rot: 0},
        ]
        var expected = [
          {type: 'macro', line: 2, name: 'CIRC1', blocks: expectedBlocks},
        ]

        expectResults(expected, done)
        p.write('%AMCIRC1*\n')
        p.write('1,1,5,1,2*\n')
        p.write('*%\n')
      })
    })

    describe('variable set blocks', function() {
      var mods
      beforeEach(function() {
        mods = {$1: 42}
      })

      var expectExprResults = function(expected, done) {
        p.once('data', function(res) {
          expect(res.type).to.equal('macro')
          expect(res.name).to.equal('MODS1')

          res.blocks.forEach(function(v) {
            var newMods = v.set(mods)
            expect(v.type).to.equal('variable')
            expect(newMods).to.eql(expected.shift())
          })

          done()
        })
      }

      it('should return function that takes / returns mods', function(done) {
        var expected = [{$1: 42, $2: 1}]

        expectExprResults(expected, done)
        p.write('%AMMODS1*\n')
        p.write('$2=1*%\n')
      })

      it('should parse addition', function(done) {
        var expected = [{$1: 42, $2: 3}, {$1: 42, $2: 56}]

        expectExprResults(expected, done)
        p.write('%AMMODS1*\n')
        p.write('$2=1+2*\n')
        p.write('$2=$1+14*%\n')
      })

      it('should parse subtraction', function(done) {
        var expected = [{$1: 42, $2: 3}, {$1: 42, $2: 21}]

        expectExprResults(expected, done)
        p.write('%AMMODS1*\n')
        p.write('$2=5-2*\n')
        p.write('$2=63-$1*%\n')
      })

      it('should parse multiplication with x and X', function(done) {
        var expected = [{$1: 42, $2: 21}, {$1: 42, $2: 6}]

        expectExprResults(expected, done)
        p.write('%AMMODS1*\n')
        p.write('$2=$1x0.5*\n')
        p.write('$2=2X3*%\n')
      })

      it('should warn that mult with X is incorrect', function(done) {
        p.once('warning', function(w) {
          expect(w.message).to.match(/multiplication/)
          done()
        })

        p.write('%AMMODS1*\n')
        p.write('$2=$1X1*%\n')
      })

      it('should parse division with /', function(done) {
        var expected = [{$1: 42, $2: 4}, {$1: 42, $2: 21}]

        expectExprResults(expected, done)
        p.write('%AMMODS1*\n')
        p.write('$2=12/3*\n')
        p.write('$2=$1/2*%\n')
      })

      it('should handle expressions with parentheses', function(done) {
        var expected = [{$1: 42, $2: 3}]

        expectExprResults(expected, done)
        p.write('%AMMODS1*\n')
        p.write('$2=($1-30)x(2/(3+12-7))*%\n')
      })
    })

    it('should parse params in primitives as expressions', function(done) {
      p.once('data', function(d) {
        expect(d.blocks[0].dia({$1: 4})).to.equal(5)
        done()
      })

      p.write('%AMCIRC1*\n')
      p.write('1,1,$1+1,1,2*%\n')
    })
  })

  describe('operations', function() {
    beforeEach(function() {
      p.format.zero = 'L'
      p.format.places = [2, 3]
    })

    it('should parse an interpolation command', function(done) {
      var expected = [
        {
          type: 'op',
          line: 0,
          op: 'int',
          coord: {x: 0.1, y: 0.2, i: 0.3, j: 0.4},
        },
        {type: 'op', line: 1, op: 'int', coord: {x: 0.11, y: 0}},
        {type: 'op', line: 2, op: 'int', coord: {x: 0.22}},
        {type: 'op', line: 3, op: 'int', coord: {y: 0.33}},
        {type: 'op', line: 4, op: 'int', coord: {}},
      ]

      expectResults(expected, done)
      p.write('X100Y200I300J400D01*\n')
      p.write('X110Y0D01*\n')
      p.write('X220D1*\n')
      p.write('Y330D1*\n')
      p.write('D01*\n')
    })

    it('should parse a move command', function(done) {
      var expected = [
        {type: 'op', line: 0, op: 'move', coord: {x: 0.3, y: 0.001}},
        {type: 'op', line: 1, op: 'move', coord: {x: -0.1}},
        {type: 'op', line: 2, op: 'move', coord: {}},
      ]

      expectResults(expected, done)
      p.write('X300Y1D02*\n')
      p.write('X-100D2*\n')
      p.write('D02*\n')
    })

    it('should parse a flash command', function(done) {
      var expected = [
        {type: 'op', line: 0, op: 'flash', coord: {x: 0.3, y: 0.001}},
        {type: 'op', line: 1, op: 'flash', coord: {x: -0.1}},
        {type: 'op', line: 2, op: 'flash', coord: {}},
      ]

      expectResults(expected, done)
      p.write('X300Y1D03*\n')
      p.write('X-100D3*\n')
      p.write('D03*\n')
    })

    it('should send "last" operation if op code is missing', function(done) {
      var expected = [
        {type: 'op', line: 0, op: 'last', coord: {x: 0.3, y: 0.001}},
        {type: 'op', line: 1, op: 'last', coord: {x: -0.1}},
      ]

      expectResults(expected, done)
      p.write('X300Y1*\n')
      p.write('X-100*\n')
    })

    it('should interpolate with inline mode set', function(done) {
      var expected = [
        {type: 'set', line: 0, prop: 'mode', value: 'i'},
        {type: 'op', line: 0, op: 'int', coord: {x: 0.001, y: 0.001}},
        {type: 'set', line: 1, prop: 'mode', value: 'cw'},
        {type: 'op', line: 1, op: 'int', coord: {x: 0.001, y: 0.001}},
        {type: 'set', line: 2, prop: 'mode', value: 'ccw'},
        {type: 'op', line: 2, op: 'int', coord: {x: 0.001, y: 0.001}},
      ]

      expectResults(expected, done)
      p.write('G01X01Y01D01*\n')
      p.write('G02X01Y01D01*\n')
      p.write('G03X01Y01D01*\n')
    })

    it('should be strict about what counts as a operation', function(done) {
      p.once('readable', function() {
        throw new Error('should not have operated')
      })

      p.write('somestuffX01Y01*\n')
      p.write('X01Y01somestuff*\n')
      p.write('%TF.GerberVersion,J1*%\n')
      setTimeout(done, 10)
    })
  })
})
