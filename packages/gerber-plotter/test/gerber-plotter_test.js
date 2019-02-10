/* eslint-env mocha */
// test suite for plotter
'use strict'

var expect = require('chai').expect

var plotter = require('..')
var boundingBox = require('../lib/_box')

var EPSILON = 0.000001

describe('gerber plotter', function() {
  var p
  beforeEach(function() {
    p = plotter()
  })

  it('should be an object stream', function() {
    expect(function() {
      p.write({})
    }).to.not.throw()
  })

  describe('format options', function() {
    it('should allow user to set units', function() {
      p = plotter({units: 'mm'})
      expect(p.format.units).to.equal('mm')
      p = plotter({units: 'in'})
      expect(p.format.units).to.equal('in')

      expect(function() {
        p = plotter({units: 'foo'})
      }).to.throw(/units/)
    })

    it('should allow user to set backupUnits', function() {
      p = plotter({backupUnits: 'mm'})
      expect(p.format.backupUnits).to.equal('mm')
      p = plotter({units: 'in'})
      expect(p.format.units).to.equal('in')

      expect(function() {
        p = plotter({backupUnits: 'foo'})
      }).to.throw(/units must be/)
    })

    it('should allow user to set notation', function() {
      p = plotter({nota: 'A'})
      expect(p.format.nota).to.equal('A')
      p = plotter({nota: 'I'})
      expect(p.format.nota).to.equal('I')

      expect(function() {
        p = plotter({nota: 'foo'})
      }).to.throw(/notation/)
    })

    it('should allow user to set backup notation', function() {
      p = plotter({backupNota: 'A'})
      expect(p.format.backupNota).to.equal('A')
      p = plotter({backupNota: 'I'})
      expect(p.format.backupNota).to.equal('I')

      expect(function() {
        p = plotter({backupNota: 'foo'})
      }).to.throw(/notation must be/)
    })

    it('should default backup units and notation to inches and abs', function() {
      expect(p.format.backupUnits).to.equal('in')
      expect(p.format.backupNota).to.equal('A')
    })

    it('should not throw with null/undefined options', function() {
      var p
      expect(function() {
        p = plotter({units: null})
      }).to.not.throw()
      expect(p.format.units === null).to.equal(true)

      expect(function() {
        p = plotter({backupUnits: undefined})
      }).to.not.throw()
      expect(p.format.backupUnits).to.equal('in')

      expect(function() {
        p = plotter({nota: undefined})
      }).to.not.throw()
      expect(p.format.nota === null).to.equal(true)

      expect(function() {
        p = plotter({backupNota: null})
      }).to.not.throw()
      expect(p.format.backupNota).to.equal('A')
    })
  })

  describe('plotting options', function() {
    it('should have an optimize paths option that defaults to falsey', function() {
      expect(!p._optimizePaths).to.equal(true)

      p = plotter({optimizePaths: true})
      expect(p._optimizePaths).to.equal(true)
    })

    it('should have an outline mode option that defaults to falsey', function() {
      expect(!p._plotAsOutline).to.equal(true)

      p = plotter({plotAsOutline: true, units: 'mm'})
      expect(p._plotAsOutline).to.equal(0.00011)
    })

    it('should convert default outline gap fill to inches', function() {
      expect(!p._plotAsOutline).to.equal(true)

      p = plotter({plotAsOutline: true, units: 'in'})
      expect(p._plotAsOutline).to.be.closeTo(0.00011 / 25.4, EPSILON)
    })

    it('should convert given outline gap fill to inches', function() {
      expect(!p._plotAsOutline).to.equal(true)

      p = plotter({plotAsOutline: 0.1, units: 'in'})
      expect(p._plotAsOutline).to.be.closeTo(0.1 / 25.4, EPSILON)
    })

    it('should force optimize paths to true if plot as outline is true', function() {
      p = plotter({plotAsOutline: true, optimizePaths: false, units: 'mm'})
      expect(p._plotAsOutline).to.equal(0.00011)
      expect(p._optimizePaths).to.equal(true)
    })
  })

  describe('handling set commands', function() {
    describe('format', function() {
      it('should set units', function() {
        p.write({type: 'set', prop: 'units', value: 'mm'})
        expect(p.format.units).to.equal('mm')

        p = plotter()
        p.write({type: 'set', prop: 'units', value: 'in'})
        expect(p.format.units).to.equal('in')
      })

      it('should not redefine units', function() {
        p = plotter({units: 'in'})
        p.write({type: 'set', prop: 'units', value: 'mm'})
        expect(p.format.units).to.equal('in')
      })

      it('should set the notation', function() {
        p.write({type: 'set', prop: 'nota', value: 'A'})
        expect(p.format.nota).to.equal('A')

        p = plotter()
        p.write({type: 'set', prop: 'nota', value: 'I'})
        expect(p.format.nota).to.equal('I')
      })

      it('should not redefine notation', function() {
        p = plotter({nota: 'A'})
        p.write({type: 'set', prop: 'nota', value: 'I'})
        expect(p.format.nota).to.equal('A')
      })

      it('should set the backup units', function() {
        p.write({type: 'set', prop: 'backupUnits', value: 'mm'})
        expect(p.format.backupUnits).to.equal('mm')
        p.write({type: 'set', prop: 'backupUnits', value: 'in'})
        expect(p.format.backupUnits).to.equal('in')
      })

      it('should not redefine the backupUnits set by user', function() {
        p = plotter({backupUnits: 'in'})
        p.write({type: 'set', prop: 'backupUnits', value: 'mm'})
        expect(p.format.backupUnits).to.equal('in')
      })

      it('should not redefine the backupNotation set by user', function() {
        p = plotter({backupNota: 'A'})
        p.write({type: 'set', prop: 'backupNota', value: 'I'})
        expect(p.format.backupNota).to.equal('A')
      })
    })

    describe('plotter state', function() {
      it('should change the tool', function() {
        var tool = {}
        p._tools['10'] = tool

        p.write({type: 'set', prop: 'tool', value: '10'})
        expect(p._tool).to.equal(tool)
      })

      it('should warn if the tool does not exist', function(done) {
        p.once('warning', function(w) {
          expect(w.line).to.equal(10)
          expect(w.message).to.match(/tool 10/)
          expect(p._tool === null).to.equal(true)
          done()
        })

        p.write({type: 'set', line: 10, prop: 'tool', value: '10'})
      })

      it('should set the region mode', function() {
        p.write({type: 'set', line: 10, prop: 'region', value: true})
        expect(p._region).to.equal(true)
        p.write({type: 'set', line: 10, prop: 'region', value: false})
        expect(p._region).to.equal(false)
      })

      it('should warn and ignore tool changes if region mode is on', function(done) {
        p.once('warning', function(w) {
          expect(w.line).to.equal(11)
          expect(w.message).to.match(/region/)
          expect(p._tool === null).to.equal(true)
          done()
        })

        p._tools['10'] = {}
        p.write({type: 'set', line: 10, prop: 'region', value: true})
        p.write({type: 'set', line: 11, prop: 'tool', value: '10'})
      })

      it('should set the interpolation mode', function() {
        p.write({type: 'set', prop: 'mode', value: 'i'})
        expect(p._mode).to.equal('i')
        p.write({type: 'set', prop: 'mode', value: 'cw'})
        expect(p._mode).to.equal('cw')
        p.write({type: 'set', prop: 'mode', value: 'ccw'})
        expect(p._mode).to.equal('ccw')
      })

      it('should set the arc quadrant mode', function() {
        p.write({type: 'set', prop: 'quad', value: 's'})
        expect(p._quad).to.equal('s')
        p.write({type: 'set', prop: 'quad', value: 'm'})
        expect(p._quad).to.equal('m')
      })
    })
  })

  describe('handling done command', function() {
    it('should set the done flag', function() {
      p.write({type: 'done'})
      expect(p._done).to.equal(true)
    })

    it('should warn if other commands come in after a done', function(done) {
      p.once('warning', function(w) {
        expect(w.message).to.match(/done/)
        done()
      })

      p.write({type: 'done'})
      p.write({type: 'set', prop: 'mode', value: 'i'})
    })
  })

  describe('handling new tool commands', function() {
    it('should set current tool to newly defined tool', function() {
      var circle = {shape: 'circle', params: [4], hole: []}
      p.write({type: 'tool', code: '10', tool: circle})
      expect(p._tools['10']).to.equal(p._tool)
      p.write({type: 'tool', code: '15', tool: circle})
      expect(p._tools['15']).to.equal(p._tool)
    })

    it('should set trace width for circle and rectangle tools', function() {
      var circle = {shape: 'circle', params: [4], hole: []}
      var rect = {shape: 'rect', params: [2, 3], hole: []}

      p.write({type: 'tool', code: '10', tool: circle})
      expect(p._tool.trace).to.eql([4])

      p.write({type: 'tool', code: '11', tool: rect})
      expect(p._tool.trace).to.eql([2, 3])
    })

    it('should warn and ignore if the tool has already been set', function(done) {
      var circle = {shape: 'circle', params: [4], hole: []}
      var rect = {shape: 'rect', params: [2, 3], hole: []}

      p.once('warning', function(w) {
        expect(w.message).to.match(/already defined/)
        expect(w.line).to.equal(9)
        expect(p._tool.trace).to.eql([4])
        done()
      })

      p.write({type: 'tool', code: '10', tool: circle, line: 8})
      p.write({type: 'tool', code: '10', tool: rect, line: 9})
    })

    it('should not set trace for untraceable tools', function() {
      var circle = {shape: 'circle', params: [4], hole: [1, 1]}
      var rect = {shape: 'rect', params: [2, 3], hole: [1]}
      var obround = {shape: 'obround', params: [2, 3], hole: []}
      var poly = {shape: 'poly', params: [2, 3, 4], hole: []}
      var macro = {shape: 'SOME_MACRO', params: [], hole: []}
      p.write({type: 'tool', code: '10', tool: circle})
      expect(p._tool.trace).to.eql([])
      p.write({type: 'tool', code: '11', tool: rect})
      expect(p._tool.trace).to.eql([])
      p.write({type: 'tool', code: '12', tool: obround})
      expect(p._tool.trace).to.eql([])
      p.write({type: 'tool', code: '13', tool: poly})
      expect(p._tool.trace).to.eql([])
      p.write({type: 'tool', code: '14', tool: macro})
      expect(p._tool.trace).to.eql([])
    })

    describe('standard tool pad shapes', function() {
      it('should create pad shapes for standard circles', function() {
        var circle0 = {shape: 'circle', params: [1], hole: []}
        var circle1 = {shape: 'circle', params: [2], hole: [1]}
        var circle2 = {shape: 'circle', params: [3], hole: [1, 1]}

        p.write({type: 'tool', code: '10', tool: circle0})
        expect(p._tool.pad).to.eql([{type: 'circle', cx: 0, cy: 0, r: 0.5}])

        p.write({type: 'tool', code: '11', tool: circle1})
        expect(p._tool.pad).to.eql([
          {type: 'circle', cx: 0, cy: 0, r: 1},
          {type: 'layer', polarity: 'clear', box: [-1, -1, 1, 1]},
          {type: 'circle', cx: 0, cy: 0, r: 0.5},
        ])

        p.write({type: 'tool', code: '12', tool: circle2})
        expect(p._tool.pad).to.eql([
          {type: 'circle', cx: 0, cy: 0, r: 1.5},
          {type: 'layer', polarity: 'clear', box: [-1.5, -1.5, 1.5, 1.5]},
          {type: 'rect', cx: 0, cy: 0, r: 0, width: 1, height: 1},
        ])
      })

      it('should create pad shapes for standard rectangles', function() {
        var rect0 = {shape: 'rect', params: [1, 2], hole: []}
        var rect1 = {shape: 'rect', params: [3, 4], hole: [1]}
        var rect2 = {shape: 'rect', params: [5, 6], hole: [1, 1]}

        p.write({type: 'tool', code: '10', tool: rect0})
        expect(p._tool.pad).to.eql([
          {type: 'rect', cx: 0, cy: 0, r: 0, width: 1, height: 2},
        ])

        p.write({type: 'tool', code: '11', tool: rect1})
        expect(p._tool.pad).to.eql([
          {type: 'rect', cx: 0, cy: 0, r: 0, width: 3, height: 4},
          {type: 'layer', polarity: 'clear', box: [-1.5, -2, 1.5, 2]},
          {type: 'circle', cx: 0, cy: 0, r: 0.5},
        ])

        p.write({type: 'tool', code: '12', tool: rect2})
        expect(p._tool.pad).to.eql([
          {type: 'rect', cx: 0, cy: 0, r: 0, width: 5, height: 6},
          {type: 'layer', polarity: 'clear', box: [-2.5, -3, 2.5, 3]},
          {type: 'rect', cx: 0, cy: 0, r: 0, width: 1, height: 1},
        ])
      })

      it('should create pad shapes for standard obrounds', function() {
        var obround0 = {shape: 'obround', params: [1, 2], hole: []}
        var obround1 = {shape: 'obround', params: [4, 3], hole: [1]}
        var obround2 = {shape: 'obround', params: [5, 6], hole: [1, 1]}

        p.write({type: 'tool', code: '10', tool: obround0})
        expect(p._tool.pad).to.eql([
          {type: 'rect', cx: 0, cy: 0, r: 0.5, width: 1, height: 2},
        ])

        p.write({type: 'tool', code: '11', tool: obround1})
        expect(p._tool.pad).to.eql([
          {type: 'rect', cx: 0, cy: 0, r: 1.5, width: 4, height: 3},
          {type: 'layer', polarity: 'clear', box: [-2, -1.5, 2, 1.5]},
          {type: 'circle', cx: 0, cy: 0, r: 0.5},
        ])

        p.write({type: 'tool', code: '12', tool: obround2})
        expect(p._tool.pad).to.eql([
          {type: 'rect', cx: 0, cy: 0, r: 2.5, width: 5, height: 6},
          {type: 'layer', polarity: 'clear', box: [-2.5, -3, 2.5, 3]},
          {type: 'rect', cx: 0, cy: 0, r: 0, width: 1, height: 1},
        ])
      })

      it('should create pad shapes for standard polygons', function() {
        var poly0 = {shape: 'poly', params: [2, 3, 0], hole: []}
        var poly1 = {shape: 'poly', params: [2, 6, 45], hole: [1]}
        var poly2 = {shape: 'poly', params: [2, 12, 140], hole: [1, 1]}

        p.write({type: 'tool', code: '10', tool: poly0})
        expect(p._tool.pad).to.eql([
          {
            type: 'poly',
            points: [[1, 0], [-0.5, 0.8660254], [-0.5, -0.8660254]],
          },
        ])

        p.write({type: 'tool', code: '11', tool: poly1})
        var poly = p._tool.pad[0]
        var box = [-0.96592583, -0.96592583, 0.96592583, 0.96592583]

        expect(p._tool.pad).to.have.length(3)
        expect(poly).to.have.all.keys(['type', 'points'])
        expect(poly.type).to.equal('poly')
        expect(poly.points).to.eql([
          [0.70710678, 0.70710678],
          [-0.25881905, 0.96592583],
          [-0.96592583, 0.25881905],
          [-0.70710678, -0.70710678],
          [0.25881905, -0.96592583],
          [0.96592583, -0.25881905],
        ])
        expect(p._tool.pad.slice(1)).to.eql([
          {type: 'layer', polarity: 'clear', box: box},
          {type: 'circle', cx: 0, cy: 0, r: 0.5},
        ])

        p.write({type: 'tool', code: '12', tool: poly2})
        poly = p._tool.pad[0]
        box = [-0.98480775, -0.98480775, 0.98480775, 0.98480775]

        expect(p._tool.pad).to.have.length(3)
        expect(poly).to.have.all.keys(['type', 'points'])
        expect(poly.type).to.equal('poly')
        expect(poly.points).to.eql([
          [-0.76604444, 0.64278761],
          [-0.98480775, 0.17364818],
          [-0.93969262, -0.34202014],
          [-0.64278761, -0.76604444],
          [-0.17364818, -0.98480775],
          [0.34202014, -0.93969262],
          [0.76604444, -0.64278761],
          [0.98480775, -0.17364818],
          [0.93969262, 0.34202014],
          [0.64278761, 0.76604444],
          [0.17364818, 0.98480775],
          [-0.34202014, 0.93969262],
        ])
        expect(p._tool.pad.slice(1)).to.eql([
          {type: 'layer', polarity: 'clear', box: box},
          {type: 'rect', cx: 0, cy: 0, r: 0, width: 1, height: 1},
        ])
      })
    })

    describe('standard tool bounding boxes', function() {
      it('should calculate a bounding box for a circle', function() {
        var circle0 = {shape: 'circle', params: [1], hole: []}
        var circle1 = {shape: 'circle', params: [7], hole: [1]}
        var circle2 = {shape: 'circle', params: [4], hole: [1, 1]}

        p.write({type: 'tool', code: '10', tool: circle0})
        expect(p._tool.box).to.eql([-0.5, -0.5, 0.5, 0.5])
        p.write({type: 'tool', code: '11', tool: circle1})
        expect(p._tool.box).to.eql([-3.5, -3.5, 3.5, 3.5])
        p.write({type: 'tool', code: '12', tool: circle2})
        expect(p._tool.box).to.eql([-2, -2, 2, 2])
      })

      it('should calculate a bounding box for a rects and obrounds', function() {
        var rect0 = {shape: 'rect', params: [1, 2], hole: []}
        var rect1 = {shape: 'rect', params: [7, 4], hole: [1]}
        var obround0 = {shape: 'obround', params: [9, 8], hole: [1, 1]}
        var obround1 = {shape: 'obround', params: [4, 1], hole: []}

        p.write({type: 'tool', code: '10', tool: rect0})
        expect(p._tool.box).to.eql([-0.5, -1, 0.5, 1])
        p.write({type: 'tool', code: '11', tool: rect1})
        expect(p._tool.box).to.eql([-3.5, -2, 3.5, 2])
        p.write({type: 'tool', code: '12', tool: obround0})
        expect(p._tool.box).to.eql([-4.5, -4, 4.5, 4])
        p.write({type: 'tool', code: '13', tool: obround1})
        expect(p._tool.box).to.eql([-2, -0.5, 2, 0.5])
      })

      it('should calculate a bounding box for a standard polygon', function() {
        var poly0 = {shape: 'poly', params: [5, 4, 0], hole: []}
        var poly1 = {shape: 'poly', params: [6, 8, 0], hole: [1]}
        var poly2 = {
          shape: 'poly',
          params: [4 * Math.sqrt(2), 4, 45],
          hole: [1, 1],
        }

        p.write({type: 'tool', code: '10', tool: poly0})
        expect(p._tool.box).to.eql([-2.5, -2.5, 2.5, 2.5])
        p.write({type: 'tool', code: '11', tool: poly1})
        expect(p._tool.box).to.eql([-3, -3, 3, 3])
        p.write({type: 'tool', code: '12', tool: poly2})
        expect(p._tool.box).to.eql([-2, -2, 2, 2], 10)
      })
    })

    describe('macro tool pads', function() {
      describe('primitives without rotation', function() {
        it('should ignore comment primitives', function() {
          var macro = {
            type: 'macro',
            name: 'EMPTY',
            blocks: [{type: 'comment'}],
          }
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'EMPTY', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([])
          expect(p._tool.box).to.eql([Infinity, Infinity, -Infinity, -Infinity])
        })

        it('should be able to handle shape and box for circle primitives', function() {
          var blocks = [{type: 'circle', exp: 1, dia: 4, cx: 3, cy: 4, rot: 0}]
          var macro = {type: 'macro', name: 'CIRC', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'CIRC', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([{type: 'circle', cx: 3, cy: 4, r: 2}])
          expect(p._tool.box).to.eql([1, 2, 5, 6])
        })

        it('should be able to handle shape and box for vect primitives', function() {
          var blocks = [
            {
              type: 'vect',
              exp: 1,
              width: 2,
              x1: 0,
              y1: 0,
              x2: 5,
              y2: 0,
              rot: 0,
            },
            {
              type: 'vect',
              exp: 1,
              width: 1,
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 5,
              rot: 0,
            },
          ]
          var macro = {type: 'macro', name: 'VECT', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'VECT', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)

          expect(p._tool.pad).to.eql([
            {type: 'poly', points: [[0, -1], [5, -1], [5, 1], [0, 1]]},
            {type: 'poly', points: [[0.5, 0], [0.5, 5], [-0.5, 5], [-0.5, 0]]},
          ])

          expect(p._tool.box).to.eql([-0.5, -1, 5, 5])
        })

        it('should be able to handle rectangle primitives', function() {
          var blocks = [
            {type: 'rect', exp: 1, width: 4, height: 2, cx: 3, cy: 4, rot: 0},
          ]
          var macro = {type: 'macro', name: 'RECT', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'RECT', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {type: 'rect', cx: 3, cy: 4, width: 4, height: 2, r: 0},
          ])
          expect(p._tool.box).to.eql([1, 3, 5, 5])
        })

        it('should be able to handle lower-left rects', function() {
          var blocks = [
            {type: 'rectLL', exp: 1, width: 4, height: 2, x: 1, y: 3, rot: 0},
          ]
          var macro = {type: 'macro', name: 'LRECT', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'LRECT', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {type: 'rect', cx: 3, cy: 4, width: 4, height: 2, r: 0},
          ])
          expect(p._tool.box).to.eql([1, 3, 5, 5])
        })

        it('should be able to handle an outline primitive', function() {
          var blocks = [
            {type: 'outline', exp: 1, points: [0, 0, 1, 0, 1, 1, 0, 0], rot: 0},
          ]
          var macro = {type: 'macro', name: 'OPOLY', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'OPOLY', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {type: 'poly', points: [[0, 0], [1, 0], [1, 1]]},
          ])
          expect(p._tool.box).to.eql([0, 0, 1, 1])
        })

        it('should handle a regular polygon primitive', function() {
          var blocks = [
            {type: 'poly', exp: 1, vertices: 4, cx: 3, cy: 2, dia: 2, rot: 0},
          ]
          var macro = {type: 'macro', name: 'POLY', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'POLY', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {
              type: 'poly',
              points: [[4, 2], [3, 3], [2, 2], [3, 1]],
            },
          ])
          expect(p._tool.box).to.eql([2, 1, 4, 3])
        })

        it('should handle moiré primitives with only rings', function() {
          var blocks = [
            {
              type: 'moire',
              exp: 1,
              cx: 2,
              cy: 3,
              dia: 4,
              ringThx: 0.4,
              ringGap: 0.2,
              maxRings: 2,
              crossThx: 0.1,
              crossLen: 5,
              rot: 0,
            },
          ]
          var macro = {type: 'macro', name: 'TARG', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'TARG', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {type: 'ring', cx: 2, cy: 3, r: 1.8, width: 0.4},
            {type: 'ring', cx: 2, cy: 3, r: 1.2, width: 0.4},
            {type: 'rect', cx: 2, cy: 3, width: 5, height: 0.1, r: 0},
            {type: 'rect', cx: 2, cy: 3, width: 0.1, height: 5, r: 0},
          ])
          expect(p._tool.box).to.eql([-0.5, 0.5, 4.5, 5.5])
        })

        it('should handle moirés with circle centers', function() {
          var blocks = [
            {
              type: 'moire',
              exp: 1,
              cx: 5,
              cy: 5,
              dia: 2.8,
              ringThx: 0.5,
              ringGap: 0.5,
              maxRings: 2,
              crossThx: 0.2,
              crossLen: 2.5,
              rot: 0,
            },
          ]
          var macro = {type: 'macro', name: 'TARG', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'TARG', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {type: 'ring', cx: 5, cy: 5, r: 1.15, width: 0.5},
            {type: 'circle', cx: 5, cy: 5, r: 0.4},
            {type: 'rect', cx: 5, cy: 5, width: 2.5, height: 0.2, r: 0},
            {type: 'rect', cx: 5, cy: 5, width: 0.2, height: 2.5, r: 0},
          ])
          expect(p._tool.box).to.eql([3.6, 3.6, 6.4, 6.4])
        })

        it('should handle thermals', function() {
          var blocks = [
            {
              type: 'thermal',
              exp: 1,
              cx: 1,
              cy: 1,
              outerDia: 7,
              innerDia: 5,
              gap: 1,
              rot: 0,
            },
          ]
          var macro = {type: 'macro', name: 'THRM', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'THRM', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {
              type: 'clip',
              shape: [
                {type: 'rect', cx: 3, cy: 3, width: 3, height: 3, r: 0},
                {type: 'rect', cx: -1, cy: 3, width: 3, height: 3, r: 0},
                {type: 'rect', cx: -1, cy: -1, width: 3, height: 3, r: 0},
                {type: 'rect', cx: 3, cy: -1, width: 3, height: 3, r: 0},
              ],
              clip: {type: 'ring', cx: 1, cy: 1, r: 3, width: 1},
            },
          ])
          expect(p._tool.box).to.eql([-2.5, -2.5, 4.5, 4.5])
        })
      })

      describe('rotated primitives', function() {
        it('should handle rotated circles', function() {
          var blocks = [{type: 'circle', exp: 1, dia: 4, cx: 0, cy: 4, rot: 90}]
          var macro = {type: 'macro', name: 'RCIRC', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'RCIRC', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([{type: 'circle', cx: -4, cy: 0, r: 2}])
          expect(p._tool.box).to.eql([-6, -2, -2, 2])
        })

        it('should handle rotated vects', function() {
          var blocks = [
            {
              type: 'vect',
              exp: 1,
              width: 1,
              x1: 1,
              y1: 1,
              x2: 5,
              y2: 5,
              rot: 45,
            },
          ]
          var macro = {type: 'macro', name: 'RVECT', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'RVECT', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)

          expect(p._tool.pad).to.eql([
            {
              type: 'poly',
              points: [
                [0.5, 1.41421356],
                [0.5, 7.07106781],
                [-0.5, 7.07106781],
                [-0.5, 1.41421356],
              ],
            },
          ])
          expect(p._tool.box).to.eql([-0.5, 1.41421356, 0.5, 7.07106781])
        })

        it('should handle rotated rects', function() {
          var blocks = [
            {type: 'rect', exp: 1, width: 4, height: 2, cx: 3, cy: 4, rot: -30},
          ]
          var macro = {type: 'macro', name: 'RRECT', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'RRECT', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)

          expect(p._tool.pad).to.eql([
            {
              type: 'poly',
              points: [
                [2.3660254, 2.09807622],
                [5.83012702, 0.09807622],
                [6.83012702, 1.83012702],
                [3.3660254, 3.83012702],
              ],
            },
          ])
          expect(p._tool.box).to.eql([
            2.3660254,
            0.09807622,
            6.83012702,
            3.83012702,
          ])
        })

        it('should handle rotated lower-left rects', function() {
          var blocks = [
            {type: 'rectLL', exp: 1, width: 4, height: 2, x: 1, y: 3, rot: -30},
          ]
          var macro = {type: 'macro', name: 'LRECT', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'LRECT', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)

          expect(p._tool.pad).to.eql([
            {
              type: 'poly',
              points: [
                [2.3660254, 2.09807622],
                [5.83012702, 0.09807622],
                [6.83012702, 1.83012702],
                [3.3660254, 3.83012702],
              ],
            },
          ])
          expect(p._tool.box).to.eql([
            2.3660254,
            0.09807622,
            6.83012702,
            3.83012702,
          ])
        })

        it('should handle rotated outline polygons', function() {
          var blocks = [
            {
              type: 'outline',
              exp: 1,
              points: [0, 0, 1, 0, 1, 1, 0, 0],
              rot: 150,
            },
          ]
          var macro = {type: 'macro', name: 'LRECT', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'LRECT', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {
              type: 'poly',
              points: [[0, 0], [-0.8660254, 0.5], [-1.3660254, -0.3660254]],
            },
          ])
          expect(p._tool.box).to.eql([-1.3660254, -0.3660254, 0, 0.5])
        })

        it('should handle rotated regular polygons', function() {
          var dia = 2 * Math.sqrt(2)
          var blocks = [
            {
              type: 'poly',
              exp: 1,
              vertices: 4,
              cx: 0,
              cy: 0,
              dia: dia,
              rot: 45,
            },
          ]
          var macro = {type: 'macro', name: 'POLY', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'POLY', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {
              type: 'poly',
              points: [[1, 1], [-1, 1], [-1, -1], [1, -1]],
            },
          ])
          expect(p._tool.box).to.eql([-1, -1, 1, 1])
        })

        it('should handle rotated moires', function() {
          var blocks = [
            {
              type: 'moire',
              exp: 1,
              cx: 0,
              cy: 0,
              dia: 4,
              ringThx: 0.4,
              ringGap: 0.2,
              maxRings: 2,
              crossThx: 0.1,
              crossLen: 5,
              rot: -150,
            },
          ]
          var macro = {type: 'macro', name: 'TARG', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'TARG', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {type: 'ring', cx: 0, cy: 0, r: 1.8, width: 0.4},
            {type: 'ring', cx: 0, cy: 0, r: 1.2, width: 0.4},
            {
              type: 'poly',
              points: [
                [2.19006351, 1.20669873],
                [-2.14006351, -1.29330127],
                [-2.19006351, -1.20669873],
                [2.14006351, 1.29330127],
              ],
            },
            {
              type: 'poly',
              points: [
                [1.29330127, -2.14006351],
                [1.20669873, -2.19006351],
                [-1.29330127, 2.14006351],
                [-1.20669873, 2.19006351],
              ],
            },
          ])
          expect(p._tool.box).to.eql([
            -2.19006351,
            -2.19006351,
            2.19006351,
            2.19006351,
          ])
        })

        it('should handle rotated thermals', function() {
          var blocks = [
            {
              type: 'thermal',
              exp: 1,
              cx: 0,
              cy: 0,
              outerDia: 4,
              innerDia: 3,
              gap: 0.2,
              rot: 45,
            },
          ]
          var macro = {type: 'macro', name: 'THRM', blocks: blocks}
          var tool = {
            type: 'tool',
            code: '10',
            tool: {shape: 'THRM', params: [], hole: []},
          }

          p.write(macro)
          p.write(tool)
          expect(p._tool.pad).to.eql([
            {
              type: 'clip',
              shape: [
                {
                  type: 'poly',
                  points: [
                    [0, 0.14142136],
                    [1.34350288, 1.48492424],
                    [0, 2.82842712],
                    [-1.34350288, 1.48492424],
                  ],
                },
                {
                  type: 'poly',
                  points: [
                    [-1.48492424, -1.34350288],
                    [-0.14142136, 0],
                    [-1.48492424, 1.34350288],
                    [-2.82842712, 0],
                  ],
                },
                {
                  type: 'poly',
                  points: [
                    [0, -2.82842712],
                    [1.34350288, -1.48492424],
                    [0, -0.14142136],
                    [-1.34350288, -1.48492424],
                  ],
                },
                {
                  type: 'poly',
                  points: [
                    [1.48492424, -1.34350288],
                    [2.82842712, 0],
                    [1.48492424, 1.34350288],
                    [0.14142136, 0],
                  ],
                },
              ],
              clip: {type: 'ring', cx: 0, cy: 0, r: 1.75, width: 0.5},
            },
          ])
          expect(p._tool.box).to.eql([-2, -2, 2, 2])
        })
      })

      it('should handle modifiers and functional args', function() {
        var blocks = [
          {
            type: 'circle',
            exp: 1,
            dia: function(mods) {
              return mods.$1
            },
            cx: function(mods) {
              return mods.$2
            },
            cy: function(mods) {
              return mods.$3
            },
            rot: function(mods) {
              return mods.$4
            },
          },
        ]
        var mods = [4, 3, 2, 0]
        var macro = {type: 'macro', name: 'CIRC', blocks: blocks}
        var tool = {
          type: 'tool',
          code: '10',
          tool: {shape: 'CIRC', params: mods, hole: []},
        }

        p.write(macro)
        p.write(tool)
        expect(p._tool.pad).to.eql([{type: 'circle', cx: 3, cy: 2, r: 2}])
      })

      it('should handle variable sets', function() {
        var blocks = [
          {
            type: 'variable',
            set: function(mods) {
              return {$1: 4, $2: 3, $3: mods.$2 - 1}
            },
          },
          {
            type: 'circle',
            exp: 1,
            dia: function(mods) {
              return mods.$1
            },
            cx: function(mods) {
              return mods.$2
            },
            cy: function(mods) {
              return mods.$3
            },
            rot: 0,
          },
        ]
        var mods = [4, 3]
        var macro = {type: 'macro', name: 'CIRC', blocks: blocks}
        var tool = {
          type: 'tool',
          code: '10',
          tool: {shape: 'CIRC', params: mods, hole: []},
        }

        p.write(macro)
        p.write(tool)
        expect(p._tool.pad).to.eql([{type: 'circle', cx: 3, cy: 2, r: 2}])
      })

      it('should handle multiple primitives and exposure', function() {
        var blocks = [
          {type: 'circle', exp: 1, dia: 4, cx: -2, cy: 0, rot: 0},
          {type: 'rect', exp: 0, width: 1, height: 1, cx: -1, cy: 0, rot: 0},
          {type: 'rect', exp: 0, width: 1, height: 1, cx: 1, cy: 0, rot: 0},
          {type: 'circle', exp: 1, dia: 4, cx: 2, cy: 0, rot: 0},
        ]
        var macro = {type: 'macro', name: 'MAC', blocks: blocks}
        var tool = {
          type: 'tool',
          code: '10',
          tool: {shape: 'MAC', params: [], hole: []},
        }

        p.write(macro)
        p.write(tool)
        expect(p._tool.pad).to.eql([
          {type: 'circle', cx: -2, cy: 0, r: 2},
          {type: 'layer', polarity: 'clear', box: [-4, -2, 0, 2]},
          {type: 'rect', width: 1, height: 1, cx: -1, cy: 0, r: 0},
          {type: 'rect', width: 1, height: 1, cx: 1, cy: 0, r: 0},
          {type: 'layer', polarity: 'dark', box: [-4, -2, 0, 2]},
          {type: 'circle', cx: 2, cy: 0, r: 2},
        ])
        expect(p._tool.box).to.eql([-4, -2, 4, 2])
      })
    })
  })

  describe('handling operation commands', function() {
    beforeEach(function() {
      var tool = {shape: 'circle', params: [2], hole: []}
      p.write({type: 'set', prop: 'epsilon', value: 0.00000001})
      p.write({type: 'set', prop: 'units', value: 'in'})
      p.write({type: 'set', prop: 'nota', value: 'A'})
      p.write({type: 'set', prop: 'mode', value: 'i'})
      p.write({type: 'tool', code: '10', tool: tool})
    })

    it('should move the plotter', function() {
      p.write({type: 'op', op: 'int', coord: {x: 4, y: -3}})
      expect(p._pos).to.eql([4, -3])
      p.write({type: 'op', op: 'move', coord: {y: 0}})
      expect(p._pos).to.eql([4, 0])
      p.write({type: 'op', op: 'flash', coord: {x: -7}})
      expect(p._pos).to.eql([-7, 0])
    })

    it('should move the plotter with incremental notation', function() {
      p.nota = 'I'
      p.write({type: 'op', op: 'int', coord: {x: 4, y: -3, i: 1, j: 4}})
      expect(p._pos).to.eql([4, -3])
      p.write({type: 'op', op: 'move', coord: {y: 1}})
      expect(p._pos).to.eql([4, -2])
      p.write({type: 'op', op: 'flash', coord: {x: -7}})
      expect(p._pos).to.eql([-3, -2])
    })

    describe('flashing pads', function() {
      it('should emit a shape if first flash for tool', function(done) {
        p.once('readable', function() {
          var result = p.read()
          expect(result).to.eql({
            type: 'shape',
            tool: '10',
            shape: p._tool.pad,
          })
          done()
        })
        p.write({type: 'op', op: 'flash', coord: {x: 1, y: 1}})
      })

      it('should emit pad objects after the shape object', function(done) {
        p.once('data', function(result) {
          expect(result.type).to.equal('shape')
          p.once('data', function(result) {
            expect(result).to.eql({type: 'pad', tool: '10', x: 1, y: 1})
            done()
          })
        })
        p.write({type: 'op', op: 'flash', coord: {x: 1, y: 1}})
      })

      it('should not emit the pad shape more than once', function(done) {
        var results = 0
        var expected = ['shape', 'pad', 'pad']
        var handleData = function(data) {
          expect(data.type).to.eql(expected[results])
          if (++results >= expected.length) {
            p.removeListener('data', handleData)
            return done()
          }
        }

        p.on('data', handleData)
        p.write({type: 'op', op: 'flash', coord: {x: 1, y: 1}})
        p.write({type: 'op', op: 'flash', coord: {x: 5, y: 5}})
      })

      it('should update the bounding box', function() {
        p.write({type: 'op', op: 'flash', coord: {x: 1, y: 1}})
        expect(p._box).to.eql([0, 0, 2, 2])
      })
    })

    describe('interpolating to create strokes', function() {
      it('should create a path graph with linear strokes', function() {
        p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
        p.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 3, y: 3}})

        expect(p._path.traverse()).to.eql([
          {type: 'line', start: [0, 0], end: [1, 1]},
          {type: 'line', start: [1, 1], end: [1, 3]},
          {type: 'line', start: [1, 3], end: [3, 3]},
        ])
      })

      it('should handle moves in between strokes when optimizing paths', function() {
        var tool = {shape: 'circle', params: [2], hole: []}
        p = plotter({optimizePaths: true})

        p.write({type: 'set', prop: 'epsilon', value: 0.00000001})
        p.write({type: 'set', prop: 'units', value: 'in'})
        p.write({type: 'set', prop: 'nota', value: 'A'})
        p.write({type: 'set', prop: 'mode', value: 'i'})
        p.write({type: 'tool', code: '10', tool: tool})

        p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
        p.write({type: 'op', op: 'move', coord: {x: 1, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
        p.write({type: 'op', op: 'move', coord: {x: 3, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})

        expect(p._path.traverse()).to.eql([
          {type: 'line', start: [0, 0], end: [1, 1]},
          {type: 'line', start: [1, 1], end: [1, 3]},
          {type: 'line', start: [1, 3], end: [3, 3]},
        ])
      })

      it('should handle moves in between strokes when not optimizing paths', function() {
        var tool = {shape: 'circle', params: [2], hole: []}
        p = plotter({optimizePaths: false})

        p.write({type: 'set', prop: 'epsilon', value: 0.00000001})
        p.write({type: 'set', prop: 'units', value: 'in'})
        p.write({type: 'set', prop: 'nota', value: 'A'})
        p.write({type: 'set', prop: 'mode', value: 'i'})
        p.write({type: 'tool', code: '10', tool: tool})

        p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
        p.write({type: 'op', op: 'move', coord: {x: 1, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
        p.write({type: 'op', op: 'move', coord: {x: 3, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})

        expect(p._path.traverse()).to.eql([
          {type: 'line', start: [0, 0], end: [1, 1]},
          {type: 'line', start: [1, 3], end: [1, 1]},
          {type: 'line', start: [3, 3], end: [1, 3]},
        ])
      })

      it('should update the box in non-region mode', function() {
        p.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 3, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 0, y: 0}})

        expect(p._box).to.eql([-1, -1, 4, 4])
      })

      it('should update the bounding box in region mode', function() {
        p.write({type: 'set', prop: 'region', value: true})
        p.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 3, y: 3}})
        p.write({type: 'op', op: 'int', coord: {x: 0, y: 0}})

        expect(p._box).to.eql([0, 0, 3, 3])
      })

      describe('arc strokes', function() {
        it('should determine the center and radius in single quadrant mode', function() {
          p.write({type: 'set', prop: 'arc', value: 's'})
          p.write({type: 'set', prop: 'mode', value: 'cw'})
          p.write({type: 'op', op: 'int', coord: {x: 2, y: 0, i: 1, j: 1.5}})
          p.write({type: 'set', prop: 'mode', value: 'ccw'})
          p.write({type: 'op', op: 'int', coord: {x: 4, y: 0, i: 1, j: 1.5}})
          p.write({type: 'set', prop: 'mode', value: 'cw'})
          p.write({type: 'op', op: 'int', coord: {x: 4, y: -2, i: 1.5, j: 1}})
          p.write({type: 'set', prop: 'mode', value: 'ccw'})
          p.write({type: 'op', op: 'int', coord: {x: 4, y: 0, i: 1.5, j: 1}})

          var R = Math.sqrt(Math.pow(1.5, 2) + 1)
          var arcs = p._path.traverse()

          // first arc
          expect(arcs[0]).to.deep.include({
            type: 'arc',
            dir: 'cw',
            center: [1, -1.5],
          })
          expect(arcs[0].start.slice(0, 2)).to.eql([0, 0])
          expect(arcs[0].start[2]).to.be.closeTo(2.158799, EPSILON)
          expect(arcs[0].end.slice(0, 2)).to.eql([2, 0])
          expect(arcs[0].end[2]).to.be.closeTo(0.982794, EPSILON)
          expect(arcs[0].sweep).to.be.closeTo(1.176005, EPSILON)
          expect(arcs[0].radius).to.be.closeTo(R, EPSILON)

          // second arc
          expect(arcs[1]).to.deep.include({
            type: 'arc',
            dir: 'ccw',
            center: [3, 1.5],
          })
          expect(arcs[1].start.slice(0, 2)).to.eql([2, 0])
          expect(arcs[1].start[2]).to.be.closeTo(4.124386, EPSILON)
          expect(arcs[1].end.slice(0, 2)).to.eql([4, 0])
          expect(arcs[1].end[2]).to.be.closeTo(5.300391, EPSILON)
          expect(arcs[1].sweep).to.be.closeTo(1.176005, EPSILON)
          expect(arcs[1].radius).to.be.closeTo(R, EPSILON)

          // third arc
          expect(arcs[2]).to.deep.include({
            type: 'arc',
            dir: 'cw',
            center: [2.5, -1],
          })
          expect(arcs[2].start.slice(0, 2)).to.eql([4, 0])
          expect(arcs[2].start[2]).to.be.closeTo(0.588002, EPSILON)
          expect(arcs[2].end.slice(0, 2)).to.eql([4, -2])
          expect(arcs[2].end[2]).to.be.closeTo(5.695182, EPSILON)
          expect(arcs[2].sweep).to.be.closeTo(1.176005, EPSILON)
          expect(arcs[2].radius).to.be.closeTo(R, EPSILON)

          // fourth arc
          expect(arcs[3]).to.deep.include({
            type: 'arc',
            dir: 'ccw',
            center: [2.5, -1],
          })
          expect(arcs[3].start.slice(0, 2)).to.eql([4, -2])
          expect(arcs[3].start[2]).to.be.closeTo(5.695183, EPSILON)
          expect(arcs[3].end.slice(0, 2)).to.eql([4, 0])
          expect(arcs[3].end[2]).to.be.closeTo(0.588003, EPSILON)
          expect(arcs[3].sweep).to.be.closeTo(1.176005, EPSILON)
          expect(arcs[3].radius).to.be.closeTo(R, EPSILON)
        })

        it('should use the actual offsets to get the center in multi-quadrant mode', function() {
          p.write({type: 'set', prop: 'arc', value: 'm'})
          p.write({type: 'set', prop: 'mode', value: 'cw'})
          p.write({type: 'op', op: 'int', coord: {x: 2, y: 0, i: 1, j: -1.5}})
          p.write({type: 'set', prop: 'mode', value: 'ccw'})
          p.write({type: 'op', op: 'int', coord: {x: 4, y: 0, i: 1, j: 1.5}})

          var R = Math.sqrt(Math.pow(1.5, 2) + 1)
          var arcs = p._path.traverse()

          // first arc
          expect(arcs[0]).to.deep.include({
            type: 'arc',
            dir: 'cw',
            center: [1, -1.5],
          })
          expect(arcs[0].start.slice(0, 2)).to.eql([0, 0])
          expect(arcs[0].start[2]).to.be.closeTo(2.158799, EPSILON)
          expect(arcs[0].end.slice(0, 2)).to.eql([2, 0])
          expect(arcs[0].end[2]).to.be.closeTo(0.982794, EPSILON)
          expect(arcs[0].sweep).to.be.closeTo(1.176005, EPSILON)
          expect(arcs[0].radius).to.be.closeTo(R, EPSILON)

          // second arc
          expect(arcs[1]).to.deep.include({
            type: 'arc',
            dir: 'ccw',
            center: [3, 1.5],
          })
          expect(arcs[1].start.slice(0, 2)).to.eql([2, 0])
          expect(arcs[1].start[2]).to.be.closeTo(4.124386, EPSILON)
          expect(arcs[1].end.slice(0, 2)).to.eql([4, 0])
          expect(arcs[1].end[2]).to.be.closeTo(5.300391, EPSILON)
          expect(arcs[1].sweep).to.be.closeTo(1.176005, EPSILON)
          expect(arcs[1].radius).to.be.closeTo(R, EPSILON)
        })

        it('should select the correct arc with an "a" coordinate', function() {
          p.write({type: 'set', prop: 'mode', value: 'cw'})
          p.write({type: 'op', op: 'int', coord: {x: 2, y: 2, a: 2}})
          p.write({type: 'set', prop: 'mode', value: 'ccw'})
          p.write({type: 'op', op: 'int', coord: {x: 4, y: 2, a: 1}})

          var arcs = p._path.traverse()

          // first arc
          expect(arcs[0]).to.deep.include({
            type: 'arc',
            dir: 'cw',
            center: [2, 0],
            radius: 2,
          })
          expect(arcs[0].start.slice(0, 2)).to.eql([0, 0])
          expect(arcs[0].start[2]).to.be.closeTo(3.141593, EPSILON)
          expect(arcs[0].end.slice(0, 2)).to.eql([2, 2])
          expect(arcs[0].end[2]).to.be.closeTo(1.570796, EPSILON)
          expect(arcs[0].sweep).to.be.closeTo(1.570796, EPSILON)

          // second arc
          expect(arcs[1]).to.deep.include({
            type: 'arc',
            dir: 'ccw',
            center: [3, 2],
            radius: 1,
          })
          expect(arcs[1].start.slice(0, 2)).to.eql([2, 2])
          expect(arcs[1].start[2]).to.be.closeTo(3.141593, EPSILON)
          expect(arcs[1].end.slice(0, 2)).to.eql([4, 2])
          expect(arcs[1].end[2]).to.be.closeTo(0, EPSILON)
          expect(arcs[1].sweep).to.be.closeTo(3.141593, EPSILON)
        })

        it('should set the sweep to zero for matching start and end in single mode', function() {
          p.write({type: 'set', prop: 'arc', value: 's'})
          p.write({type: 'set', prop: 'mode', value: 'cw'})
          p.write({type: 'op', op: 'int', coord: {x: 0, y: 0, i: 1}})

          expect(p._path.traverse()).to.eql([
            {
              type: 'arc',
              start: [0, 0, 0],
              end: [0, 0, 0],
              center: [-1, 0],
              sweep: 0,
              radius: 1,
              dir: 'cw',
            },
          ])
        })

        it('should set the sweep to a full circle in multi mode', function() {
          p.write({type: 'set', prop: 'arc', value: 'm'})
          p.write({type: 'set', prop: 'mode', value: 'cw'})
          p.write({type: 'op', op: 'int', coord: {x: 0, y: 0, i: -1}})

          expect(p._path.traverse()).to.eql([
            {
              type: 'arc',
              start: [0, 0, 0],
              end: [0, 0, 0],
              center: [-1, 0],
              sweep: 2 * Math.PI,
              radius: 1,
              dir: 'cw',
            },
          ])
        })

        it('should warn and not add to path if arc is impossible', function(done) {
          p.once('warning', function(w) {
            expect(w.message).to.match(/impossible arc/)
            expect(w.line).to.equal(12)

            setTimeout(function() {
              expect(p._path.length).to.equal(0)
              done()
            }, 5)
          })

          p.write({type: 'set', prop: 'arc', value: 's'})
          p.write({type: 'set', prop: 'mode', value: 'ccw'})
          p.write({type: 'op', op: 'int', coord: {x: 1, y: 1, i: 1}, line: 12})
        })

        it('should warn and not add to path if tool is not circular', function(done) {
          p.once('warning', function(w) {
            expect(w.message).to.match(/arc.*circular/)
            setTimeout(function() {
              expect(p._path.length).to.equal(0)
              done()
            }, 5)
          })

          var rectTool = {shape: 'rect', params: [2, 1], hole: []}
          p.write({type: 'tool', code: '11', tool: rectTool})
          p.write({type: 'set', prop: 'arc', value: 's'})
          p.write({type: 'set', prop: 'mode', value: 'cw'})
          p.write({type: 'op', op: 'int', coord: {x: 2, y: 0, i: 1, j: 1.5}})
        })

        it('should allow non-circular tools if in region mode', function() {
          var rectTool = {shape: 'rect', params: [2, 1], hole: []}
          p.write({type: 'tool', code: '11', tool: rectTool})
          p.write({type: 'set', prop: 'arc', value: 's'})
          p.write({type: 'set', prop: 'mode', value: 'cw'})
          p.write({type: 'set', prop: 'region', value: true})
          p.write({type: 'op', op: 'int', coord: {x: 2, y: 0, i: 1, j: 1.5}})
          expect(p._path.length).to.equal(1)
        })

        describe('bounding box', function() {
          it('should usually use the arc end points', function() {
            p.write({type: 'op', op: 'move', coord: {x: 0.5, y: 0.866}})
            p.write({type: 'set', prop: 'mode', value: 'cw'})
            p.write({type: 'set', prop: 'arc', value: 's'})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: 0.866, y: 0.5, i: 0.5, j: 0.866},
            })
            expect(p._box).to.eql([-0.5, -0.5, 1.866, 1.866])

            p._box = boundingBox.new()
            p.write({type: 'set', prop: 'region', value: true})
            p.write({type: 'op', op: 'move', coord: {x: 0.5, y: 0.866}})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: 0.866, y: 0.5, i: 0.5, j: 0.866},
            })
            expect(p._box).to.eql([0.5, 0.5, 0.866, 0.866])
          })

          it('should should set the min x when arc sweeps past 180 deg', function() {
            p.write({type: 'op', op: 'move', coord: {x: -0.7071, y: -0.7071}})
            p.write({type: 'set', prop: 'mode', value: 'cw'})
            p.write({type: 'set', prop: 'arc', value: 's'})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: -0.7071, y: 0.7071, i: 0.7071, j: 0.7071},
            })
            expect(p._box[0]).to.be.closeTo(-2, 0.00001)

            p._box = boundingBox.new()
            p.write({type: 'set', prop: 'region', value: true})
            p.write({type: 'op', op: 'move', coord: {x: -0.7071, y: -0.7071}})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: -0.7071, y: 0.7071, i: 0.7071, j: 0.7071},
            })
            expect(p._box[0]).to.be.closeTo(-1, 0.00001)
          })

          it('should should set the min y when arc sweeps past 270 deg', function() {
            p.write({type: 'op', op: 'move', coord: {x: -0.7071, y: -0.7071}})
            p.write({type: 'set', prop: 'mode', value: 'ccw'})
            p.write({type: 'set', prop: 'arc', value: 's'})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: 0.7071, y: -0.7071, i: 0.7071, j: 0.7071},
            })
            expect(p._box[1]).to.be.closeTo(-2, 0.00001)

            p._box = boundingBox.new()
            p.write({type: 'set', prop: 'region', value: true})
            p.write({type: 'op', op: 'move', coord: {x: -0.7071, y: -0.7071}})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: 0.7071, y: -0.7071, i: 0.7071, j: 0.7071},
            })
            expect(p._box[1]).to.be.closeTo(-1, 0.00001)
          })

          it('should should set the max x when arc sweeps past 0 deg', function() {
            p.write({type: 'op', op: 'move', coord: {x: 0.7071, y: -0.7071}})
            p.write({type: 'set', prop: 'mode', value: 'ccw'})
            p.write({type: 'set', prop: 'arc', value: 's'})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: 0.7071, y: 0.7071, i: 0.7071, j: 0.7071},
            })
            expect(p._box[2]).to.be.closeTo(2, 0.00001)

            p._box = boundingBox.new()
            p.write({type: 'set', prop: 'region', value: true})
            p.write({type: 'op', op: 'move', coord: {x: 0.7071, y: -0.7071}})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: 0.7071, y: 0.7071, i: 0.7071, j: 0.7071},
            })
            expect(p._box[2]).to.be.closeTo(1, 0.00001)
          })

          it('should should set the max y when arc sweeps past 90 deg', function() {
            p.write({type: 'op', op: 'move', coord: {x: -0.7071, y: 0.7071}})
            p.write({type: 'set', prop: 'mode', value: 'cw'})
            p.write({type: 'set', prop: 'arc', value: 's'})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: 0.7071, y: 0.7071, i: 0.7071, j: 0.7071},
            })
            expect(p._box[3]).to.be.closeTo(2, 0.00001)

            p._box = boundingBox.new()
            p.write({type: 'set', prop: 'region', value: true})
            p.write({type: 'op', op: 'move', coord: {x: -0.7071, y: 0.7071}})
            p.write({
              type: 'op',
              op: 'int',
              coord: {x: 0.7071, y: 0.7071, i: 0.7071, j: 0.7071},
            })
            expect(p._box[3]).to.be.closeTo(1, 0.00001)
          })

          it('should set the box properly for a full circle', function() {
            p.write({type: 'set', prop: 'mode', value: 'cw'})
            p.write({type: 'set', prop: 'arc', value: 'm'})
            p.write({type: 'op', op: 'int', coord: {x: 0, y: 0, i: -1, j: 0}})
            expect(p._box).to.eql([-3, -2, 1, 2])

            p._box = boundingBox.new()
            p.write({type: 'set', prop: 'region', value: true})
            p.write({type: 'op', op: 'int', coord: {x: 0, y: 0, i: 0, j: 1}})
            expect(p._box).to.eql([-1, 0, 1, 2])
          })
        })
      })
    })

    describe('interpolating with rectangular tools', function() {
      beforeEach(function() {
        var rectTool = {shape: 'rect', params: [2, 1], hole: []}
        p.write({type: 'tool', code: '11', tool: rectTool})
      })

      it('should directly emit fills without adding to the path for rect tools', function(done) {
        var path = [
          {type: 'line', start: [-1, -0.5], end: [1, -0.5]},
          {type: 'line', start: [1, -0.5], end: [1, 0.5]},
          {type: 'line', start: [1, 0.5], end: [-1, 0.5]},
          {type: 'line', start: [-1, 0.5], end: [-1, -0.5]},
        ]

        p.once('readable', function() {
          var result = p.read()
          expect(p._path.length).to.equal(0)
          expect(result).to.eql({type: 'fill', path: path})

          setTimeout(function() {
            expect(p._box).to.eql([-1, -0.5, 1, 0.5])
            done()
          }, 1)
        })

        p.write({type: 'op', op: 'int', coord: {x: 0, y: 0}})
      })

      it('should handle a first quadrant move', function(done) {
        var path = [
          {type: 'line', start: [-1, -0.5], end: [1, -0.5]},
          {type: 'line', start: [1, -0.5], end: [6, 4.5]},
          {type: 'line', start: [6, 4.5], end: [6, 5.5]},
          {type: 'line', start: [6, 5.5], end: [4, 5.5]},
          {type: 'line', start: [4, 5.5], end: [-1, 0.5]},
          {type: 'line', start: [-1, 0.5], end: [-1, -0.5]},
        ]

        p.once('readable', function() {
          var result = p.read()
          expect(p._path.length).to.equal(0)
          expect(result).to.eql({type: 'fill', path: path})

          setTimeout(function() {
            expect(p._box).to.eql([-1, -0.5, 6, 5.5])
            done()
          }, 1)
        })

        p.write({type: 'op', op: 'int', coord: {x: 5, y: 5}})
      })

      it('should handle a second quadrant move', function(done) {
        var path = [
          {type: 'line', start: [1, -0.5], end: [1, 0.5]},
          {type: 'line', start: [1, 0.5], end: [-4, 5.5]},
          {type: 'line', start: [-4, 5.5], end: [-6, 5.5]},
          {type: 'line', start: [-6, 5.5], end: [-6, 4.5]},
          {type: 'line', start: [-6, 4.5], end: [-1, -0.5]},
          {type: 'line', start: [-1, -0.5], end: [1, -0.5]},
        ]

        p.once('readable', function() {
          var result = p.read()
          expect(p._path.length).to.equal(0)
          expect(result).to.eql({type: 'fill', path: path})

          setTimeout(function() {
            expect(p._box).to.eql([-6, -0.5, 1, 5.5])
            done()
          }, 1)
        })

        p.write({type: 'op', op: 'int', coord: {x: -5, y: 5}})
      })

      it('should handle a third quadrant move', function(done) {
        var path = [
          {type: 'line', start: [1, 0.5], end: [-1, 0.5]},
          {type: 'line', start: [-1, 0.5], end: [-6, -4.5]},
          {type: 'line', start: [-6, -4.5], end: [-6, -5.5]},
          {type: 'line', start: [-6, -5.5], end: [-4, -5.5]},
          {type: 'line', start: [-4, -5.5], end: [1, -0.5]},
          {type: 'line', start: [1, -0.5], end: [1, 0.5]},
        ]

        p.once('readable', function() {
          var result = p.read()
          expect(p._path.length).to.equal(0)
          expect(result).to.eql({type: 'fill', path: path})

          setTimeout(function() {
            expect(p._box).to.eql([-6, -5.5, 1, 0.5])
            done()
          }, 1)
        })

        p.write({type: 'op', op: 'int', coord: {x: -5, y: -5}})
      })

      it('should handle a fourth quadrant move', function(done) {
        var path = [
          {type: 'line', start: [-1, 0.5], end: [-1, -0.5]},
          {type: 'line', start: [-1, -0.5], end: [4, -5.5]},
          {type: 'line', start: [4, -5.5], end: [6, -5.5]},
          {type: 'line', start: [6, -5.5], end: [6, -4.5]},
          {type: 'line', start: [6, -4.5], end: [1, 0.5]},
          {type: 'line', start: [1, 0.5], end: [-1, 0.5]},
        ]

        p.once('readable', function() {
          var result = p.read()
          expect(p._path.length).to.equal(0)
          expect(result).to.eql({type: 'fill', path: path})

          setTimeout(function() {
            expect(p._box).to.eql([-1, -5.5, 6, 0.5])
            done()
          }, 1)
        })

        p.write({type: 'op', op: 'int', coord: {x: 5, y: -5}})
      })

      it('should do a normal stroke if region mode is on', function(done) {
        p._region = true
        p.write({type: 'op', op: 'int', coord: {x: 5, y: 5}})

        setTimeout(function() {
          expect(p._path.traverse()).to.eql([
            {type: 'line', start: [0, 0], end: [5, 5]},
          ])
          done()
        }, 10)
      })
    })

    it('should allow but warn about modal operation codes', function(done) {
      p.once('warning', function(w) {
        expect(w.message).to.match(/modal operation/)
        setTimeout(function() {
          expect(p._path.length).to.equal(2)
          done()
        }, 5)
      })

      p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
      p.write({type: 'op', op: 'last', coord: {x: 2, y: 2}})
    })
  })

  describe('operation warnings', function() {
    beforeEach(function() {
      var tool = {shape: 'circle', params: [2], hole: []}
      p.write({type: 'set', prop: 'epsilon', value: 0.00000001})
      p.write({type: 'tool', code: '10', tool: tool})
    })

    it('should warn and use backup units if the units are not set', function(done) {
      p.once('warning', function(w) {
        expect(w.message).to.match(/backup units/)
        done()
      })

      p.write({type: 'set', prop: 'nota', value: 'A'})
      p.write({type: 'set', prop: 'mode', value: 'i'})
      p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
    })

    it('should warn and use backup notation if the notation is not set', function(done) {
      p.once('warning', function(w) {
        expect(w.message).to.match(/backup notation/)
        done()
      })

      p.write({type: 'set', prop: 'units', value: 'in'})
      p.write({type: 'set', prop: 'mode', value: 'i'})
      p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
    })

    it('should warn if a tool is flashed in region mode', function(done) {
      p.once('warning', function(w) {
        expect(w.message).to.match(/flash in region/)
        done()
      })

      p.write({type: 'set', prop: 'units', value: 'in'})
      p.write({type: 'set', prop: 'nota', value: 'A'})
      p.write({type: 'set', prop: 'region', value: 'true'})
      p.write({type: 'op', op: 'flash', coord: {x: 1, y: 1}})
    })

    it('should warn if a non-existent tool is flashed', function(done) {
      p.once('warning', function(w) {
        expect(w.message).to.match(/unknown tool/)
        done()
      })

      p.write({type: 'set', prop: 'units', value: 'in'})
      p.write({type: 'set', prop: 'nota', value: 'A'})
      p._tool = null
      p.write({type: 'op', op: 'flash', coord: {x: 1, y: 1}})
    })

    it('should warn and ignore interpolates with unstrokable tools', function(done) {
      var tool = {shape: 'circle', params: [2], hole: [1]}

      p.once('warning', function(w) {
        expect(w.message).to.match(/not strokable/)

        setTimeout(function() {
          expect(p._path.length).to.equal(0)
          done()
        }, 5)
      })

      p.write({type: 'tool', code: '11', tool: tool})
      p.write({type: 'set', prop: 'units', value: 'in'})
      p.write({type: 'set', prop: 'nota', value: 'A'})
      p.write({type: 'set', prop: 'mode', value: 'i'})
      p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
    })

    it('should warn and assume linear interpolation mode if unspecified', function(done) {
      p.once('warning', function(w) {
        expect(w.message).to.match(/no interpolation.*linear/)
        setTimeout(function() {
          expect(p._path.length).to.equal(1)
          done()
        }, 5)
      })

      p.write({type: 'set', prop: 'units', value: 'in'})
      p.write({type: 'set', prop: 'nota', value: 'A'})
      p.write({type: 'op', op: 'int', coord: {x: 1, y: 1}})
    })

    it('should warn and assume single-quadrant mode if unspecified', function(done) {
      p.on('warning', function(w) {
        expect(w.message).to.match(/assuming single quadrant/)
        setTimeout(function() {
          expect(p._arc).to.equal('s')
          expect(p._path.length).to.equal(1)
          done()
        }, 5)
      })

      p.write({type: 'set', prop: 'units', value: 'in'})
      p.write({type: 'set', prop: 'nota', value: 'A'})
      p.write({type: 'set', prop: 'mode', value: 'cw'})
      p.write({type: 'op', op: 'int', coord: {x: 2, y: 0, i: 1, j: 1.5}})
    })
  })

  describe('emitting strokes and regions', function() {
    var path = [
      {type: 'line', start: [0, 0], end: [1, 0]},
      {type: 'line', start: [1, 0], end: [1, 1]},
      {type: 'line', start: [1, 1], end: [0, 1]},
      {type: 'line', start: [0, 1], end: [0, 0]},
    ]

    beforeEach(function() {
      var tool0 = {shape: 'circle', params: [0.2], hole: []}
      var tool1 = {shape: 'circle', params: [0.4], hole: []}
      p.write({type: 'tool', code: '11', tool: tool1})
      p.write({type: 'tool', code: '10', tool: tool0})

      path.forEach(function(path) {
        p._path.add(path)
      })
    })

    it('should end the path on a tool change', function(done) {
      p.once('data', function() {
        expect(p._path.length).to.equal(0)
        done()
      })

      p.write({type: 'set', prop: 'tool', value: '10'})
    })

    it('should end the path on a tool definition', function(done) {
      var tool = {shape: 'circle', params: [0.1], hole: []}

      p.once('data', function() {
        expect(p._path.length).to.equal(0)
        done()
      })

      p.write({type: 'tool', code: '12', tool: tool})
    })

    it('should end the path on a region change', function(done) {
      p.once('data', function() {
        expect(p._path.length).to.equal(0)
        done()
      })

      p.write({type: 'set', prop: 'region', value: true})
    })

    it('should end the path on a polarity change', function(done) {
      p.once('data', function() {
        expect(p._path.length).to.equal(0)
        done()
      })

      p.write({type: 'level', level: 'polarity', value: 'C'})
    })

    it('should end the path on a step repeat', function(done) {
      p.once('data', function() {
        expect(p._path.length).to.equal(0)
        done()
      })

      p.write({
        type: 'level',
        level: 'stepRep',
        value: {x: 5, y: 5, i: 2, j: 2},
      })
    })

    it('should end the path on stream end', function(done) {
      p.once('data', function() {
        expect(p._path.length).to.equal(0)
        done()
      })

      p.end()
    })

    it('should emit a stroke if region mode it off', function(done) {
      var expected = {
        type: 'stroke',
        width: 0.2,
        path: path,
      }

      p.once('readable', function() {
        var data = p.read()
        expect(data).to.eql(expected)
        done()
      })

      p._finishPath()
    })

    it('should emit a fill if region mode is on', function(done) {
      var expected = {type: 'fill', path: path}

      p.once('readable', function() {
        var data = p.read()
        expect(data).to.eql(expected)
        done()
      })

      p._region = true
      p._finishPath()
    })
  })

  describe('emitting new layers', function() {
    it('should push a polarity change with the current bounding box', function(done) {
      var results = 0
      var expected = [
        {type: 'polarity', polarity: 'clear', box: [0, 0, 10, 10]},
        {type: 'polarity', polarity: 'dark', box: [0, 0, 10, 10]},
      ]

      var handleData = function(data) {
        expect(data).to.eql(expected[results])
        if (++results >= expected.length) {
          p.removeListener('data', handleData)
          return done()
        }
      }

      p.on('data', handleData)
      p._box = [0, 0, 10, 10]
      p.write({type: 'level', level: 'polarity', value: 'C'})
      p.write({type: 'level', level: 'polarity', value: 'D'})
    })

    it('should push a step repeat with the current bounding box', function(done) {
      p.once('readable', function() {
        var result = p.read()
        expect(result).to.eql({
          type: 'repeat',
          offsets: [
            [0, 0],
            [0, 2.2],
            [0, 4.4],
            [3.3, 0],
            [3.3, 2.2],
            [3.3, 4.4],
          ],
          box: [0, 0, 10, 10],
        })
        done()
      })

      p._box = [0, 0, 10, 10]
      p.write({
        type: 'level',
        level: 'stepRep',
        value: {x: 2, y: 3, i: 3.3, j: 2.2},
      })
    })

    it('should update the box during a step repeat', function() {
      var tool = {shape: 'circle', params: [2], hole: []}
      p.write({type: 'tool', code: '10', tool: tool})
      p.write({
        type: 'level',
        level: 'stepRep',
        value: {x: 2, y: 2, i: 3.5, j: -3},
      })
      p.write({type: 'op', op: 'flash', coord: {x: -3, y: 4}})
      expect(p._box).to.eql([-4, 0, 1.5, 5])
    })
  })

  describe('ending the stream', function() {
    it('should push a size object after the stream ends', function(done) {
      p.once('readable', function() {
        var result = p.read()
        expect(result).to.eql({type: 'size', box: [1, 2, 3, 4], units: 'in'})
        done()
      })

      p._box = [1, 2, 3, 4]
      p.format.units = 'in'
      p.end()
    })
  })

  describe('outline mode', function() {
    var outPlotter
    var tool
    beforeEach(function() {
      tool = {shape: 'circle', params: [2], hole: []}

      outPlotter = plotter({plotAsOutline: true})
      outPlotter.write({type: 'set', prop: 'epsilon', value: 0.00000001})
      outPlotter.write({type: 'set', prop: 'units', value: 'in'})
      outPlotter.write({type: 'set', prop: 'nota', value: 'A'})
      outPlotter.write({type: 'set', prop: 'mode', value: 'i'})
      outPlotter.write({type: 'tool', code: '10', tool: tool})
    })

    it('should update the bounding box in as if it was region mode', function() {
      outPlotter.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})
      outPlotter.write({type: 'op', op: 'int', coord: {x: 3, y: 3}})
      outPlotter.write({type: 'op', op: 'int', coord: {x: 0, y: 0}})

      expect(outPlotter._box).to.eql([0, 0, 3, 3])
    })

    it('should set the tool to the first used tool and never change it', function() {
      var newTool = {shape: 'circle', params: [4], hole: []}
      var newerTool = {shape: 'circle', params: [6], hole: []}

      outPlotter.write({type: 'tool', code: '11', tool: newTool})
      expect(outPlotter._tool.code).to.equal('11')
      outPlotter.write({type: 'set', prop: 'tool', value: '10'})
      expect(outPlotter._tool.code).to.equal('10')
      outPlotter.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})
      outPlotter.write({type: 'set', prop: 'tool', value: '11'})
      expect(outPlotter._tool.code).to.equal('10')
      outPlotter.write({type: 'tool', code: '12', tool: newerTool})
      expect(outPlotter._tool.code).to.equal('10')
    })

    it('should fill gaps in paths if in outline mode', function() {
      expect(!outPlotter._path._fillGaps).to.equal(false)
      outPlotter.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})
      outPlotter._finishPath()
      expect(!outPlotter._path._fillGaps).to.equal(false)
    })

    it('should be able to set a custom max gap size', function() {
      outPlotter = plotter({plotAsOutline: 0.0011, units: 'mm'})
      expect(outPlotter._path._fillGaps).to.equal(0.0011)
    })
  })

  describe('path optimization', function() {
    var optimizedPlotter
    var tool
    beforeEach(function() {
      tool = {shape: 'circle', params: [2], hole: []}

      optimizedPlotter = plotter({optimizePaths: true})
      optimizedPlotter.write({type: 'set', prop: 'epsilon', value: 0.00000001})
      optimizedPlotter.write({type: 'set', prop: 'units', value: 'in'})
      optimizedPlotter.write({type: 'set', prop: 'nota', value: 'A'})
      optimizedPlotter.write({type: 'set', prop: 'mode', value: 'i'})
      optimizedPlotter.write({type: 'tool', code: '10', tool: tool})
    })

    it('should set the path to optimize', function() {
      expect(optimizedPlotter._path._optimize).to.equal(true)
      optimizedPlotter.write({type: 'op', op: 'int', coord: {x: 1, y: 3}})
      optimizedPlotter._finishPath()
      expect(optimizedPlotter._path._optimize).to.equal(true)
    })

    it('should not optimize in region mode', function() {
      optimizedPlotter.write({type: 'set', prop: 'region', value: true})
      expect(optimizedPlotter._path._optimize).to.equal(false)
      optimizedPlotter.write({type: 'set', prop: 'region', value: false})
      expect(optimizedPlotter._path._optimize).to.equal(true)
    })
  })
})
