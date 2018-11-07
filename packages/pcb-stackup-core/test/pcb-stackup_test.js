// test suite for the main pcb stackup function
// TODO(mc, 2018-01-16): refactor with testdouble and maybe assert
'use strict'

var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var proxyquire = require('proxyquire')
var xmlElementString = require('xml-element-string')
var expect = chai.expect

chai.use(sinonChai)

var wtg = require('whats-that-gerber')
var expectXmlNodes = require('./expect-xml-nodes')
var sortLayersSpy = sinon.spy(require('../lib/sort-layers'))
var stackLayersStub = sinon.stub()
var element = sinon.spy(xmlElementString)

var pcbStackupCore = proxyquire('../lib', {
  'xml-element-string': element,
  './sort-layers': sortLayersSpy,
  './stack-layers': stackLayersStub,
})

var converter = function() {
  return {
    defs: '',
    layer: '',
    viewBox: [0, 0, 0, 0],
    width: 0,
    height: 0,
    units: '',
  }
}

var EXPECTED_DEFAULT_STYLE = [
  '.foobar_fr4 {color: #666;}',
  '.foobar_cu {color: #ccc;}',
  '.foobar_cf {color: #c93;}',
  '.foobar_sm {color: #004200; opacity: 0.75;}',
  '.foobar_ss {color: #fff;}',
  '.foobar_sp {color: #999;}',
  '.foobar_out {color: #000;}',
].join('\n')

