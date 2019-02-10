// test suite for the top level gerber parser class
// test subset - parsing drill files
'use strict'

var expect = require('chai').expect
var partial = require('lodash/partial')

var parser = require('..')

describe('gerber parser with gerber files', function() {
  var p
  var pFactory = partial(parser, {filetype: 'drill'})

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

  describe('comments', function() {
    it('should do nothing with most comments', function(done) {
      p.once('data', function(d) {
        throw new Error('should not have emitted: ' + d)
      })
      p.once('warning', function(w) {
        throw new Error('should not have warned: ' + w.message)
      })
      p.once('error', function(e) {
        throw new Error('should not have errored: ' + e.message)
      })

      p.write(';INCH\n')
      p.write(';this is a comment\n')
      p.write(';M71\n')
      p.write(';T1C0.015\n')
      p.write(';T1\n')
      p.write(';X0016Y0158\n')
      p.end()
      setTimeout(done, 1)
    })

    describe('format hints', function() {
      describe('kicad', function() {
        it('should set format and suppresion if included', function() {
          p.write(
            ';FORMAT={3:3/ absolute / metric / suppress trailing zeros}\n'
          )
          p.end()
          expect(p.format.zero).to.equal('T')
          expect(p.format.places).to.eql([3, 3])

          p = pFactory()
          p.write(';FORMAT={2:4/ absolute / inch / suppress leading zeros}\n')
          p.end()
          expect(p.format.zero).to.equal('L')
          expect(p.format.places).to.eql([2, 4])

          p = pFactory()
          p.write(';FORMAT={-:-/ absolute / inch / decimal}\n')
          p.end()
          expect(p.format.zero).to.equal('D')
          expect(!!p.format.places).to.equal(false)

          p = pFactory()
          p.write(';FORMAT={3:3/ absolute / metric / keep zeros}\n')
          p.end()
          expect(p.format.zero).to.equal('L')
          expect(p.format.places).to.eql([3, 3])
        })

        it('should set backupUnits and backupNota', function(done) {
          var expected = [
            {type: 'set', line: 1, prop: 'backupNota', value: 'A'},
            {type: 'set', line: 1, prop: 'backupUnits', value: 'mm'},
            {type: 'set', line: 2, prop: 'backupNota', value: 'I'},
            {type: 'set', line: 2, prop: 'backupUnits', value: 'in'},
          ]

          expectResults(expected, done)
          p.write(
            ';FORMAT={3:3/ absolute / metric / suppress trailing zeros}\n'
          )
          p.write(
            ';FORMAT={2:4/ incremental / inch / suppress leading zeros}\n'
          )
          p.end()
        })
      })

      describe('altium', function() {
        it('should set format', function() {
          p.write(';FILE_FORMAT=4:4\n')
          p.end()
          expect(p.format.places).to.eql([4, 4])
        })
      })

      it('should not overrite user set format with format hints', function() {
        p.format.places = [2, 3]
        p.format.zero = 'T'

        p.write(';FORMAT={3:3/ absolute / metric / keep zeros}\n')
        expect(p.format.places).to.eql([2, 3])
        expect(p.format.zero).to.equal('T')
      })
    })
  })

  it('should call done with M00 and M30', function(done) {
    var expected = [{type: 'done', line: 1}, {type: 'done', line: 2}]

    expectResults(expected, done)
    p.write('M00\n')
    p.write('M30\n')
    p.end()
  })

  it('should set notation with G90 and G91', function(done) {
    var expected = [
      {type: 'set', line: 1, prop: 'nota', value: 'A'},
      {type: 'set', line: 2, prop: 'nota', value: 'I'},
    ]

    expectResults(expected, done)
    p.write('G90\n')
    p.write('G91\n')
    p.end()
  })

  describe('parsing unit set', function() {
    it('should set units and suppression with INCH / METRIC', function(done) {
      var expected = [
        {type: 'set', line: 1, prop: 'units', value: 'in'},
        {type: 'set', line: 2, prop: 'units', value: 'mm'},
        {type: 'set', line: 3, prop: 'units', value: 'in'},
        {type: 'set', line: 4, prop: 'units', value: 'mm'},
        {type: 'set', line: 5, prop: 'units', value: 'in'},
        {type: 'set', line: 6, prop: 'units', value: 'mm'},
      ]

      expectResults(expected, done)
      p.write('INCH\n')
      p.write('METRIC\n')
      p.write('INCH,TZ\n')
      p.write('METRIC,LZ\n')
      p.write('M72,LZ\n')
      p.write('M71,LZ\n')
      p.end()
    })

    it('should set units with M71 and M72', function(done) {
      var expected = [
        {type: 'set', line: 1, prop: 'units', value: 'in'},
        {type: 'set', line: 2, prop: 'units', value: 'mm'},
      ]

      expectResults(expected, done)
      p.write('M72\n')
      p.write('M71\n')
      p.end()
    })

    it('should set places format when the units are set', function() {
      p.write('M71\n')
      p.end()
      expect(p.format.places).to.eql([3, 3])

      p = pFactory()
      p.write('M72\n')
      p.end()
      expect(p.format.places).to.eql([2, 4])

      p = pFactory()
      p.write('METRIC\n')
      p.end()
      expect(p.format.places).to.eql([3, 3])

      p = pFactory()
      p.write('INCH\n')
      p.end()
      expect(p.format.places).to.eql([2, 4])
    })

    it('should not overwrite places format', function() {
      p.format.places = [3, 4]

      p.write('M71\n')
      expect(p.format.places).to.eql([3, 4])
      p.write('M72\n')
      expect(p.format.places).to.eql([3, 4])
      p.write('INCH\n')
      expect(p.format.places).to.eql([3, 4])
      p.write('METRIC\n')
      expect(p.format.places).to.eql([3, 4])
    })
  })

  describe('setting zero suppression', function() {
    it('should set zero suppression if included with units', function() {
      p.write('INCH,TZ\n')
      p.end()
      expect(p.format.zero).to.equal('L')

      p = pFactory()
      p.write('METRIC,LZ\n')
      p.end()
      expect(p.format.zero).to.equal('T')

      p = pFactory()
      p.write('M71,LZ\n')
      p.end()
      expect(p.format.zero).to.equal('T')

      p = pFactory()
      p.write('M72,TZ\n')
      p.end()
      expect(p.format.zero).to.equal('L')
    })

    it('should not overwrite suppression', function() {
      p.format.zero = 'L'
      p.write('METRIC,LZ\n')
      p.write('INCH,LZ\n')
      p.write('M72,TZ\n')
      p.write('M71,TZ\n')
      expect(p.format.zero).to.equal('L')

      p.format.zero = 'T'
      p.write('METRIC,TZ\n')
      p.write('INCH,TZ\n')
      p.write('M72,TZ\n')
      p.write('M71,TZ\n')
      expect(p.format.zero).to.equal('T')
    })
  })

  describe('parsing tool definitions', function() {
    it('should send a tool command', function(done) {
      var expectedTools = [
        {shape: 'circle', params: [0.015], hole: []},
        {shape: 'circle', params: [0.142], hole: []},
      ]
      var expected = [
        {type: 'tool', line: 1, code: '1', tool: expectedTools[0]},
        {type: 'tool', line: 2, code: '13', tool: expectedTools[1]},
      ]

      expectResults(expected, done)
      p.write('T1C0.015\n')
      p.write('T13C0.142\n')
      p.end()
    })

    it('should ignore feedrate and spindle speed', function(done) {
      var expectedTools = [
        {shape: 'circle', params: [0.01], hole: []},
        {shape: 'circle', params: [0.02], hole: []},
        {shape: 'circle', params: [0.03], hole: []},
      ]
      var expected = [
        {type: 'tool', line: 1, code: '1', tool: expectedTools[0]},
        {type: 'tool', line: 2, code: '2', tool: expectedTools[1]},
        {type: 'tool', line: 3, code: '3', tool: expectedTools[2]},
      ]

      expectResults(expected, done)
      p.write('T1C0.01F100S5\n')
      p.write('T2F200S65C0.02\n')
      p.write('T3S65F200C0.03\n')
      p.end()
    })

    it('should ignore leading zeros in tool name', function(done) {
      var expectedTools = [{shape: 'circle', params: [0.015], hole: []}]
      var expected = [
        {type: 'tool', line: 1, code: '23', tool: expectedTools[0]},
      ]

      expectResults(expected, done)
      p.write('T0023C0.015\n')
      p.end()
    })
  })

  it('should set the tool with a tool number', function(done) {
    var expected = [
      {type: 'set', line: 1, prop: 'tool', value: '1'},
      {type: 'set', line: 2, prop: 'tool', value: '14'},
      {type: 'set', line: 3, prop: 'tool', value: '5'},
      {type: 'set', line: 4, prop: 'tool', value: '0'},
      {type: 'set', line: 5, prop: 'tool', value: '0'},
    ]

    expectResults(expected, done)
    p.write('T1\n')
    p.write('T14\n')
    p.write('T0005B02\n')
    p.write('T0\n')
    p.write('T000S04\n')
    p.end()
  })

  describe('parsing drill commands', function() {
    it('should work with trailing suppression', function(done) {
      p.format.places = [2, 4]
      p.format.zero = 'T'

      var expected = [
        {type: 'op', line: 1, op: 'flash', coord: {x: 0.16, y: 1.58}},
        {type: 'op', line: 2, op: 'flash', coord: {x: -1.795, y: 1.08}},
      ]

      expectResults(expected, done)
      p.write('X0016Y0158\n')
      p.write('X-01795Y0108\n')
    })

    it('should work with leading zeros suppressed', function(done) {
      p.format.places = [2, 4]
      p.format.zero = 'L'

      var expected = [
        {type: 'op', line: 1, op: 'flash', coord: {x: 0.005, y: 1.55}},
        {type: 'op', line: 2, op: 'flash', coord: {x: 1.685, y: -0.33}},
      ]

      expectResults(expected, done)
      p.write('X50Y15500\n')
      p.write('X16850Y-3300\n')
    })

    it('should parse with the places format', function(done) {
      var expected = [
        {type: 'op', line: 1, op: 'flash', coord: {x: 0.755, y: 1.4}},
        {type: 'op', line: 2, op: 'flash', coord: {x: 7.55, y: 0.014}},
        {type: 'op', line: 3, op: 'flash', coord: {x: 8, y: 1.24}},
        {type: 'op', line: 4, op: 'flash', coord: {x: 80, y: 12.4}},
      ]

      expectResults(expected, done)

      p.format.places = [2, 4]
      p.format.zero = 'L'
      p.write('X7550Y14000\n')

      p.format.places = [3, 3]
      p.write('X7550Y14\n')

      p.format.zero = 'T'
      p.format.places = [2, 4]
      p.write('X08Y0124\n')

      p.format.places = [3, 3]
      p.write('X08Y0124\n')
    })

    it('should parse decimal coordinates', function(done) {
      p.format.zero = 'L'
      p.format.places = [2, 4]

      var expected = [
        {type: 'op', line: 1, op: 'flash', coord: {x: 0.755, y: 1.4}},
      ]

      expectResults(expected, done)
      p.write('X0.7550Y1.4000\n')
    })

    it('should parse tool change at beginning / end of line', function(done) {
      p.format.zero = 'T'
      p.format.places = [2, 4]

      var expected = [
        {type: 'set', line: 1, prop: 'tool', value: '1'},
        {type: 'op', line: 1, op: 'flash', coord: {x: 1, y: 1}},
        {type: 'set', line: 2, prop: 'tool', value: '1'},
        {type: 'op', line: 2, op: 'flash', coord: {x: 1, y: 1}},
      ]

      expectResults(expected, done)
      p.write('T01X01Y01\n')
      p.write('X01Y01T01\n')
      p.end()
    })

    it('should warn / assume trailing if missing', function(done) {
      p.format.places = [2, 4]
      p.once('warning', function(w) {
        expect(w.message).to.match(/assuming trailing/)
        expect(p.format.zero).to.equal('T')
        done()
      })

      p.write('X1Y1\n')
      p.end()
    })

    it('should warn / assume trailing if undetectable after 1000 coordinates', function(done) {
      p.format.places = [2, 4]
      p.once('warning', function(w) {
        expect(w.message).to.match(/assuming trailing/)
        expect(p.format.zero).to.equal('T')
        done()
      })
      for (var i = 0; i <= 1000; i++) {
        p.write('X1Y1\n')
      }
    })

    it('should warn / assume [2, 4] places if missing', function(done) {
      p.format.zero = 'L'
      p.once('warning', function(w) {
        expect(w.message).to.match(/assuming \[2, 4\]/)
        expect(p.format.places).to.eql([2, 4])
        done()
      })

      p.write('X1Y1\n')
      p.end()
    })

    it('should warn / detect leading if possible', function(done) {
      p.format.places = [2, 4]
      p.once('warning', function(w) {
        expect(w.message).to.match(/detected leading/)
        expect(p.format.zero).to.equal('L')
        done()
      })
      p.write('X7550Y14000\n')
    })
  })

  describe('parsing slot commands', function() {
    it('should parse the slot commands', function(done) {
      p.format.places = [2, 4]
      p.format.zero = 'T'

      var expected = [
        {type: 'op', line: 1, op: 'move', coord: {x: 0.16, y: 1.58}},
        {type: 'set', line: 1, prop: 'mode', value: 'i'},
        {type: 'op', line: 1, op: 'int', coord: {x: 1.795, y: -1.08}},
        {type: 'op', line: 2, op: 'flash', coord: {x: 1.23, y: -0.01}},
        {type: 'op', line: 3, op: 'move', coord: {x: 2.0, y: 0.1}},
        {type: 'set', line: 3, prop: 'mode', value: 'i'},
        {type: 'op', line: 3, op: 'int', coord: {y: -0.1}},
        {type: 'op', line: 4, op: 'move', coord: {y: 3.09}},
        {type: 'set', line: 4, prop: 'mode', value: 'i'},
        {type: 'op', line: 4, op: 'int', coord: {y: 3.29}},
      ]

      expectResults(expected, done)
      p.write('X0016Y0158G85X01795Y-0108\n')
      p.write('X0123Y-0001\n')
      p.write('X0200Y0010G85Y-0010\n')
      p.write('Y0309G85Y0329\n')
    })
  })

  describe('drill file routing', function() {
    beforeEach(function() {
      p.format.places = [1, 2]
      p.format.zero = 'T'
    })

    it('should handle turning route mode on', function(done) {
      var expected = [
        {type: 'op', line: 1, op: 'move', coord: {x: 0.12, y: 3.45}},
        {type: 'op', line: 2, op: 'move', coord: {x: 0.67, y: 8.9}},
      ]

      expectResults(expected, done)
      p.write('G00X012Y345\n')
      p.write('G00X067Y890\n')
      p.end()
    })

    it('should handle linear routing', function(done) {
      var expected = [
        {type: 'op', line: 1, op: 'move', coord: {x: 1, y: 1}},
        {type: 'set', line: 2, prop: 'mode', value: 'i'},
        {type: 'op', line: 2, op: 'int', coord: {x: 2, y: 2}},
        {type: 'set', line: 3, prop: 'mode', value: 'i'},
        {type: 'op', line: 3, op: 'int', coord: {x: 3, y: 3}},
      ]

      expectResults(expected, done)
      p.write('G00X100Y100\n')
      p.write('G01X200Y200\n')
      p.write('X300Y300\n')
      p.end()
    })

    describe('arc routing', function() {
      it('should handle cw arc routing with offsets', function(done) {
        var coords = [
          {x: 2, y: 2, i: 0.5, j: 0.5},
          {x: 3, y: 3, i: 0.5, j: 0.5},
        ]
        var expected = [
          {type: 'op', line: 1, op: 'move', coord: {x: 1, y: 1}},
          {type: 'set', line: 2, prop: 'mode', value: 'cw'},
          {type: 'op', line: 2, op: 'int', coord: coords[0]},
          {type: 'set', line: 3, prop: 'mode', value: 'cw'},
          {type: 'op', line: 3, op: 'int', coord: coords[1]},
        ]

        expectResults(expected, done)
        p.write('G00X100Y100\n')
        p.write('G02X200Y200I050J050\n')
        p.write('X300Y300I050J050\n')
        p.end()
      })

      it('should handle ccw arc routing with offsets', function(done) {
        var coords = [
          {x: 2, y: 2, i: 0.5, j: 0.5},
          {x: 3, y: 3, i: 0.5, j: 0.5},
        ]
        var expected = [
          {type: 'op', line: 1, op: 'move', coord: {x: 1, y: 1}},
          {type: 'set', line: 2, prop: 'mode', value: 'ccw'},
          {type: 'op', line: 2, op: 'int', coord: coords[0]},
          {type: 'set', line: 3, prop: 'mode', value: 'ccw'},
          {type: 'op', line: 3, op: 'int', coord: coords[1]},
        ]

        expectResults(expected, done)
        p.write('G00X100Y100\n')
        p.write('G03X200Y200I050J050\n')
        p.write('X300Y300I050J050\n')
        p.end()
      })

      it('should handle cw arc routing with radius', function(done) {
        var coords = [{x: 2, y: 2, a: 1}, {x: 3, y: 3, a: 1}]
        var expected = [
          {type: 'op', line: 1, op: 'move', coord: {x: 1, y: 1}},
          {type: 'set', line: 2, prop: 'mode', value: 'cw'},
          {type: 'op', line: 2, op: 'int', coord: coords[0]},
          {type: 'set', line: 3, prop: 'mode', value: 'cw'},
          {type: 'op', line: 3, op: 'int', coord: coords[1]},
        ]

        expectResults(expected, done)
        p.write('G00X100Y100\n')
        p.write('G02X200Y200A100\n')
        p.write('X300Y300A100\n')
        p.end()
      })

      it('should handle ccw arc routing with radius', function(done) {
        var coords = [{x: 2, y: 2, a: 1}, {x: 3, y: 3, a: 1}]
        var expected = [
          {type: 'op', line: 1, op: 'move', coord: {x: 1, y: 1}},
          {type: 'set', line: 2, prop: 'mode', value: 'ccw'},
          {type: 'op', line: 2, op: 'int', coord: coords[0]},
          {type: 'set', line: 3, prop: 'mode', value: 'ccw'},
          {type: 'op', line: 3, op: 'int', coord: coords[1]},
        ]

        expectResults(expected, done)
        p.write('G00X100Y100\n')
        p.write('G03X200Y200A100\n')
        p.write('X300Y300A100\n')
        p.end()
      })
    })
  })
})
