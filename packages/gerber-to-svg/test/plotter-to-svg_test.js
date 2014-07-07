// test suite for the plotter to svg transform stream
'use strict'

var expect = require('chai').expect

var PlotterToSvg = require('../lib/plotter-to-svg')

var HALF_PI = Math.PI / 2
var EMPTY_SVG = [
  '<svg id="id" ',
  'xmlns="http://www.w3.org/2000/svg" ',
  'version="1.1" ',
  'xmlns:xlink="http://www.w3.org/1999/xlink" ',
  'stroke-linecap="round" ',
  'stroke-linejoin="round" ',
  'stroke-width="0" ',
  'fill-rule="evenodd" ',
  'width="0" ',
  'height="0" ',
  'viewBox="0 0 0 0">',
  '</svg>'].join('')

describe('plotter to svg transform stream', function() {
  var p
  beforeEach(function() {
    p = new PlotterToSvg('id')
    p.setEncoding('utf8')
  })

  it('should emit an empty svg if it gets a zero size plot', function(done) {
    p.once('data', function(result) {
      expect(result).to.equal(EMPTY_SVG)
      expect(p.viewBox).to.eql([0, 0, 0, 0])
      expect(p.width).to.equal(0)
      expect(p.height).to.equal(0)
      expect(p.units).to.equal('')
      done()
    })

    p.write({type: 'size', box: [Infinity, Infinity, -Infinity, -Infinity], units: ''})
    p.end()
  })

  it('should be able to add an id', function(done) {
    p = new PlotterToSvg('foo')
    p.once('data', function(result) {
      expect(result).to.match(/id="foo"/)
      done()
    })

    p.write({type: 'size', box: [Infinity, Infinity, -Infinity, -Infinity], units: ''})
    p.end()
  })

  it('should be able to add a classname', function(done) {
    p = new PlotterToSvg('foo', 'bar')
    p.once('data', function(result) {
      expect(result).to.match(/class="bar"/)
      done()
    })

    p.write({type: 'size', box: [Infinity, Infinity, -Infinity, -Infinity], units: ''})
    p.end()
  })

  it('should be able to add a color', function(done) {
    p = new PlotterToSvg('foo', 'bar', 'baz')
    p.setEncoding('utf8')
    p.once('data', function(result) {
      expect(result).to.match(/color="baz"/)
      done()
    })

    p.write({type: 'size', box: [Infinity, Infinity, -Infinity, -Infinity], units: ''})
    p.end()
  })

  describe('creating pad shapes', function() {
    it('should handle circle primitives', function() {
      var toolShape = [{type: 'circle', cx: 0.001, cy: 0.002, r: 0.005}]
      var expected = '<circle id="id_pad-10" cx="1" cy="2" r="5"/>'

      p.write({type: 'shape', tool: '10', shape: toolShape})
      expect(p.defs).to.equal(expected)
    })

    it('should handle rect primitives', function() {
      var toolShape = [
        {type: 'rect', cx: 0.002, cy: 0.004, width: 0.002, height: 0.004, r: 0.002}
      ]
      var expected = '<rect id="id_pad-10" x="1" y="2" rx="2" ry="2" width="2" height="4"/>'

      p.write({type: 'shape', tool: '10', shape: toolShape})
      expect(p.defs).to.equal(expected)
    })

    it('should handle polygon primitives', function() {
      var toolShape = [{type: 'poly', points: [[0, 0], [1, 0], [0, 1]]}]
      var expected = '<polygon id="id_pad-12" points="0,0 1000,0 0,1000"/>'

      p.write({type: 'shape', tool: '12', shape: toolShape})
      expect(p.defs).to.equal(expected)
    })

    it('should handle a ring primitives', function() {
      var toolShape = [{type: 'ring', r: 0.02, width: 0.005, cx: 0.05, cy: -0.03}]
      var expected = '<circle id="id_pad-11" cx="50" cy="-30" r="20" '
      expected += 'stroke-width="5" fill="none"/>'

      p.write({type: 'shape', tool: '11', shape: toolShape})
      expect(p.defs).to.equal(expected)
    })

    it('should handle a clipped primitive with rects', function() {
      var clippedShapes = [
        {type: 'rect', cx: 0.003, cy: 0.003, width: 0.004, height: 0.004, r: 0},
        {type: 'rect', cx: -0.003, cy: 0.003, width: 0.004, height: 0.004, r: 0},
        {type: 'rect', cx: -0.003, cy: -0.003, width: 0.004, height: 0.004, r: 0},
        {type: 'rect', cx: 0.003, cy: -0.003, width: 0.004, height: 0.004, r: 0}
      ]
      var ring = {type: 'ring', r: 0.004, width: 0.002, cx: 0, cy: 0}
      var toolShape = [{type: 'clip', shape: clippedShapes, clip: ring}]

      var expected = [
        '<mask id="id_pad-15_mask" stroke="#fff">',
        '<circle cx="0" cy="0" r="4" stroke-width="2" fill="none"/>',
        '</mask>',
        '<g id="id_pad-15" mask="url(#id_pad-15_mask)">',
        '<rect x="1" y="1" width="4" height="4"/>',
        '<rect x="-5" y="1" width="4" height="4"/>',
        '<rect x="-5" y="-5" width="4" height="4"/>',
        '<rect x="1" y="-5" width="4" height="4"/>',
        '</g>'
      ].join('')

      p.write({type: 'shape', tool: '15', shape: toolShape})
      expect(p.defs).to.equal(expected)
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
        {type: 'poly', points: [[po, ne], [mP, ne], [mP, mN], [po, mN]]}
      ]
      var ring = {type: 'ring', r: 0.004, width: 0.002, cx: 0, cy: 0}
      var toolShape = [{type: 'clip', shape: clippedShapes, clip: ring}]

      var expected = [
        '<mask id="id_pad-15_mask" stroke="#fff">',
        '<circle cx="0" cy="0" r="4" stroke-width="2" fill="none"/>',
        '</mask>',
        '<g id="id_pad-15" mask="url(#id_pad-15_mask)">',
        '<polygon points="1,1 5,1 5,5 1,5"/>',
        '<polygon points="-5,1 -1,1 -1,5 -5,5"/>',
        '<polygon points="-5,-5 -1,-5 -1,-1 -5,-1"/>',
        '<polygon points="1,-5 5,-5 5,-1 1,-1"/>',
        '</g>'
      ].join('')

      p.write({type: 'shape', tool: '15', shape: toolShape})
      expect(p.defs).to.equal(expected)
    })

    it('should handle multiple primitives', function() {
      var toolShape = [
        {type: 'rect', cx: 0.003, cy: 0.003, width: 0.004, height: 0.004, r: 0},
        {type: 'rect', cx: -0.003, cy: 0.003, width: 0.004, height: 0.004, r: 0},
        {type: 'rect', cx: -0.003, cy: -0.003, width: 0.004, height: 0.004, r: 0},
        {type: 'rect', cx: 0.003, cy: -0.003, width: 0.004, height: 0.004, r: 0}
      ]

      var expected = [
        '<g id="id_pad-20">',
        '<rect x="1" y="1" width="4" height="4"/>',
        '<rect x="-5" y="1" width="4" height="4"/>',
        '<rect x="-5" y="-5" width="4" height="4"/>',
        '<rect x="1" y="-5" width="4" height="4"/>',
        '</g>'
      ].join('')

      p.write({type: 'shape', tool: '20', shape: toolShape})
      expect(p.defs).to.equal(expected)
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
        {type: 'circle', cx: 0, cy: 0, r: 0.002}
      ]

      var expected = [
        '<mask id="id_pad-11_1" fill="#000" stroke="#000">',
        '<rect x="-3" y="1" width="6" height="8" fill="#fff"/>',
        '<rect x="-2" y="3" width="4" height="4"/>',
        '</mask>',
        '<mask id="id_pad-11_3" fill="#000" stroke="#000">',
        '<rect x="-4" y="-9" width="8" height="13" fill="#fff"/>',
        '<rect x="-2" y="-7" width="4" height="4"/>',
        '<circle cx="0" cy="0" r="2"/>',
        '</mask>',
        '<g id="id_pad-11">',
        '<g mask="url(#id_pad-11_3)">',
        '<g mask="url(#id_pad-11_1)">',
        '<rect x="-3" y="1" width="6" height="8"/>',
        '</g>',
        '<rect x="-3" y="-9" width="6" height="8"/>',
        '<circle cx="0" cy="0" r="4"/>',
        '</g>',
        '</g>'
      ].join('')

      p.write({type: 'shape', tool: '11', shape: toolShape})
      expect(p.defs).to.equal(expected)
    })
  })

  it('should be able to add a pad to the layer', function() {
    var pad = {type: 'pad', tool: '24', x: 0.020, y: 0.050}
    var expected = '<use xlink:href="#id_pad-24" x="20" y="50"/>'

    p.write(pad)
    expect(p.layer).to.equal(expected)
  })

  describe('fills and strokes', function() {
    it('should add a path to the layer for a fill', function() {
      var fill = {type: 'fill', path: []}
      var expected = '<path d=""/>'

      p.write(fill)
      expect(p.layer).to.equal(expected)
    })

    it('should add a path with width and no fill for a stroke', function() {
      var stroke = {type: 'stroke', path: [], width: 0.006}
      var expected = '<path d="" fill="none" stroke-width="6"/>'

      p.write(stroke)
      expect(p.layer).to.equal(expected)
    })

    it('should know how to add line segments', function() {
      var path = [
        {type: 'line', start: [0, 0], end: [0.1, 0]},
        {type: 'line', start: [0.1, 0], end: [0.1, 0.1]},
        {type: 'line', start: [0.1, 0.1], end: [0, 0.1]},
        {type: 'line', start: [0, 0.1], end: [0, 0]}
      ]
      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expectedData = 'd="M 0 0 100 0 100 100 0 100 0 0"'

      p.write(stroke)
      expect(p.layer).to.include(expectedData)
    })

    it('should know when to add movetos', function() {
      var path = [
        {type: 'line', start: [0, 0], end: [0.1, 0.1]},
        {type: 'line', start: [0.2, 0.2], end: [0.3, 0.3]},
        {type: 'line', start: [0.4, 0.4], end: [0.5, 0.5]}
      ]
      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expectedData = 'd="M 0 0 100 100 M 200 200 300 300 M 400 400 500 500"'

      p.write(stroke)
      expect(p.layer).to.include(expectedData)
    })

    it('should know how to add arcs', function() {
      var path = [
        {
          type: 'arc',
          start: [0.1, 0, 0], end: [0, 0.1, HALF_PI], center: [0, 0],
          sweep: HALF_PI, radius: 0.1, dir: 'ccw'
        },
        {
          type: 'arc',
          start: [0, 0.1, HALF_PI], end: [0.1, 0, 0], center: [0, 0],
          sweep: 3 * HALF_PI, radius: 0.1, dir: 'ccw'
        },
        {
          type: 'arc',
          start: [1.1, 0, 0], end: [1, 0.1, HALF_PI], center: [1, 0],
          sweep: 3 * HALF_PI, radius: 0.1, dir: 'cw'
        },
        {
          type: 'arc',
          start: [1, 0.1, HALF_PI], end: [1.1, 0, 0], center: [1, 0],
          sweep: HALF_PI, radius: 0.1, dir: 'cw'
        }
      ]

      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expectedData = 'd="M 100 0 A 100 100 0 0 1 0 100 100 100 0 1 1 100 0 '
      expectedData += 'M 1100 0 A 100 100 0 1 0 1000 100 100 100 0 0 0 1100 0'

      p.write(stroke)
      expect(p.layer).to.include(expectedData)
    })

    it('should add zero-length arcs as linetos', function() {
      var path = [{
        type: 'arc',
        start: [0, 0, 0], end: [0, 0, 0], center: [-1, 0],
        sweep: 0, radius: 1, dir: 'ccw'
      }]

      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expectedData = 'd="M 0 0 0 0"'

      p.write(stroke)
      expect(p.layer).to.include(expectedData)
    })

    it('should add full circle arcs as two arcs', function() {
      var path = [{
        type: 'arc',
        start: [0, 0, 0], end: [0, 0, 0], center: [-0.1, 0],
        sweep: 2 * Math.PI, radius: 0.1, dir: 'ccw'
      }]

      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expectedData = 'd="M 0 0 A 100 100 0 0 1 -200 0 100 100 0 0 1 0 0"'

      p.write(stroke)
      expect(p.layer).to.include(expectedData)
    })

    it('should only add explicit linetos as needed', function() {
      var path = [
        {
          type: 'arc',
          start: [0.1, 0, 0], end: [-0.1, 0, Math.PI], center: [0, 0],
          sweep: Math.PI, radius: 0.1, dir: 'ccw'
        },
        {type: 'line', start: [-0.1, 0], end: [0, 0]}
      ]

      var stroke = {type: 'stroke', width: 0.006, path: path}
      var expectedData = 'd="M 100 0 A 100 100 0 0 1 -100 0 L 0 0"'

      p.write(stroke)
      expect(p.layer).to.include(expectedData)
    })
  })

  describe('polarity changes', function() {
    it('should wrap the layer in a masked group when polarity becomes clear', function() {
      p.layer = '<path d="M 0 0 1 0 1 1 0 1 0 0"/>'
      var polarity = {type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]}
      var expected = '<g mask="url(#id_clear-1)"><path d="M 0 0 1 0 1 1 0 1 0 0"/></g>'

      p.write(polarity)
      expect(p.layer).to.equal(expected)
    })

    it('should start a mask when polarity becomes clear', function() {
      var polarity = {type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]}
      var expected = '<mask id="id_clear-1" fill="#000" stroke="#000">'
      expected += '<rect x="0" y="0" width="1000" height="1000" fill="#fff"/>'

      p.write(polarity)
      expect(p._mask).to.equal(expected)
    })

    it('should write new shapes to the mask when polarity is clear', function() {
      var polarity = {type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]}
      var pad = {type: 'pad', tool: '10', x: 0.005, y: 0.005}
      var expected = '<mask id="id_clear-1" fill="#000" stroke="#000">'
      expected += '<rect x="0" y="0" width="1000" height="1000" fill="#fff"/>'
      expected += '<use xlink:href="#id_pad-10" x="5" y="5"/>'

      p.write(polarity)
      p.write(pad)
      expect(p.layer).to.equal('<g mask="url(#id_clear-1)"></g>')
      expect(p._mask).to.equal(expected)
    })

    it('should finish the mask and add to defs when polarity switches back', function() {
      var clear = {type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]}
      var dark = {type: 'polarity', polarity: 'dark', box: [0, 0, 1, 1]}
      var pad = {type: 'pad', tool: '10', x: 0.005, y: 0.005}
      var expectedDefs = '<mask id="id_clear-1" fill="#000" stroke="#000">'
      expectedDefs += '<rect x="0" y="0" width="1000" height="1000" fill="#fff"/></mask>'
      var expectedLayer = '<g mask="url(#id_clear-1)"></g>'
      expectedLayer += '<use xlink:href="#id_pad-10" x="5" y="5"/>'

      p.write(clear)
      p.write(dark)
      p.write(pad)
      expect(p._mask).to.equal('')
      expect(p.defs).to.equal(expectedDefs)
      expect(p.layer).to.equal(expectedLayer)
    })

    it('should not do anything with dark polarity if there is no mask', function() {
      var dark = {type: 'polarity', polarity: 'dark', box: [0, 0, 1, 1]}

      p.write(dark)
      expect(p._mask).to.equal('')
      expect(p.defs).to.equal('')
      expect(p.layer).to.equal('')
    })
  })

  describe('block repeats', function() {
    it('if only one layer, it should wrap the current layer and repeat it', function() {
      var offsets = [[0, 0], [0, 1], [1, 0], [1, 1]]
      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 0.5, 0.5]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.write({type: 'repeat', offsets: [], box: [0, 0, 1.5, 1.5]})

      expect(p.defs).to.equal(
        '<g id="id_block-1-1"><use xlink:href="#id_pad-10" x="250" y="250"/></g>')
      expect(p.layer).to.equal([
        '<use xlink:href="#id_block-1-1" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="1000"/>',
        '<use xlink:href="#id_block-1-1" x="1000" y="0"/>',
        '<use xlink:href="#id_block-1-1" x="1000" y="1000"/>'
      ].join(''))
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

      expect(p.defs).to.equal([
        '<g id="id_block-1-1"><use xlink:href="#id_pad-10" x="250" y="250"/></g>',
        '<g id="id_block-1-2"><use xlink:href="#id_pad-11" x="500" y="500"/></g>',
        '<g id="id_block-1-3"><use xlink:href="#id_pad-12" x="750" y="750"/></g>',
        '<g id="id_block-1-4"><use xlink:href="#id_pad-13" x="1000" y="1000"/></g>',
        '<g id="id_block-1-5"><use xlink:href="#id_pad-14" x="1250" y="1250"/></g>',
        '<mask id="id_block-1-clear" fill="#000" stroke="#000">',
        '<rect x="0" y="0" width="500" height="500" fill="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="0" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-2" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-3" x="0" y="0" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-4" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-5" x="0" y="0" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="5000" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-2" x="0" y="5000"/>',
        '<use xlink:href="#id_block-1-3" x="0" y="5000" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-4" x="0" y="5000"/>',
        '<use xlink:href="#id_block-1-5" x="0" y="5000" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="5000" y="0" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-2" x="5000" y="0"/>',
        '<use xlink:href="#id_block-1-3" x="5000" y="0" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-4" x="5000" y="0"/>',
        '<use xlink:href="#id_block-1-5" x="5000" y="0" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="5000" y="5000" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-2" x="5000" y="5000"/>',
        '<use xlink:href="#id_block-1-3" x="5000" y="5000" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-4" x="5000" y="5000"/>',
        '<use xlink:href="#id_block-1-5" x="5000" y="5000" fill="#fff" stroke="#fff"/>',
        '</mask>'
      ].join(''))
      expect(p.layer).to.equal([
        '<g mask="url(#id_block-1-clear)">',
        '<use xlink:href="#id_block-1-1" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-3" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-5" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="5000"/>',
        '<use xlink:href="#id_block-1-3" x="0" y="5000"/>',
        '<use xlink:href="#id_block-1-5" x="0" y="5000"/>',
        '<use xlink:href="#id_block-1-1" x="5000" y="0"/>',
        '<use xlink:href="#id_block-1-3" x="5000" y="0"/>',
        '<use xlink:href="#id_block-1-5" x="5000" y="0"/>',
        '<use xlink:href="#id_block-1-1" x="5000" y="5000"/>',
        '<use xlink:href="#id_block-1-3" x="5000" y="5000"/>',
        '<use xlink:href="#id_block-1-5" x="5000" y="5000"/>',
        '</g>'
      ].join(''))
    })

    it('should handle step repeats that start with clear', function() {
      var offsets = [[0, 0], [0, 0.5], [0.5, 0], [0.5, 0.5]]
      p.layer = 'SOME_EXISTING_STUFF'
      p.write({type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]})
      p._mask += 'SOME_EXISTING_CLEAR_STUFF'

      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 1, 1]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.write({type: 'polarity', polarity: 'dark', box: [0, 0, 1, 1]})
      p.write({type: 'pad', tool: '11', x: 0.25, y: 0.25})
      p.write({type: 'repeat', offsets: [], box: [0, 0, 1.5, 1.5]})

      expect(p.defs).to.equal([
        '<mask id="id_clear-1" fill="#000" stroke="#000">',
        '<rect x="0" y="0" width="1000" height="1000" fill="#fff"/>',
        'SOME_EXISTING_CLEAR_STUFF',
        '</mask>',
        '<g id="id_block-1-1"><use xlink:href="#id_pad-10" x="250" y="250"/></g>',
        '<g id="id_block-1-2"><use xlink:href="#id_pad-11" x="250" y="250"/></g>',
        '<mask id="id_block-1-clear" fill="#000" stroke="#000">',
        '<rect x="0" y="0" width="1000" height="1000" fill="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-2" x="0" y="0" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="500"/>',
        '<use xlink:href="#id_block-1-2" x="0" y="500" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="500" y="0"/>',
        '<use xlink:href="#id_block-1-2" x="500" y="0" fill="#fff" stroke="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="500" y="500"/>',
        '<use xlink:href="#id_block-1-2" x="500" y="500" fill="#fff" stroke="#fff"/>',
        '</mask>'
      ].join(''))
      expect(p.layer).to.equal([
        '<g mask="url(#id_block-1-clear)">',
        '<g mask="url(#id_clear-1)">',
        'SOME_EXISTING_STUFF',
        '</g>',
        '<use xlink:href="#id_block-1-2" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-2" x="0" y="500"/>',
        '<use xlink:href="#id_block-1-2" x="500" y="0"/>',
        '<use xlink:href="#id_block-1-2" x="500" y="500"/>',
        '</g>'
      ].join(''))
    })

    it('should handle step repeats that start with dark then change to clear', function() {
      var offsets = [[0, 0], [0, 0.5], [0.5, 0], [0.5, 0.5]]
      p.layer = 'SOME_EXISTING_STUFF'
      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 1, 1]})
      p.write({type: 'polarity', polarity: 'clear', box: [0, 0, 1, 1]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.write({type: 'repeat', offsets: [], box: [0, 0, 1.5, 1.5]})

      expect(p.defs).to.equal([
        '<g id="id_block-1-1"><use xlink:href="#id_pad-10" x="250" y="250"/></g>',
        '<mask id="id_block-1-clear" fill="#000" stroke="#000">',
        '<rect x="0" y="0" width="1000" height="1000" fill="#fff"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="500"/>',
        '<use xlink:href="#id_block-1-1" x="500" y="0"/>',
        '<use xlink:href="#id_block-1-1" x="500" y="500"/>',
        '</mask>'
      ].join(''))
      expect(p.layer).to.equal([
        '<g mask="url(#id_block-1-clear)">',
        'SOME_EXISTING_STUFF',
        '</g>'
      ].join(''))
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
      var expected = [
        '<svg id="id" xmlns="http://www.w3.org/2000/svg" version="1.1" ',
        'xmlns:xlink="http://www.w3.org/1999/xlink" ',
        'stroke-linecap="round" stroke-linejoin="round" stroke-width="0" ',
        'fill-rule="evenodd" ',
        'width="2mm" height="3mm" viewBox="-1000 -1000 2000 3000">',
        '<defs>THESE_ARE_THE_DEFS</defs>',
        '<g transform="translate(0,1000) scale(1,-1)" ',
        'fill="currentColor" stroke="currentColor">THIS_IS_THE_clear</g>',
        '</svg>'
      ].join('')

      p.on('data', function(result) {
        expect(result).to.equal(expected)
        done()
      })

      p.defs = 'THESE_ARE_THE_DEFS'
      p.layer = 'THIS_IS_THE_clear'
      p.write(size)
      p.end()
    })

    it('should finish any in-progress mask', function() {
      p._mask = '<mask id="id_clear-1">'
      p.end()

      expect(p._mask).to.equal('')
      expect(p.defs).to.equal('<mask id="id_clear-1"></mask>')
    })

    it('should finish any in-progress repeat', function() {
      var offsets = [[0, 0], [0, 1], [1, 0], [1, 1]]
      p.write({type: 'repeat', offsets: offsets, box: [0, 0, 0.5, 0.5]})
      p.write({type: 'pad', tool: '10', x: 0.25, y: 0.25})
      p.end()

      expect(p._block).to.equal('')
      expect(p.layer).to.equal([
        '<use xlink:href="#id_block-1-1" x="0" y="0"/>',
        '<use xlink:href="#id_block-1-1" x="0" y="1000"/>',
        '<use xlink:href="#id_block-1-1" x="1000" y="0"/>',
        '<use xlink:href="#id_block-1-1" x="1000" y="1000"/>'
      ].join(''))
    })
  })
})