describe('pcb stackup function', function() {
  beforeEach(function() {
    element.resetHistory()
    sortLayersSpy.resetHistory()
    stackLayersStub.reset()
    stackLayersStub.returns({
      box: [],
      units: '',
      mechMaskId: '',
      defs: [],
      layer: [],
    })
  })

  it('should need an id as an option', function() {
    expect(function() {
      pcbStackupCore([], 'foo')
    }).to.not.throw()
    expect(function() {
      pcbStackupCore([], {id: 'bar'})
    }).to.not.throw()
    expect(function() {
      pcbStackupCore([])
    }).to.throw(/unique board ID/)
  })

  it('should have a createElement option that defaults to xml-element-string', function() {
    var customElement = function() {
      return 'foo'
    }

    pcbStackupCore([], 'foo')
    expect(stackLayersStub).to.be.calledWith(element)

    pcbStackupCore([], {id: 'foo', createElement: customElement})
    expect(stackLayersStub).to.be.calledWith(customElement)
  })

  it('should return an SVG element with the propper attributes', function() {
    var result = pcbStackupCore([], 'foobar')
    var svgAttr = function(side) {
      return {
        id: 'foobar_' + side,
        xmlns: 'http://www.w3.org/2000/svg',
        version: '1.1',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': 0,
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        viewBox: '0 0 0 0',
        width: '0',
        height: '0',
      }
    }

    var topElement = element.withArgs('svg', svgAttr('top'))
    var bottomElement = element.withArgs('svg', svgAttr('bottom'))

    expect(element).to.be.calledWith('svg', svgAttr('top'))
    expect(element).to.be.calledWith('svg', svgAttr('bottom'))
    expect(result.top.svg).to.equal(topElement.returnValues[0])
    expect(result.bottom.svg).to.equal(bottomElement.returnValues[0])
  })

  it('should have a default color style', function() {
    var result = pcbStackupCore([], 'foobar')
    var styleSpy = element.withArgs('style', {}, [EXPECTED_DEFAULT_STYLE])

    expect(styleSpy).to.have.callCount(2)
    expect(result.top.svg).to.contain(styleSpy.returnValues[0])
    expect(result.bottom.svg).to.contain(styleSpy.returnValues[0])
  })

  it('should handle user input colors', function() {
    var options = {
      id: 'foobar',
      color: {cu: '#123', cf: '#456', sp: '#789'},
    }
    var result = pcbStackupCore([], options)
    var expectedStyle = [
      '.foobar_fr4 {color: #666;}',
      '.foobar_cu {color: #123;}',
      '.foobar_cf {color: #456;}',
      '.foobar_sm {color: #004200; opacity: 0.75;}',
      '.foobar_ss {color: #fff;}',
      '.foobar_sp {color: #789;}',
      '.foobar_out {color: #000;}',
    ].join('\n')

    var styleSpy = element.withArgs('style', {}, [expectedStyle])

    expect(styleSpy).to.have.callCount(2)
    expect(result.top.svg).to.contain(styleSpy.returnValues[0])
    expect(result.bottom.svg).to.contain(styleSpy.returnValues[0])
  })

  it('should pass the layers to sort layers', function() {
    var files = [
      {side: wtg.SIDE_TOP, type: wtg.TYPE_COPPER, converter: converter()},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_SOLDERMASK, converter: converter()},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_SILKSCREEN, converter: converter()},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_SOLDERPASTE, converter: converter()},
      {side: wtg.SIDE_BOTTOM, type: wtg.TYPE_COPPER, converter: converter()},
      {
        side: wtg.SIDE_BOTTOM,
        type: wtg.TYPE_SOLDERMASK,
        converter: converter(),
      },
      {
        side: wtg.SIDE_BOTTOM,
        type: wtg.TYPE_SILKSCREEN,
        converter: converter(),
      },
      {
        side: wtg.SIDE_BOTTOM,
        type: wtg.TYPE_SOLDERPASTE,
        converter: converter(),
      },
      {side: wtg.SIDE_INNER, type: wtg.TYPE_COPPER, converter: converter()},
      {side: wtg.SIDE_ALL, type: wtg.TYPE_OUTLINE, converter: converter()},
      {side: wtg.SIDE_ALL, type: wtg.TYPE_DRILL, converter: converter()},
    ]

    pcbStackupCore(files, 'this-id')

    var sorted = sortLayersSpy.returnValues[0]

    expect(sortLayersSpy).to.have.been.calledWith(files)
    expect(stackLayersStub).to.have.been.calledWith(
      element,
      'this-id',
      'top',
      sorted.top,
      sorted.drills,
      sorted.outline
    )
    expect(stackLayersStub).to.have.been.calledWith(
      element,
      'this-id',
      'bottom',
      sorted.bottom,
      sorted.drills,
      sorted.outline
    )
  })

  it('should use stack to build result, add mech mask, flip as needed', function() {
    stackLayersStub.withArgs(element, 'foobar', 'top').returns({
      box: [0, 0, 1000, 1000],
      units: 'mm',
      layer: ['<top-group/>'],
      defs: ['<top-defs/>'],
      mechMaskId: 'foobar_top_mech-mask',
    })
    stackLayersStub.withArgs(element, 'foobar', 'bottom').returns({
      box: [250, 250, 500, 500],
      units: 'in',
      layer: ['<bottom-group/>'],
      defs: ['<bottom-defs/>'],
      mechMaskId: 'foobar_bottom_mech-mask',
    })

    var result = pcbStackupCore([], 'foobar')
    var values = expectXmlNodes(element, [
      {tag: 'style', attr: {}, children: [EXPECTED_DEFAULT_STYLE]},
      {tag: 'defs', attr: {}, children: [0, '<top-defs/>']},
      {
        tag: 'g',
        attr: {mask: 'url(#foobar_top_mech-mask)'},
        children: ['<top-group/>'],
      },
      {
        tag: 'g',
        attr: {transform: 'translate(0,1000) scale(1,-1)'},
        children: [2],
      },
      {
        tag: 'svg',
        attr: sinon.match.object
          .and(sinon.match.has('id', 'foobar_top'))
          .and(sinon.match.has('width', '1mm'))
          .and(sinon.match.has('height', '1mm'))
          .and(sinon.match.has('viewBox', '0 0 1000 1000')),
        children: [1, 3],
      },
      {tag: 'style', attr: {}, children: [EXPECTED_DEFAULT_STYLE]},
      {tag: 'defs', attr: {}, children: [5, '<bottom-defs/>']},
      {
        tag: 'g',
        attr: {
          mask: 'url(#foobar_bottom_mech-mask)',
          transform: 'translate(1000,0) scale(-1,1)',
        },
        children: ['<bottom-group/>'],
      },
      {
        tag: 'g',
        attr: {transform: 'translate(0,1000) scale(1,-1)'},
        children: [7],
      },
      {
        tag: 'svg',
        attr: sinon.match.object
          .and(sinon.match.has('id', 'foobar_bottom'))
          .and(sinon.match.has('width', '0.5in'))
          .and(sinon.match.has('height', '0.5in'))
          .and(sinon.match.has('viewBox', '250 250 500 500')),
        children: [6, 8],
      },
    ])

    expect(result).to.eql({
      top: {
        svg: values[4],
        defs: [values[0], '<top-defs/>'],
        layer: [values[2]],
        viewBox: [0, 0, 1000, 1000],
        width: 1,
        height: 1,
        units: 'mm',
      },
      bottom: {
        svg: values[9],
        defs: [values[5], '<bottom-defs/>'],
        layer: [values[7]],
        viewBox: [250, 250, 500, 500],
        width: 0.5,
        height: 0.5,
        units: 'in',
      },
    })
  })

  it('should add a clip path if stackLayers returns a outline clip id', function() {
    stackLayersStub.withArgs(element, 'foobar', 'top').returns({
      box: [0, 0, 1000, 1000],
      units: 'mm',
      layer: ['<top-group/>'],
      defs: ['<top-defs/>'],
      mechMaskId: 'foobar_top_mech-mask',
      outClipId: 'foobar_top_out',
    })
    stackLayersStub.withArgs(element, 'foobar', 'bottom').returns({
      box: [250, 250, 500, 500],
      units: 'in',
      layer: ['<bottom-group/>'],
      defs: ['<bottom-defs/>'],
      mechMaskId: 'foobar_bottom_mech-mask',
      outClipId: 'foobar_bottom_out',
    })

    pcbStackupCore([], {id: 'foobar', maskWithOutline: true})

    expect(element).to.be.calledWith(
      'g',
      {
        mask: 'url(#foobar_top_mech-mask)',
        'clip-path': 'url(#foobar_top_out)',
      },
      ['<top-group/>']
    )
    expect(element).to.be.calledWith(
      'g',
      {
        transform: 'translate(1000,0) scale(-1,1)',
        mask: 'url(#foobar_bottom_mech-mask)',
        'clip-path': 'url(#foobar_bottom_out)',
      },
      ['<bottom-group/>']
    )
  })

  it('should not put xmlns attr in nodes if includeNamespace is false', function() {
    pcbStackupCore([], {id: 'foo', includeNamespace: false})

    expect(element).to.not.be.calledWith('svg', sinon.match.has('xmlns'))
  })

  it('should allow arbitrary stuff in the attributes', function() {
    pcbStackupCore([], {id: 'foo', attributes: {bar: 'baz'}})

    expect(element).to.be.calledWith('svg', sinon.match.has('bar', 'baz'))
  })
})
