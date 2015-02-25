// test suite for stack layers function
'use strict'

var omit = require('lodash.omit')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var xmlElementString = require('xml-element-string')
var expect = chai.expect

chai.use(sinonChai)

var expectXmlNodes = require('./expect-xml-nodes')
var stackLayers = require('../lib/stack-layers')

var makeFakeConverter = function(defs, layer, viewBox, units) {
  return {
    defs: defs,
    layer: layer,
    viewBox: viewBox,
    width: (viewBox[2] / 1000),
    height: (viewBox[3] / 1000),
    units: units
  }
}

var fakeLayers = {
  cu: makeFakeConverter(['<cu-defs/>'], ['<cu/>'], [0, 0, 1000, 1000], 'in'),
  sm: makeFakeConverter(['<sm-defs/>'], ['<sm/>'], [-10, -10, 1020, 1020], 'in'),
  ss: makeFakeConverter(['<ss-defs/>'], ['<ss/>'], [10, 10, 980, 980], 'in'),
  sp: makeFakeConverter(['<sp-defs/>'], ['<sp/>'], [100, 100, 800, 800], 'in')
}

var fakeMechs = {
  drl1: makeFakeConverter(['<drl-1-defs/>'], ['<drl-1/>'], [0, 0, 24500, 30480], 'mm'),
  drl2: makeFakeConverter(['<drl-2-defs/>'], ['<drl-2/>'], [0, 0, 24500, 24500], 'mm'),
  out: makeFakeConverter(['<out-defs/>'], ['<out/>'], [-50, -50, 1100, 1100], 'in')
}

