// test suite for the main pcb stackup function
'use strict'

var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var proxyquire = require('proxyquire')

var expect = chai.expect
chai.use(sinonChai)

var sortLayersSpy = sinon.spy(require('../lib/sort-layers'))
var stackLayersStub = sinon.stub()

var pcbStackup = proxyquire('../lib', {
  './sort-layers': sortLayersSpy,
  './stack-layers': stackLayersStub
})

var converter = function() {
  return {
    defs: '',
    layer: '',
    viewBox: [0, 0, 0, 0],
    width: 0,
    height: 0,
    units: ''
  }
}

var EXPECTED_DEFAULT_STYLE = '<style>/* <![CDATA[ */' + [
  '.foobar_fr4 {color: #666;}',
  '.foobar_cu {color: #ccc;}',
  '.foobar_cf {color: #c93;}',
  '.foobar_sm {color: rgba(00, 66, 00, 0.75);}',
  '.foobar_ss {color: #fff;}',
  '.foobar_sp {color: #999;}',
  '.foobar_out {color: #000;}'
].join('\n') + '/* ]]> */</style>'

describe('pcb stackup function', function() {
  beforeEach(function() {
    sortLayersSpy.reset()
    stackLayersStub.reset()
    stackLayersStub.returns({box: [], units: '', defs: '', group: ''})
  })

  it('should need an id as an option', function() {
    var result1 = pcbStackup([], 'foo')
    expect(result1.top).to.contain('id="foo_top"')
    expect(result1.bottom).to.contain('id="foo_bottom"')

    var result2 = pcbStackup([], {id: 'bar'})
    expect(result2.top).to.contain('id="bar_top"')
    expect(result2.bottom).to.contain('id="bar_bottom"')

    expect(function() {pcbStackup([])}).to.throw(/unique board ID/)
  })

  it('should have the proper SVG start and end', function() {
    var result = pcbStackup([], 'foobar')
    var svgStart = function(side) {
      return [
        '<svg',
        'id="foobar_' + side + '"',
        'xmlns="http://www.w3.org/2000/svg"',
        'version="1.1"',
        'xmlns:xlink="http://www.w3.org/1999/xlink"',
        'stroke-linecap="round"',
        'stroke-linejoin="round"',
        'stroke-width="0"',
        'fill-rule="evenodd"',
        'viewBox="0 0 0 0"',
        'width="0"',
        'height="0">'
      ].join(' ')
    }
    var svgEnd = '</svg>'

    var topStart = svgStart('top')
    var bottomStart = svgStart('bottom')
    expect(result.top.slice(0, topStart.length)).to.equal(topStart)
    expect(result.bottom.slice(0, bottomStart.length)).to.equal(bottomStart)
    expect(result.top.slice(-svgEnd.length)).to.equal(svgEnd)
    expect(result.bottom.slice(-svgEnd.length)).to.equal(svgEnd)
  })

  it('should have a default color style', function() {
    var result = pcbStackup([], 'foobar')

    expect(result.top).to.contain(EXPECTED_DEFAULT_STYLE)
    expect(result.bottom).to.contain(EXPECTED_DEFAULT_STYLE)
  })

  it('should handle user input colors', function() {
    var options = {
      id: 'foobar',
      color: {cu: '#123', cf: '#456', sp: '#789'}
    }
    var result = pcbStackup([], options)
    var expectedStyle = '<style>/* <![CDATA[ */' + [
      '.foobar_fr4 {color: #666;}',
      '.foobar_cu {color: #123;}',
      '.foobar_cf {color: #456;}',
      '.foobar_sm {color: rgba(00, 66, 00, 0.75);}',
      '.foobar_ss {color: #fff;}',
      '.foobar_sp {color: #789;}',
      '.foobar_out {color: #000;}'
    ].join('\n') + '/* ]]> */</style>'

    expect(result.top).to.contain(expectedStyle)
    expect(result.bottom).to.contain(expectedStyle)
  })

  it('should override the outline fill and stroke if used as a mask', function() {
    var result = pcbStackup([], {id: 'foobar', maskWithOutline: true})
    var expectedStyle = function(side) {
      return '<style>/* <![CDATA[ */' + [
        '.foobar_fr4 {color: #666;}',
        '.foobar_cu {color: #ccc;}',
        '.foobar_cf {color: #c93;}',
        '.foobar_sm {color: rgba(00, 66, 00, 0.75);}',
        '.foobar_ss {color: #fff;}',
        '.foobar_sp {color: #999;}',
        '.foobar_out {color: #000;}',
        '#foobar_' + side + '_out path {fill: #fff; stroke-width: 0;}'
      ].join('\n') + '/* ]]> */</style>'
    }

    expect(result.top).to.contain(expectedStyle('top'))
    expect(result.bottom).to.contain(expectedStyle('bottom'))
  })

  it('map the filenames to IDs and send them to sort layers', function() {
    var files = [
      {filename: 'board-F_Cu.gbr', converter: converter()},
      {filename: 'board-F_Mask.gbr', converter: converter()},
      {filename: 'board-F_SilkS.gbr', converter: converter()},
      {filename: 'board-F_Paste.gbr', converter: converter()},
      {filename: 'board-B_Cu.gbr', converter: converter()},
      {filename: 'board-B_Mask.gbr', converter: converter()},
      {filename: 'board-B_SilkS.gbr', converter: converter()},
      {filename: 'board-B_Paste.gbr', converter: converter()},
      {filename: 'board-In1_Cu.gbr', converter: converter()},
      {filename: 'board-Edge_Cuts.gbr', converter: converter()},
      {filename: 'board.drl', converter: converter()}
    ]

    var expected = [
      {type: 'tcu', converter: converter()},
      {type: 'tsm', converter: converter()},
      {type: 'tss', converter: converter()},
      {type: 'tsp', converter: converter()},
      {type: 'bcu', converter: converter()},
      {type: 'bsm', converter: converter()},
      {type: 'bss', converter: converter()},
      {type: 'bsp', converter: converter()},
      {type: 'icu', converter: converter()},
      {type: 'out', converter: converter()},
      {type: 'drl', converter: converter()}
    ]

    pcbStackup(files, 'this-id')
    var sorted = sortLayersSpy.returnValues[0]
    expect(sortLayersSpy).to.have.been.calledWith(expected)
    expect(stackLayersStub).to.have.been.calledWith(
      'this-id',
      'top',
      sorted.top,
      sorted.mech)
    expect(stackLayersStub).to.have.been.calledWith(
      'this-id',
      'bottom',
      sorted.bottom,
      sorted.mech)
  })

  it('should use stack to build result and flip as needed', function() {
    stackLayersStub.withArgs('foobar', 'top').returns({
      box: [0, 0, 1000, 1000],
      units: 'mm',
      group: '<top-group/>',
      defs: '<top-defs/>'
    })
    stackLayersStub.withArgs('foobar', 'bottom').returns({
      box: [250, 250, 500, 500],
      units: 'in',
      group: '<bottom-group/>',
      defs: '<bottom-defs/>'
    })

    var result = pcbStackup([], 'foobar')

    expect(result.top).to.contain('width="1mm"')
    expect(result.top).to.contain('height="1mm"')
    expect(result.top).to.contain('viewBox="0 0 1000 1000"')
    expect(result.top).to.contain([
      '>',
      '<defs>' + EXPECTED_DEFAULT_STYLE + '<top-defs/></defs>',
      '<g transform="translate(0,1000) scale(1,-1)"><top-group/></g>',
      '</svg>'
    ].join(''))

    expect(result.bottom).to.contain('width="0.5in"')
    expect(result.bottom).to.contain('height="0.5in"')
    expect(result.bottom).to.contain('viewBox="250 250 500 500"')
    expect(result.bottom).to.contain([
      '>',
      '<defs>' + EXPECTED_DEFAULT_STYLE + '<bottom-defs/></defs>',
      '<g transform="translate(1000,1000) scale(-1,-1)"><bottom-group/></g>',
      '</svg>'
    ].join(''))
  })
})
