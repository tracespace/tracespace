// test suite for the plotter to svg transform stream
'use strict'

var assign = require('lodash/assign')
var sinon = require('sinon')
var expect = require('chai').expect
var xmlElement = require('xml-element-string')

var PlotterToSvg = require('../lib/plotter-to-svg')

var HALF_PI = Math.PI / 2

var SVG_ATTR = {
  xmlns: 'http://www.w3.org/2000/svg',
  version: '1.1',
  'xmlns:xlink': 'http://www.w3.org/1999/xlink',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '0',
  'fill-rule': 'evenodd',
  width: '0',
  height: '0',
  viewBox: '0 0 0 0',
}

var EMPTY_BOX = [Infinity, Infinity, -Infinity, -Infinity]

describe('plotter to svg transform stream', function() {
  var p
  var element

  beforeEach(function() {
    element = sinon.spy(xmlElement)
    p = new PlotterToSvg('id', {}, element)
    p.setEncoding('utf8')
  })

  it('should emit an empty svg if it gets a zero size plot', function(done) {
    p.once('data', function() {
      expect(element).to.be.calledWith('svg', SVG_ATTR, [])
      expect(p.viewBox).to.eql([0, 0, 0, 0])
      expect(p.width).to.equal(0)
      expect(p.height).to.equal(0)
      expect(p.units).to.equal('')
      done()
    })

    p.write({type: 'size', box: EMPTY_BOX, units: ''})
    p.end()
  })

  it('should be able to add attributes', function(done) {
    var converter = new PlotterToSvg('foo', {id: 'foo', bar: 'baz'}, element)
    var expected = assign({}, SVG_ATTR, {id: 'foo', bar: 'baz'})

    converter.once('data', function() {
      expect(element).to.be.calledWith('svg', expected)
      done()
    })

    converter.write({type: 'size', box: EMPTY_BOX, units: ''})
    converter.end()
  })

  describe('creating pad shapes', function() {
    it('should handle circle primitives', function() {
      var toolShape = [{type: 'circle', cx: 0.001, cy: 0.002, r: 0.005}]
      var expected = {id: 'id_pad-10', cx: 1, cy: 2, r: 5}

      p.write({type: 'shape', tool: '10', shape: toolShape})
      expect(element).to.be.calledWith('circle', expected)
      expect(p.defs).to.eql([element.returnValues[0]])
    })

    it('should handle rect primitives', function() {
      var toolShape = [
        {
          type: 'rect',
          cx: 0.002,
          cy: 0.004,
          width: 0.002,
          height: 0.004,
          r: 0.002,
        },
      ]
      var expected = {
        id: 'id_pad-10',
        x: 1,
        y: 2,
        rx: 2,
        ry: 2,
        width: 2,
        height: 4,
      }

      p.write({type: 'shape', tool: '10', shape: toolShape})
      expect(element).to.be.calledWith('rect', expected)
      expect(p.defs).to.eql([element.returnValues[0]])
    })

    it('should handle polygon primitives', function() {
      var toolShape = [{type: 'poly', points: [[0, 0], [1, 0], [0, 1]]}]
      var expected = {id: 'id_pad-12', points: '0,0 1000,0 0,1000'}

      p.write({type: 'shape', tool: '12', shape: toolShape})
      expect(element).to.be.calledWith('polygon', expected)
      expect(p.defs).to.eql([element.returnValues[0]])
    })

    it('should handle a ring primitives', function() {
      var toolShape = [
        {type: 'ring', r: 0.02, width: 0.005, cx: 0.05, cy: -0.03},
      ]
      var expected = {
        id: 'id_pad-11',
        cx: 50,
        cy: -30,
        r: 20,
        'stroke-width': 5,
        fill: 'none',
      }

      p.write({type: 'shape', tool: '11', shape: toolShape})
      expect(element).to.be.calledWith('circle', expected)
      expect(p.defs).to.eql([element.returnValues[0]])
    })

    it('should handle a clipped primitive with rects', function() {
      var clippedShapes = [
        {type: 'rect', cx: 0.003, cy: 0.003, width: 0.004, height: 0.004, r: 0},
        {
          type: 'rect',
          cx: -0.003,
          cy: 0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
        {
          type: 'rect',
          cx: -0.003,
          cy: -0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
        {
          type: 'rect',
          cx: 0.003,
          cy: -0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
      ]

      var ring = {type: 'ring', r: 0.004, width: 0.002, cx: 0, cy: 0}
      var toolShape = [{type: 'clip', shape: clippedShapes, clip: ring}]
      var expected = [
        {cx: 0, cy: 0, r: 4, 'stroke-width': 2, fill: 'none'},
        {id: 'id_pad-15_mask-0', stroke: '#fff'},
        {x: 1, y: 1, width: 4, height: 4},
        {x: -5, y: 1, width: 4, height: 4},
        {x: -5, y: -5, width: 4, height: 4},
        {x: 1, y: -5, width: 4, height: 4},
        {id: 'id_pad-15', mask: 'url(#id_pad-15_mask-0)'},
      ]

      p.write({type: 'shape', tool: '15', shape: toolShape})
      expect(element).to.be.calledWith('circle', expected[0])
      expect(element).to.be.calledWith('mask', expected[1], [
        element.returnValues[0],
      ])
      expect(element).to.be.calledWith('rect', expected[2])
      expect(element).to.be.calledWith('rect', expected[3])
      expect(element).to.be.calledWith('rect', expected[4])
      expect(element).to.be.calledWith('rect', expected[5])
      expect(element).to.be.calledWith(
        'g',
        expected[6],
        element.returnValues.slice(2, 6)
      )
      expect(p.defs).to.eql([element.returnValues[1], element.returnValues[6]])
    })

    it('should handle a clipped primitive with polys', function() {
      var po = 0.001
      var ne = -0.005
      var mP = po + 0.004
      var mN = ne + 0.004

      var clippedShapes = [
        {type: 'poly', points: [[po, po], [mP, po], [mP, mP], [po, mP]]},
        {type: 'poly', points: [[ne, po], [mN, po], [mN, mP], [ne, mP]]},
        {type: 'poly', points: [[ne, ne], [mN, ne], [mN, mN], [ne, mN]]},
        {type: 'poly', points: [[po, ne], [mP, ne], [mP, mN], [po, mN]]},
      ]
      var ring = {type: 'ring', r: 0.004, width: 0.002, cx: 0, cy: 0}
      var toolShape = [{type: 'clip', shape: clippedShapes, clip: ring}]
      var expected = [
        {cx: 0, cy: 0, r: 4, 'stroke-width': 2, fill: 'none'},
        {id: 'id_pad-15_mask-0', stroke: '#fff'},
        {points: '1,1 5,1 5,5 1,5'},
        {points: '-5,1 -1,1 -1,5 -5,5'},
        {points: '-5,-5 -1,-5 -1,-1 -5,-1'},
        {points: '1,-5 5,-5 5,-1 1,-1'},
        {id: 'id_pad-15', mask: 'url(#id_pad-15_mask-0)'},
      ]

      p.write({type: 'shape', tool: '15', shape: toolShape})
      expect(element).to.be.calledWith('circle', expected[0])
      expect(element).to.be.calledWith('mask', expected[1], [
        element.returnValues[0],
      ])
      expect(element).to.be.calledWith('polygon', expected[2])
      expect(element).to.be.calledWith('polygon', expected[3])
      expect(element).to.be.calledWith('polygon', expected[4])
      expect(element).to.be.calledWith('polygon', expected[5])
      expect(element).to.be.calledWith(
        'g',
        expected[6],
        element.returnValues.slice(2, 6)
      )
      expect(p.defs).to.eql([element.returnValues[1], element.returnValues[6]])
    })

    it('should handle multiple primitives', function() {
      var toolShape = [
        {type: 'rect', cx: 0.003, cy: 0.003, width: 0.004, height: 0.004, r: 0},
        {
          type: 'rect',
          cx: -0.003,
          cy: 0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
        {
          type: 'rect',
          cx: -0.003,
          cy: -0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
        {
          type: 'rect',
          cx: 0.003,
          cy: -0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
      ]

      var expected = [
        {x: 1, y: 1, width: 4, height: 4},
        {x: -5, y: 1, width: 4, height: 4},
        {x: -5, y: -5, width: 4, height: 4},
        {x: 1, y: -5, width: 4, height: 4},
        {id: 'id_pad-20'},
      ]

      p.write({type: 'shape', tool: '20', shape: toolShape})
      expect(element).to.be.calledWith('rect', expected[0])
      expect(element).to.be.calledWith('rect', expected[1])
      expect(element).to.be.calledWith('rect', expected[2])
      expect(element).to.be.calledWith('rect', expected[3])
      expect(element).to.be.calledWith(
        'g',
        expected[4],
        element.returnValues.slice(0, 4)
      )
      expect(p.defs).to.eql([element.returnValues[4]])
    })

    it('should handle multiple clipped primitives', function() {
      var clippedShapes1 = [
        {type: 'rect', cx: 0.003, cy: 0.003, width: 0.004, height: 0.004, r: 0},
        {
          type: 'rect',
          cx: -0.003,
          cy: 0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
        {
          type: 'rect',
          cx: -0.003,
          cy: -0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
        {
          type: 'rect',
          cx: 0.003,
          cy: -0.003,
          width: 0.004,
          height: 0.004,
          r: 0,
        },
      ]

      var clippedShapes2 = [
        {type: 'rect', cx: 0.003, cy: 0.003, width: 0.002, height: 0.002, r: 0},
        {
          type: 'rect',
          cx: -0.003,
          cy: 0.003,
          width: 0.002,
          height: 0.002,
          r: 0,
        },
        {
          type: 'rect',
          cx: -0.003,
          cy: -0.003,
          width: 0.002,
          height: 0.002,
          r: 0,
        },
        {
          type: 'rect',
          cx: 0.003,
          cy: -0.003,
          width: 0.002,
          height: 0.002,
          r: 0,
        },
      ]

      var ring1 = {type: 'ring', r: 0.004, width: 0.002, cx: 0, cy: 0}
      var ring2 = {type: 'ring', r: 0.002, width: 0.001, cx: 0, cy: 0}
      var toolShape = [
        {type: 'clip', shape: clippedShapes1, clip: ring1},
        {type: 'clip', shape: clippedShapes2, clip: ring2},
      ]

      p.write({type: 'shape', tool: '15', shape: toolShape})

      var values = element.returnValues
      var expected = [
        {cx: 0, cy: 0, r: 4, 'stroke-width': 2, fill: 'none'},
        {id: 'id_pad-15_mask-0', stroke: '#fff'},
        {x: 1, y: 1, width: 4, height: 4},
        {x: -5, y: 1, width: 4, height: 4},
        {x: -5, y: -5, width: 4, height: 4},
        {x: 1, y: -5, width: 4, height: 4},
        {mask: 'url(#id_pad-15_mask-0)'},
        {cx: 0, cy: 0, r: 2, 'stroke-width': 1, fill: 'none'},
        {id: 'id_pad-15_mask-1', stroke: '#fff'},
        {x: 2, y: 2, width: 2, height: 2},
        {x: -4, y: 2, width: 2, height: 2},
        {x: -4, y: -4, width: 2, height: 2},
        {x: 2, y: -4, width: 2, height: 2},
        {mask: 'url(#id_pad-15_mask-1)'},
        {id: 'id_pad-15'},
      ]

      expect(element).to.be.calledWith('circle', expected[0])
      expect(element).to.be.calledWith('mask', expected[1], [values[0]])
      expect(element).to.be.calledWith('rect', expected[2])
      expect(element).to.be.calledWith('rect', expected[3])
      expect(element).to.be.calledWith('rect', expected[4])
      expect(element).to.be.calledWith('rect', expected[5])
      expect(element).to.be.calledWith('g', expected[6], values.slice(2, 6))
      expect(element).to.be.calledWith('circle', expected[7])
      expect(element).to.be.calledWith('mask', expected[8], [values[7]])
      expect(element).to.be.calledWith('rect', expected[9])
      expect(element).to.be.calledWith('rect', expected[10])
      expect(element).to.be.calledWith('rect', expected[11])
      expect(element).to.be.calledWith('rect', expected[12])
      expect(element).to.be.calledWith('g', expected[13], values.slice(9, 13))
      expect(element).to.be.calledWith('g', expected[14], [
        values[6],
        values[13],
      ])
      expect(p.defs).to.eql([values[1], values[8], values[14]])
    })

    it('should handle polarity changes', function() {
      var toolShape = [
        {type: 'rect', cx: 0, cy: 0.005, width: 0.006, height: 0.008, r: 0},
        {type: 'layer', polarity: 'clear', box: [-0.003, 0.001, 0.003, 0.009]},
        {type: 'rect', cx: 0, cy: 0.005, width: 0.004, height: 0.004, r: 0},
        {type: 'layer', polarity: 'dark', box: [-0.003, 0.001, 0.003, 0.009]},
        {type: 'rect', cx: 0, cy: -0.005, width: 0.006, height: 0.008, r: 0},
        {type: 'circle', cx: 0, cy: 0, r: 0.004},
        {type: 'layer', polarity: 'clear', box: [-0.004, -0.009, 0.004, 0.004]},
        {type: 'rect', cx: 0, cy: -0.005, width: 0.004, height: 0.004, r: 0},
        {type: 'circle', cx: 0, cy: 0, r: 0.002},
      ]

      var expected = [
        {x: -3, y: 1, width: 6, height: 8},
        {mask: 'url(#id_pad-11_1)'},
        {x: -2, y: 3, width: 4, height: 4},
        {x: -3, y: 1, width: 6, height: 8, fill: '#fff'},
        {},
        {id: 'id_pad-11_1', fill: '#000', stroke: '#000'},
        {x: -3, y: -9, width: 6, height: 8},
        {cx: 0, cy: 0, r: 4},
        {mask: 'url(#id_pad-11_3)'},
        {x: -2, y: -7, width: 4, height: 4},
        {cx: 0, cy: 0, r: 2},
        {x: -4, y: -9, width: 8, height: 13, fill: '#fff'},
        {},
        {id: 'id_pad-11_3', fill: '#000', stroke: '#000'},
        {id: 'id_pad-11'},
      ]

      p.write({type: 'shape', tool: '11', shape: toolShape})

      var values = element.returnValues

      expect(element).to.be.calledWith('rect', expected[0])
      expect(element).to.be.calledWith('g', expected[1], [values[0]])
      expect(element).to.be.calledWith('rect', expected[2])
      expect(element).to.be.calledWith('rect', expected[3])
      expect(element).to.be.calledWith('g', expected[4], [values[3], values[2]])
      expect(element).to.be.calledWith('mask', expected[5], [values[4]])
      expect(element).to.be.calledWith('rect', expected[6])
      expect(element).to.be.calledWith('circle', expected[7])
      expect(element).to.be.calledWith('g', expected[8], [
        values[1],
        values[6],
        values[7],
      ])
      expect(element).to.be.calledWith('rect', expected[9])
      expect(element).to.be.calledWith('circle', expected[10])
      expect(element).to.be.calledWith('rect', expected[11])
      expect(element).to.be.calledWith('g', expected[12], [
        values[11],
        values[9],
        values[10],
      ])
      expect(element).to.be.calledWith('mask', expected[13], [values[12]])
      expect(element).to.be.calledWith('g', expected[14], [values[8]])
      expect(p.defs).to.eql([values[5], values[13], values[14]])
    })
  })

  it('should be able to add a pad to the layer', function() {
    var pad = {type: 'pad', tool: '24', x: 0.02, y: 0.05}

    p.write(pad)
    expect(element).to.be.calledWith('use', {
      'xlink:href': '#id_pad-24',
      x: 20,
      y: 50,
    })
    expect(p.layer).to.eql(element.returnValues)
  })

  describe('fills and strokes', function() {
    it('should add a path to the layer for a fill', function() {
      var fill = {type: 'fill', path: []}

      p.write(fill)
      expect(element).to.be.calledWith('path', {d: ''})
      expect(p.layer).to.eql(element.returnValues)
    })

    it('should add a path with width and no fill for a stroke', function() {
      var stroke = {type: 'stroke', path: [], width: 0.006}

      p.write(stroke)
      expect(element).to.be.calledWith('path', {
        d: '',
        fill: 'none',
        'stroke-width': 6,
      })
      expect(p.layer).to.eql(element.returnValues)
    })

    it('should know how to add line segments', function() {
      var path = [
        {type: 'line', start: [0, 0], end: [0.1, 0]},
        {type: 'line', start: [0.1, 0], end: [0.1, 0.1]},
        {type: 'line', start: [0.1, 0.1], end: [0, 0.1]},
        {type: 'line', start: [0, 0.1], end: [0, 0]},
      ]
      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expected = {
        d: 'M 0 0 100 0 100 100 0 100 0 0',
        fill: 'none',
        'stroke-width': 6,
      }

      p.write(stroke)
      expect(element).to.be.calledWith('path', expected)
      expect(p.layer).to.eql(element.returnValues)
    })

    it('should know when to add movetos', function() {
      var path = [
        {type: 'line', start: [0, 0], end: [0.1, 0.1]},
        {type: 'line', start: [0.2, 0.2], end: [0.3, 0.3]},
        {type: 'line', start: [0.4, 0.4], end: [0.5, 0.5]},
      ]
      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expected = {
        d: 'M 0 0 100 100 M 200 200 300 300 M 400 400 500 500',
        fill: 'none',
        'stroke-width': 6,
      }

      p.write(stroke)
      expect(element).to.be.calledWith('path', expected)
      expect(p.layer).to.eql(element.returnValues)
    })

    it('should know how to add arcs', function() {
      var path = [
        {
          type: 'arc',
          start: [0.1, 0, 0],
          end: [0, 0.1, HALF_PI],
          center: [0, 0],
          sweep: HALF_PI,
          radius: 0.1,
          dir: 'ccw',
        },
        {
          type: 'arc',
          start: [0, 0.1, HALF_PI],
          end: [0.1, 0, 0],
          center: [0, 0],
          sweep: 3 * HALF_PI,
          radius: 0.1,
          dir: 'ccw',
        },
        {
          type: 'arc',
          start: [1.1, 0, 0],
          end: [1, 0.1, HALF_PI],
          center: [1, 0],
          sweep: 3 * HALF_PI,
          radius: 0.1,
          dir: 'cw',
        },
        {
          type: 'arc',
          start: [1, 0.1, HALF_PI],
          end: [1.1, 0, 0],
          center: [1, 0],
          sweep: HALF_PI,
          radius: 0.1,
          dir: 'cw',
        },
      ]

      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expectedData = [
        'M 100 0 A 100 100 0 0 1 0 100 100 100 0 1 1 100 0',
        'M 1100 0 A 100 100 0 1 0 1000 100 100 100 0 0 0 1100 0',
      ].join(' ')

      var expected = {d: expectedData, fill: 'none', 'stroke-width': 6}

      p.write(stroke)
      expect(element).to.be.calledWith('path', expected)
      expect(p.layer).to.eql(element.returnValues)
    })

    it('should add zero-length arcs as linetos', function() {
      var path = [
        {
          type: 'arc',
          start: [0, 0, 0],
          end: [0, 0, 0],
          center: [-1, 0],
          sweep: 0,
          radius: 1,
          dir: 'ccw',
        },
      ]

      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expected = {d: 'M 0 0 0 0', fill: 'none', 'stroke-width': 6}

      p.write(stroke)
      expect(element).to.be.calledWith('path', expected)
      expect(p.layer).to.eql(element.returnValues)
    })

    it('should add full circle arcs as two arcs', function() {
      var path = [
        {
          type: 'arc',
          start: [0, 0, 0],
          end: [0, 0, 0],
          center: [-0.1, 0],
          sweep: 2 * Math.PI,
          radius: 0.1,
          dir: 'ccw',
        },
      ]

      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expected = {
        d: 'M 0 0 A 100 100 0 0 1 -200 0 100 100 0 0 1 0 0',
        fill: 'none',
        'stroke-width': 6,
      }

      p.write(stroke)
      expect(element).to.be.calledWith('path', expected)
      expect(p.layer).to.eql(element.returnValues)
    })

    it('should only add explicit linetos as needed', function() {
      var path = [
        {
          type: 'arc',
          start: [0.1, 0, 0],
          end: [-0.1, 0, Math.PI],
          center: [0, 0],
          sweep: Math.PI,
          radius: 0.1,
          dir: 'ccw',
        },
        {type: 'line', start: [-0.1, 0], end: [0, 0]},
      ]

      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expected = {
        d: 'M 100 0 A 100 100 0 0 1 -100 0 L 0 0',
        fill: 'none',
        'stroke-width': 6,
      }

      p.write(stroke)
      expect(element).to.be.calledWith('path', expected)
      expect(p.layer).to.eql(element.returnValues)
    })
  })

  describe('polarity changes', function() {
    it('should wrap the layer in a masked group when polarity becomes clear', function() {
      var existing = ['<path d="M 0 0 1 0 1 1 0 1 0 0"/>']
      var polarity = {type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]}

      p.layer = existing.slice(0)
      p.write(polarity)
      expect(element).to.be.calledWith(
        'g',
        {mask: 'url(#id_clear-1)'},
        existing
      )
      expect(p.layer).to.eql(element.returnValues)
    })

    it('should construct a mask and add to defs when polarity switches back', function() {
      var clear = {type: 'polarity', polarity: 'clear', box: [0, 0, 0.5, 0.5]}
      var clearPad = {type: 'pad', tool: '10', x: 0.005, y: 0.005}
      var dark = {type: 'polarity', polarity: 'dark', box: [0, 0, 0.5, 0.5]}
      var darkPad = {type: 'pad', tool: '11', x: 0.005, y: 0.005}

      p.write(clear)
      p.write(clearPad)
      p.write(dark)
      p.write(darkPad)

      var values = element.returnValues
      var expected = [
        {mask: 'url(#id_clear-1)'},
        {'xlink:href': '#id_pad-10', x: 5, y: 5},
        {x: 0, y: 0, width: 500, height: 500, fill: '#fff'},
        {},
        {id: 'id_clear-1', fill: '#000', stroke: '#000'},
        {'xlink:href': '#id_pad-11', x: 5, y: 5},
      ]

      expect(element).to.be.calledWith('g', expected[0], [])
      expect(element).to.be.calledWith('use', expected[1])
      expect(element).to.be.calledWith('rect', expected[2])
      expect(element).to.be.calledWith('g', expected[3], [values[2], values[1]])
      expect(element).to.be.calledWith('mask', expected[4], [values[3]])
      expect(element).to.be.calledWith('use', expected[5])
      expect(p._mask).to.eql([])
      expect(p.defs).to.eql([values[4]])
      expect(p.layer).to.eql([values[0], values[5]])
    })

    it('should not do anything with dark polarity if there is no mask', function() {
      var dark = {type: 'polarity', polarity: 'dark', box: [0, 0, 1, 1]}

      p.write(dark)
      expect(element).to.have.callCount(0)
      expect(p._mask).to.eql([])
      expect(p.defs).to.eql([])
      expect(p.layer).to.eql([])
    })
  })

  describe('block repeats', function() {
    it('if only one layer, it should wrap the current layer and repeat it', function() {
      var offsets = [[0, 0], [0, 1], [1, 0], [1, 1]]
      var expected = [
        {'xlink:href': '#id_pad-10', x: 250, y: 250},
        {id: 'id_block-1-1'},
        {'xlink:href': '#id_block-1-1', x: 0, y: 0},
        {'xlink:href': '#id_block-1-1', x: 0, y: 1000},
        {'xlink:href': '#id_block-1-1', x: 1000, y: 0},
        {'xlink:href': '#id_block-1-1', x: 1000, y: 1000},
      ]

      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 0.5, 0.5]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.write({type: 'repeat', offsets: [], box: [0, 0, 1.5, 1.5]})
      expect(element).to.be.calledWith('use', expected[0])
      expect(element).to.be.calledWith('g', expected[1], [
        element.returnValues[0],
      ])
      expect(element).to.be.calledWith('use', expected[2])
      expect(element).to.be.calledWith('use', expected[3])
      expect(element).to.be.calledWith('use', expected[4])
      expect(element).to.be.calledWith('use', expected[5])
      expect(p.defs).to.eql([element.returnValues[1]])
      expect(p.layer).to.eql(element.returnValues.slice(2, 6))
    })

    it('should allow several layers in a block', function() {
      var offsets = [[0, 0], [0, 5], [5, 0], [5, 5]]

      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 0.5, 0.5]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.write({type: 'polarity', polarity: 'clear', box: [0, 0, 0.5, 0.5]})
      p.write({type: 'pad', tool: '11', x: 0.5, y: 0.5})
      p.write({type: 'polarity', polarity: 'dark', box: [0, 0, 0.75, 0.75]})
      p.write({type: 'pad', tool: '12', x: 0.75, y: 0.75})
      p.write({type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]})
      p.write({type: 'pad', tool: '13', x: 1, y: 1})
      p.write({type: 'polarity', polarity: 'dark', box: [0, 0, 1.25, 1.25]})
      p.write({type: 'pad', tool: '14', x: 1.25, y: 1.25})
      p.write({type: 'repeat', offsets: [], box: [0, 0, 1.5, 1.5]})

      var values = element.returnValues
      var expected = [
        {'xlink:href': '#id_pad-10', x: 250, y: 250},
        {id: 'id_block-1-1'},
        {'xlink:href': '#id_pad-11', x: 500, y: 500},
        {id: 'id_block-1-2'},
        {'xlink:href': '#id_pad-12', x: 750, y: 750},
        {id: 'id_block-1-3'},
        {'xlink:href': '#id_pad-13', x: 1000, y: 1000},
        {id: 'id_block-1-4'},
        {'xlink:href': '#id_pad-14', x: 1250, y: 1250},
        {id: 'id_block-1-5'},
        {'xlink:href': '#id_block-1-1', x: 0, y: 0},
        {'xlink:href': '#id_block-1-3', x: 0, y: 0},
        {'xlink:href': '#id_block-1-5', x: 0, y: 0},
        {'xlink:href': '#id_block-1-1', x: 0, y: 5000},
        {'xlink:href': '#id_block-1-3', x: 0, y: 5000},
        {'xlink:href': '#id_block-1-5', x: 0, y: 5000},
        {'xlink:href': '#id_block-1-1', x: 5000, y: 0},
        {'xlink:href': '#id_block-1-3', x: 5000, y: 0},
        {'xlink:href': '#id_block-1-5', x: 5000, y: 0},
        {'xlink:href': '#id_block-1-1', x: 5000, y: 5000},
        {'xlink:href': '#id_block-1-3', x: 5000, y: 5000},
        {'xlink:href': '#id_block-1-5', x: 5000, y: 5000},
        {mask: 'url(#id_block-1-clear)'},
        {
          'xlink:href': '#id_block-1-1',
          x: 0,
          y: 0,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-2', x: 0, y: 0},
        {
          'xlink:href': '#id_block-1-3',
          x: 0,
          y: 0,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-4', x: 0, y: 0},
        {
          'xlink:href': '#id_block-1-5',
          x: 0,
          y: 0,
          fill: '#fff',
          stroke: '#fff',
        },
        {
          'xlink:href': '#id_block-1-1',
          x: 0,
          y: 5000,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-2', x: 0, y: 5000},
        {
          'xlink:href': '#id_block-1-3',
          x: 0,
          y: 5000,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-4', x: 0, y: 5000},
        {
          'xlink:href': '#id_block-1-5',
          x: 0,
          y: 5000,
          fill: '#fff',
          stroke: '#fff',
        },
        {
          'xlink:href': '#id_block-1-1',
          x: 5000,
          y: 0,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-2', x: 5000, y: 0},
        {
          'xlink:href': '#id_block-1-3',
          x: 5000,
          y: 0,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-4', x: 5000, y: 0},
        {
          'xlink:href': '#id_block-1-5',
          x: 5000,
          y: 0,
          fill: '#fff',
          stroke: '#fff',
        },
        {
          'xlink:href': '#id_block-1-1',
          x: 5000,
          y: 5000,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-2', x: 5000, y: 5000},
        {
          'xlink:href': '#id_block-1-3',
          x: 5000,
          y: 5000,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-4', x: 5000, y: 5000},
        {
          'xlink:href': '#id_block-1-5',
          x: 5000,
          y: 5000,
          fill: '#fff',
          stroke: '#fff',
        },
        {x: 0, y: 0, width: 500, height: 500, fill: '#fff'},
        {},
        {id: 'id_block-1-clear', fill: '#000', stroke: '#000'},
      ]

      expect(element).to.be.calledWith('use', expected[0])
      expect(element).to.be.calledWith('g', expected[1], [values[0]])
      expect(element).to.be.calledWith('use', expected[2])
      expect(element).to.be.calledWith('g', expected[3], [values[2]])
      expect(element).to.be.calledWith('use', expected[4])
      expect(element).to.be.calledWith('g', expected[5], [values[4]])
      expect(element).to.be.calledWith('use', expected[6])
      expect(element).to.be.calledWith('g', expected[7], [values[6]])
      expect(element).to.be.calledWith('use', expected[8])
      expect(element).to.be.calledWith('g', expected[9], [values[8]])
      expect(element).to.be.calledWith('use', expected[10])
      expect(element).to.be.calledWith('use', expected[11])
      expect(element).to.be.calledWith('use', expected[12])
      expect(element).to.be.calledWith('use', expected[13])
      expect(element).to.be.calledWith('use', expected[14])
      expect(element).to.be.calledWith('use', expected[15])
      expect(element).to.be.calledWith('use', expected[16])
      expect(element).to.be.calledWith('use', expected[17])
      expect(element).to.be.calledWith('use', expected[18])
      expect(element).to.be.calledWith('use', expected[19])
      expect(element).to.be.calledWith('use', expected[20])
      expect(element).to.be.calledWith('use', expected[21])
      expect(element).to.be.calledWith('g', expected[22], values.slice(10, 22))
      expect(element).to.be.calledWith('use', expected[23])
      expect(element).to.be.calledWith('use', expected[24])
      expect(element).to.be.calledWith('use', expected[25])
      expect(element).to.be.calledWith('use', expected[26])
      expect(element).to.be.calledWith('use', expected[27])
      expect(element).to.be.calledWith('use', expected[28])
      expect(element).to.be.calledWith('use', expected[29])
      expect(element).to.be.calledWith('use', expected[30])
      expect(element).to.be.calledWith('use', expected[31])
      expect(element).to.be.calledWith('use', expected[32])
      expect(element).to.be.calledWith('use', expected[33])
      expect(element).to.be.calledWith('use', expected[34])
      expect(element).to.be.calledWith('use', expected[35])
      expect(element).to.be.calledWith('use', expected[36])
      expect(element).to.be.calledWith('use', expected[37])
      expect(element).to.be.calledWith('use', expected[38])
      expect(element).to.be.calledWith('use', expected[39])
      expect(element).to.be.calledWith('use', expected[40])
      expect(element).to.be.calledWith('use', expected[41])
      expect(element).to.be.calledWith('use', expected[42])
      expect(element).to.be.calledWith('rect', expected[43])
      expect(element).to.be.calledWith(
        'g',
        expected[44],
        [values[43]].concat(values.slice(23, 43))
      )
      expect(element).to.be.calledWith('mask', expected[45], [values[44]])

      expect(p.defs).to.eql([
        values[1],
        values[3],
        values[5],
        values[7],
        values[9],
        values[45],
      ])

      expect(p.layer).to.eql([values[22]])
    })

    it('should handle step repeats that start with clear', function() {
      var offsets = [[0, 0], [0, 0.5], [0.5, 0], [0.5, 0.5]]

      p.layer = ['LAYER']
      p.write({type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]})
      p._mask = ['MASK']
      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 1, 1]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.write({type: 'polarity', polarity: 'dark', box: [0, 0, 1, 1]})
      p.write({type: 'pad', tool: '11', x: 0.25, y: 0.25})
      p.write({type: 'repeat', offsets: [], box: [0, 0, 1.5, 1.5]})

      var values = element.returnValues
      var expected = [
        {mask: 'url(#id_block-1-clear)'},
        {x: 0, y: 0, width: 1000, height: 1000, fill: '#fff'},
        {},
        {id: 'id_clear-1', fill: '#000', stroke: '#000'},
        {'xlink:href': '#id_pad-10', x: 250, y: 250},
        {id: 'id_block-1-1'},
        {'xlink:href': '#id_pad-11', x: 250, y: 250},
        {id: 'id_block-1-2'},
        {'xlink:href': '#id_block-1-2', x: 0, y: 0},
        {'xlink:href': '#id_block-1-2', x: 0, y: 500},
        {'xlink:href': '#id_block-1-2', x: 500, y: 0},
        {'xlink:href': '#id_block-1-2', x: 500, y: 500},
        {mask: 'url(#id_block-1-clear)'},
        {'xlink:href': '#id_block-1-1', x: 0, y: 0},
        {
          'xlink:href': '#id_block-1-2',
          x: 0,
          y: 0,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-1', x: 0, y: 500},
        {
          'xlink:href': '#id_block-1-2',
          x: 0,
          y: 500,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-1', x: 500, y: 0},
        {
          'xlink:href': '#id_block-1-2',
          x: 500,
          y: 0,
          fill: '#fff',
          stroke: '#fff',
        },
        {'xlink:href': '#id_block-1-1', x: 500, y: 500},
        {
          'xlink:href': '#id_block-1-2',
          x: 500,
          y: 500,
          fill: '#fff',
          stroke: '#fff',
        },
        {x: 0, y: 0, width: 1000, height: 1000, fill: '#fff'},
        {},
        {id: 'id_block-1-clear', fill: '#000', stroke: '#000'},
      ]

      expect(element).to.be.calledWith('g', expected[0])
      expect(element).to.be.calledWith('rect', expected[1])
      expect(element).to.be.calledWith('g', expected[2], [values[1], 'MASK'])
      expect(element).to.be.calledWith('mask', expected[3], [values[2]])
      expect(element).to.be.calledWith('use', expected[4])
      expect(element).to.be.calledWith('g', expected[5], [values[4]])
      expect(element).to.be.calledWith('use', expected[6])
      expect(element).to.be.calledWith('g', expected[7], [values[6]])
      expect(element).to.be.calledWith('use', expected[8])
      expect(element).to.be.calledWith('use', expected[9])
      expect(element).to.be.calledWith('use', expected[10])
      expect(element).to.be.calledWith('use', expected[11])
      expect(element).to.be.calledWith(
        'g',
        expected[12],
        [values[0]].concat(values.slice(8, 12))
      )
      expect(element).to.be.calledWith('use', expected[13])
      expect(element).to.be.calledWith('use', expected[14])
      expect(element).to.be.calledWith('use', expected[15])
      expect(element).to.be.calledWith('use', expected[16])
      expect(element).to.be.calledWith('use', expected[17])
      expect(element).to.be.calledWith('use', expected[18])
      expect(element).to.be.calledWith('use', expected[19])
      expect(element).to.be.calledWith('use', expected[20])
      expect(element).to.be.calledWith('rect', expected[21])
      expect(element).to.be.calledWith(
        'g',
        expected[22],
        [values[21]].concat(values.slice(13, 21))
      )
      expect(element).to.be.calledWith('mask', expected[23], [values[22]])

      expect(p.defs).to.eql([values[3], values[5], values[7], values[23]])
      expect(p.layer).to.eql([values[12]])
    })

    it('should handle step repeats that start with dark then change to clear', function() {
      var offsets = [[0, 0], [0, 0.5], [0.5, 0], [0.5, 0.5]]

      p.layer = ['SOME_EXISTING_STUFF']
      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 1, 1]})
      p.write({type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.write({type: 'repeat', offsets: [], box: [0, 0, 1.5, 1.5]})

      var values = element.returnValues
      var expected = [
        {'xlink:href': '#id_pad-10', x: 250, y: 250},
        {id: 'id_block-1-1'},
        {mask: 'url(#id_block-1-clear)'},
        {'xlink:href': '#id_block-1-1', x: 0, y: 0},
        {'xlink:href': '#id_block-1-1', x: 0, y: 500},
        {'xlink:href': '#id_block-1-1', x: 500, y: 0},
        {'xlink:href': '#id_block-1-1', x: 500, y: 500},
        {x: 0, y: 0, width: 1000, height: 1000, fill: '#fff'},
        {},
        {id: 'id_block-1-clear', fill: '#000', stroke: '#000'},
      ]

      expect(element).to.be.calledWith('use', expected[0])
      expect(element).to.be.calledWith('g', expected[1], [values[0]])
      expect(element).to.be.calledWith('g', expected[2], [
        'SOME_EXISTING_STUFF',
      ])
      expect(element).to.be.calledWith('use', expected[3])
      expect(element).to.be.calledWith('use', expected[4])
      expect(element).to.be.calledWith('use', expected[5])
      expect(element).to.be.calledWith('use', expected[6])
      expect(element).to.be.calledWith('rect', expected[7])
      expect(element).to.be.calledWith(
        'g',
        expected[8],
        [values[7]].concat(values.slice(3, 7))
      )
      expect(element).to.be.calledWith('mask', expected[9], [values[8]])
      expect(p.defs).to.eql([values[1], values[9]])
      expect(p.layer).to.eql([values[2]])
    })

    it('should handle polarity switches with no objects gracefully', function() {
      var offsets = [[0, 0], [0, 0.5], [0.5, 0], [0.5, 0.5]]

      p.layer = ['SOME_EXISTING_STUFF']
      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 1, 1]})
      p.write({type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]})
      p.write({type: 'polarity', polarity: 'dark', box: [0, 0, 1, 1]})
      p.write({type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]})
      p.write({type: 'polarity', polarity: 'dark', box: [0, 0, 1, 1]})

      expect(element).to.have.callCount(0)
    })

    it('should handle Infinities in the box', function() {
      var offsets = [[0, 0], [0, 0.5], [0.5, 0], [0.5, 0.5]]

      p.layer = ['SOME_EXISTING_STUFF']
      p.write({type: 'repeat', offsets: offsets, box: EMPTY_BOX})
      expect(p._blockBox).to.eql([0, 0, 0, 0])
    })
  })

  describe('end of stream', function() {
    it('should create a viewbox from a size object', function() {
      var size = {type: 'size', box: [-1, -1, 1, 2], units: 'mm'}

      p.write(size)
      expect(p.viewBox).to.eql([-1000, -1000, 2000, 3000])
      expect(p.width).to.equal(2)
      expect(p.height).to.equal(3)
      expect(p.units).to.equal('mm')
    })

    it('should contruct an svg from the layer and defs', function(done) {
      var size = {type: 'size', box: [-1, -1, 1, 2], units: 'mm'}
      var viewBox = '-1000 -1000 2000 3000'
      var transform = 'translate(0,1000) scale(1,-1)'
      var svgAttr = assign({}, SVG_ATTR, {
        width: '2mm',
        height: '3mm',
        viewBox: viewBox,
      })
      var layerAttr = {
        transform: transform,
        fill: 'currentColor',
        stroke: 'currentColor',
      }

      p.on('data', function(result) {
        expect(element).to.be.calledWith('defs', {}, ['THESE_ARE_THE_DEFS'])
        expect(element).to.be.calledWith('g', layerAttr, ['THIS_IS_THE_LAYER'])
        expect(element).to.be.calledWith(
          'svg',
          svgAttr,
          element.returnValues.slice(0, 2)
        )
        expect(result).to.equal(element.returnValues[2])
        done()
      })

      p.defs = ['THESE_ARE_THE_DEFS']
      p.layer = ['THIS_IS_THE_LAYER']
      p.write(size)
      p.end()
    })

    it('should omit the defs mode if it is empty', function(done) {
      var size = {type: 'size', box: [-1, -1, 1, 2], units: 'mm'}

      p.on('data', function() {
        expect(element).not.to.be.calledWith('defs')
        done()
      })

      p.defs = []
      p.layer = ['THIS_IS_THE_LAYER']
      p.write(size)
      p.end()
    })

    it('should finish any in-progress mask', function() {
      p._maskId = 'id_clear-1'
      p._maskBox = [1, 2, 3, 4]
      p._mask = ['SOME STUFF']
      p.end()

      expect(element).to.be.calledWith('mask', {
        id: 'id_clear-1',
        fill: '#000',
        stroke: '#000',
      })
    })

    it('should finish any in-progress repeat', function() {
      var offsets = [[0, 0], [0, 1], [1, 0], [1, 1]]

      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 0.5, 0.5]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.end()

      expect(element).to.be.calledWith('use', {
        'xlink:href': '#id_block-1-1',
        x: 0,
        y: 0,
      })
      expect(element).to.be.calledWith('use', {
        'xlink:href': '#id_block-1-1',
        x: 0,
        y: 1000,
      })
      expect(element).to.be.calledWith('use', {
        'xlink:href': '#id_block-1-1',
        x: 1000,
        y: 0,
      })
      expect(element).to.be.calledWith('use', {
        'xlink:href': '#id_block-1-1',
        x: 1000,
        y: 1000,
      })
    })
  })
})