describe('stack layers function', function() {
  var element

  beforeEach(function() {
    element = sinon.spy(xmlElementString)
  })

  describe('building the defs and viewbox', function() {
    it('should add all layer defs to defs', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs)

      expect(result.defs.slice(0, 7)).to.eql([
        '<cu-defs/>',
        '<sm-defs/>',
        '<ss-defs/>',
        '<sp-defs/>',
        '<drl-1-defs/>',
        '<drl-2-defs/>',
        '<out-defs/>'
      ])
    })

    it('should add viewBoxes if no outline, taking units into account', function() {
      var drillConverters = omit(fakeMechs, 'out')
      var result = stackLayers(element, 'id', 'top', fakeLayers, drillConverters)

      expect(result.units).to.equal('in')
      expect(result.box).to.eql([-10, -10, 1020, 1210])
    })

    it('should use outline viewbox if present', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs)

      expect(result.units).to.equal('in')
      expect(result.box).to.eql([-50, -50, 1100, 1100])
    })

    it('should have no units by default, but count units when present', function() {
      var resultNoUnits = stackLayers(element, 'id', 'top', {}, {})

      var allIn = {
        'cu': makeFakeConverter('', '', [], 'in'),
        'sm': makeFakeConverter('', '', [], 'in'),
        'ss': makeFakeConverter('', '', [], 'in')
      }
      var allMm = {
        'cu': makeFakeConverter('', '', [], 'mm'),
        'sm': makeFakeConverter('', '', [], 'mm'),
        'ss': makeFakeConverter('', '', [], 'mm')
      }
      var moreIn = {
        'cu': makeFakeConverter('', '', [], 'in'),
        'sm': makeFakeConverter('', '', [], 'in'),
        'ss': makeFakeConverter('', '', [], 'mm')
      }
      var moreMm = {
        'cu': makeFakeConverter('', '', [], 'in'),
        'sm': makeFakeConverter('', '', [], 'mm'),
        'ss': makeFakeConverter('', '', [], 'mm')
      }
      var resultAllIn = stackLayers(element, 'id', 'top', allIn, {})
      var resultAllMm = stackLayers(element, 'id', 'top', allMm, {})
      var resultMoreIn = stackLayers(element, 'id', 'top', moreIn, {})
      var resultMoreMm = stackLayers(element, 'id', 'top', moreMm, {})

      expect(resultNoUnits.units).to.equal('')
      expect(resultAllIn.units).to.equal('in')
      expect(resultAllMm.units).to.equal('mm')
      expect(resultMoreIn.units).to.equal('in')
      expect(resultMoreMm.units).to.equal('mm')
    })

    it('should wrap the layers and add them to the defs', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs)
      var values = element.returnValues

      expect(element).to.be.calledWith('g', {id: 'id_top_cu'}, ['<cu/>'])
      expect(element).to.be.calledWith('g', {id: 'id_top_sm'}, ['<sm/>'])
      expect(element).to.be.calledWith('g', {id: 'id_top_ss'}, ['<ss/>'])
      expect(element).to.be.calledWith('g', {id: 'id_top_sp'}, ['<sp/>'])
      expect(result.defs).to.include.members(values.slice(0, 4))
    })

    it('should wrap the mech layers and add them to the defs', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs)
      var values = element.returnValues
      var transform = 'scale(0.03937007874015748,0.03937007874015748)'
      var expected = [
        {id: 'id_top_drl1', transform: transform},
        {id: 'id_top_drl2', transform: transform},
        {id: 'id_top_out'}
      ]

      expect(element).to.be.calledWith('g', expected[0], ['<drl-1/>'])
      expect(element).to.be.calledWith('g', expected[1], ['<drl-2/>'])
      expect(element).to.be.calledWith('g', expected[2], ['<out/>'])
      expect(result.defs).to.include.members(values.slice(4, 7))
    })

    it('should add a mech mask to the defs', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs)
      var values = expectXmlNodes(element, [
        {tag: 'rect', attr: {x: -50, y: -50, width: 1100, height: 1100, fill: '#fff'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_drl1'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_drl2'}},
        {
          tag: 'mask',
          attr: {id: 'id_top_mech-mask', fill: '#000', stroke: '#000'},
          children: [0, 1, 2]
        }
      ])

      expect(result.defs).to.contain(values[3])
    })

    it('should include the outline in the mech mask if told to', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs, true)
      var values = expectXmlNodes(element, [
        {tag: 'use', attr: {'xlink:href': '#id_top_out'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_drl1'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_drl2'}},
        {
          tag: 'mask',
          attr: {id: 'id_top_mech-mask', fill: '#000', stroke: '#000'},
          children: [0, 1, 2]
        }
      ])

      expect(result.defs).to.contain(values[3])
    })

    it('should handle being told to use the outline when it is missing', function() {
      var noOutFakeMechs = {
        drl1: makeFakeConverter(['<drl-1/>'], ['<drl-1/>'], [0, 0, 24500, 30480], 'mm'),
        drl2: makeFakeConverter(['<drl-2/>'], ['<drl-2/>'], [0, 0, 24500, 24500], 'mm')
      }

      var result = stackLayers(element, 'id', 'top', fakeLayers, noOutFakeMechs, true)
      var values = expectXmlNodes(element, [
        {tag: 'rect', attr: {x: -10, y: -10, width: 1020, height: 1210, fill: '#fff'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_drl1'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_drl2'}},
        {
          tag: 'mask',
          attr: {id: 'id_top_mech-mask', fill: '#000', stroke: '#000'},
          children: [0, 1, 2]
        }
      ])

      expect(result.defs).to.contain(values[3])
    })
  })

  describe('building the main group', function() {
    it('should start with a fr4 rectangle the size of the box', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs)
      var values = expectXmlNodes(element, [{
        tag: 'rect',
        attr: {
          x: -50,
          y: -50,
          width: 1100,
          height: 1100,
          class: 'id_fr4',
          fill: 'currentColor'
        }
      }])

      expect(result.layer[0]).to.equal(values[0])
    })

    it('should add copper and copper finish if there is a copper layer', function() {
      var converters = {
        cu: makeFakeConverter(['<cu-defs/>'], ['<cu/>'], [0, 0, 1000, 1000], 'in')
      }
      var result = stackLayers(element, 'id', 'top', converters, {})
      var values = expectXmlNodes(element, [
        {tag: 'rect', attr: {x: 0, y: 0, width: 1000, height: 1000}},
        {
          tag: 'mask',
          attr: {id: 'id_top_cf-mask', fill: '#fff', stroke: '#fff'},
          children: [0]
        },
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_cu',
            class: 'id_cu',
            fill: 'currentColor',
            stroke: 'currentColor'
          }
        },
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_cu',
            mask: 'url(#id_top_cf-mask)',
            class: 'id_cf',
            fill: 'currentColor',
            stroke: 'currentColor'
          }
        }
      ])

      expect(result.defs.slice(-1)).to.eql([values[1]])
      expect(result.layer.slice(-2)).to.eql([values[2], values[3]])
    })

    it('should use the soldermask to mask the copper finish if it exists', function() {
      var converters = {
        cu: makeFakeConverter(['<cu-defs/>'], ['<cu/>'], [0, 0, 1000, 1000], 'in'),
        sm: makeFakeConverter(['<sm-defs/>'], ['<sm/>'], [-10, -10, 1020, 1020], 'in')
      }
      var result = stackLayers(element, 'id', 'top', converters, {})
      var values = expectXmlNodes(element, [
        {tag: 'use', attr: {'xlink:href': '#id_top_sm'}},
        {
          tag: 'mask',
          attr: {id: 'id_top_cf-mask', fill: '#fff', stroke: '#fff'},
          children: [0]
        }
      ])

      expect(result.defs).to.contain(values[1])
    })

    it('should add the soldermask', function() {
      var converters = {
        sm: makeFakeConverter(['<sm-defs/>'], ['<sm/>'], [0, 0, 500, 500], 'in')
      }
      var result = stackLayers(element, 'id', 'top', converters, {})
      var values = expectXmlNodes(element, [
        {tag: 'rect', attr: {x: 0, y: 0, width: 500, height: 500, fill: '#fff'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_sm'}},
        {
          tag: 'mask',
          attr: {id: 'id_top_sm-mask', fill: '#000', stroke: '#000'},
          children: [0, 1]},
        {
          tag: 'rect',
          attr: {x: 0, y: 0, width: 500, height: 500, class: 'id_sm', fill: 'currentColor'}
        },
        {tag: 'g', attr: {mask: 'url(#id_top_sm-mask)'}, children: [3]}
      ])

      expect(result.defs).to.contain(values[2])
      expect(result.layer.slice(-1)).to.eql([values[4]])
    })

    it('should add silkscreen when there is a mask and a silk', function() {
      var converters = {
        sm: makeFakeConverter(['<sm-defs/>'], ['<sm/>'], [0, 0, 500, 500], 'in'),
        ss: makeFakeConverter(['<ss-defs/>'], ['<ss/>'], [10, 10, 480, 480], 'in')
      }
      var result = stackLayers(element, 'id', 'top', converters, {})
      var values = expectXmlNodes(element, [
        {
          tag: 'rect',
          attr: {x: 0, y: 0, width: 500, height: 500, class: 'id_sm', fill: 'currentColor'}
        },
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_ss',
            class: 'id_ss',
            fill: 'currentColor',
            stroke: 'currentColor'
          }
        },
        {tag: 'g', attr: {mask: 'url(#id_top_sm-mask)'}, children: [0, 1]}
      ])

      expect(result.layer.slice(-1)).to.eql([values[2]])
    })

    it('should add solderpaste', function() {
      var converters = {
        sp: makeFakeConverter(['<sp-defs/>'], ['<sp/>'], [0, 0, 500, 500], 'in')
      }
      var result = stackLayers(element, 'id', 'top', converters, {})
      var values = expectXmlNodes(element, [
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_sp',
            class: 'id_sp',
            fill: 'currentColor',
            stroke: 'currentColor'
          }
        }
      ])

      expect(result.layer.slice(-1)).to.eql(values)
    })

    it('should return the id of the mechanical mask', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs)

      expect(result.mechMaskId).to.equal('id_top_mech-mask')
    })

    it('should add the outline as a line if not used in the mech mask', function() {
      var result = stackLayers(element, 'id', 'top', fakeLayers, fakeMechs)
      var values = expectXmlNodes(element, [
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_out',
            class: 'id_out',
            fill: 'currentColor',
            stroke: 'currentColor'
          }
        }
      ])

      expect(result.layer.slice(-1)).to.eql(values)
    })

    it('should not add the outline if used in the mech mask', function() {
      stackLayers(element, 'id', 'top', fakeLayers, fakeMechs, true)

      expect(element).to.not.be.calledWith('use', {
        'xlink:href': '#id_top_out',
        class: 'id_out',
        fill: 'currentColor',
        stroke: 'currentColor'
      })
    })
  })
})
