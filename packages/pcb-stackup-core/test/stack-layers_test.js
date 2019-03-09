// test suite for stack layers function
'use strict'

var expect = require('chai').expect
var sinon = require('sinon')

var wtg = require('whats-that-gerber')
var expectXmlNodes = require('./expect-xml-nodes')
var stack = require('../lib/stack-layers')

var converter = function(defs, layer, viewBox, units) {
  return {
    defs: defs,
    layer: layer,
    viewBox: viewBox,
    width: viewBox[2] / 1000,
    height: viewBox[3] / 1000,
    units: units,
  }
}

var layers = [
  {
    type: wtg.TYPE_COPPER,
    converter: converter(['<cu-d/>'], ['<cu/>'], [0, 0, 1000, 1000], 'in'),
  },
  {
    type: wtg.TYPE_SOLDERMASK,
    converter: converter(['<sm-d/>'], ['<sm/>'], [-10, -10, 1020, 1020], 'in'),
  },
  {
    type: wtg.TYPE_SILKSCREEN,
    converter: converter(['<ss-d/>'], ['<ss/>'], [10, 10, 980, 980], 'in'),
  },
  {
    type: wtg.TYPE_SOLDERPASTE,
    converter: converter(['<sp-d/>'], ['<sp/>'], [100, 100, 800, 800], 'in'),
  },
]

var drills = [
  {
    type: wtg.TYPE_DRILL,
    converter: converter(['<drl-1/>'], ['<drl1/>'], [0, 0, 25400, 30480], 'mm'),
  },
  {
    type: wtg.TYPE_DRILL,
    converter: converter(['<drl-2/>'], ['<drl2/>'], [0, 0, 25400, 25400], 'mm'),
  },
]

var outline = {
  type: wtg.TYPE_OUTLINE,
  converter: converter(['<out-d/>'], ['<out/>'], [-50, -50, 1100, 1100], 'in'),
}

describe('stack layers function', function() {
  var element

  beforeEach(function() {
    element = sinon.spy(function(tag, attributes, children) {
      return {tag: tag, attributes: attributes, children: children}
    })
  })

  describe('building the defs and viewbox', function() {
    it('should add all layer defs to defs', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline)

      expect(result.defs.slice(0, 7)).to.eql([
        '<cu-d/>',
        '<sm-d/>',
        '<ss-d/>',
        '<sp-d/>',
        '<drl-1/>',
        '<drl-2/>',
        '<out-d/>',
      ])
    })

    it('should add viewBoxes taking units into account', function() {
      var result = stack(element, 'id', 'top', layers, drills)

      expect(result.units).to.equal('in')
      expect(result.box).to.eql([-10, -10, 1020, 1210])
    })

    it('should use outline viewBox if present and useOutline set', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline, true)

      expect(result.units).to.equal('in')
      expect(result.box).to.eql([-50, -50, 1100, 1100])
    })

    it('should add viewBoxes if useOutline set without outline', function() {
      var result = stack(element, 'id', 'top', layers, drills, null, true)

      expect(result.units).to.equal('in')
      expect(result.box).to.eql([-10, -10, 1020, 1210])
    })

    it('should use outline viewBox if present and useOutline set', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline, true)

      expect(result.units).to.equal('in')
      expect(result.box).to.eql([-50, -50, 1100, 1100])
    })

    it('should have no units by default, but count units when present', function() {
      var resultNoUnits = stack(element, 'id', 'top', [], [])

      var allIn = [
        {type: wtg.TYPE_COPPER, converter: converter([], [], [], 'in')},
        {type: wtg.TYPE_SOLDERMASK, converter: converter([], [], [], 'in')},
        {type: wtg.TYPE_SILKSCREEN, converter: converter([], [], [], 'in')},
      ]
      var allMm = [
        {type: wtg.TYPE_COPPER, converter: converter([], [], [], 'mm')},
        {type: wtg.TYPE_SOLDERMASK, converter: converter([], [], [], 'mm')},
        {type: wtg.TYPE_SILKSCREEN, converter: converter([], [], [], 'mm')},
      ]
      var moreIn = [
        {type: wtg.TYPE_COPPER, converter: converter([], [], [], 'in')},
        {type: wtg.TYPE_SOLDERMASK, converter: converter([], [], [], 'in')},
        {type: wtg.TYPE_SILKSCREEN, converter: converter([], [], [], 'mm')},
      ]
      var moreMm = [
        {type: wtg.TYPE_COPPER, converter: converter([], [], [], 'in')},
        {type: wtg.TYPE_SOLDERMASK, converter: converter([], [], [], 'mm')},
        {type: wtg.TYPE_SILKSCREEN, converter: converter([], [], [], 'mm')},
      ]

      var resultAllIn = stack(element, 'id', 'top', allIn, [])
      var resultAllMm = stack(element, 'id', 'top', allMm, [])
      var resultMoreIn = stack(element, 'id', 'top', moreIn, [])
      var resultMoreMm = stack(element, 'id', 'top', moreMm, [])

      expect(resultNoUnits.units).to.equal('')
      expect(resultAllIn.units).to.equal('in')
      expect(resultAllMm.units).to.equal('mm')
      expect(resultMoreIn.units).to.equal('in')
      expect(resultMoreMm.units).to.equal('mm')
    })

    it('should wrap the layers and add them to the defs', function() {
      var result = stack(element, 'id', 'top', layers, drills)
      var values = element.returnValues

      expect(element).to.be.calledWith('g', {id: 'id_top_copper'}, ['<cu/>'])
      expect(element).to.be.calledWith('g', {id: 'id_top_soldermask'}, [
        '<sm/>',
      ])
      expect(element).to.be.calledWith('g', {id: 'id_top_silkscreen'}, [
        '<ss/>',
      ])
      expect(element).to.be.calledWith('g', {id: 'id_top_solderpaste'}, [
        '<sp/>',
      ])
      expect(result.defs).to.include.members(values.slice(0, 4))
    })

    it('should wrap the mech layers and add them to the defs', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline)
      var values = element.returnValues
      var transform = 'scale(0.03937007874015748,0.03937007874015748)'
      var expected = [
        {id: 'id_top_drill1', transform: transform},
        {id: 'id_top_drill2', transform: transform},
        {id: 'id_top_outline'},
      ]

      expect(element).to.be.calledWith('g', expected[0], ['<drl1/>'])
      expect(element).to.be.calledWith('g', expected[1], ['<drl2/>'])
      expect(element).to.be.calledWith('g', expected[2], ['<out/>'])
      expect(result.defs).to.include.members(values.slice(4, 7))
    })

    it('should use a clip path instead of a group for the outline if masking', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline, true)
      var values = expectXmlNodes(element, [
        {
          tag: 'clipPath',
          attr: {id: 'id_top_outline'},
          children: ['<out/>'],
        },
      ])

      expect(result.defs).to.contain(values[0])
      expect(element).to.not.be.calledWith('g', {id: 'id_top_outline'}, [
        '<out/>',
      ])
    })

    it('should not add layers with externalId to defs', function() {
      layers[0].externalId = 'foo'
      drills[0].externalId = 'bar'
      outline.externalId = 'baz'

      var result = stack(element, 'id', 'top', layers, drills, outline)

      delete layers[0].externalId
      delete drills[0].externalId
      delete outline.externalId

      expect(result.defs).to.not.include.members(layers[0].converter.defs)
      expect(result.defs).to.not.include.members(drills[0].converter.defs)
      expect(result.defs).to.not.include.members(outline.converter.defs)
      expect(element).to.not.be.calledWith(
        'g',
        sinon.match.object,
        layers[0].converter.layer
      )
      expect(element).to.not.be.calledWith(
        'g',
        sinon.match.object,
        drills[0].converter.layer
      )
      expect(element).to.not.be.calledWith(
        'g',
        sinon.match.object,
        outline.converter.layer
      )

      expect(result.box).to.eql([-50, -50, 1100, 1250])
    })

    it('should add outline to defs even if it has externalId if masking', function() {
      var out = {
        type: wtg.TYPE_OUTLINE,
        externalId: 'foo',
        converter: converter(
          ['<out-d/>'],
          ['<out/>'],
          [-50, -50, 1100, 1100],
          'in'
        ),
      }
      var result = stack(element, 'id', 'top', layers, drills, out, true)
      var values = expectXmlNodes(element, [
        {
          tag: 'clipPath',
          attr: {id: 'id_top_outline'},
          children: ['<out/>'],
        },
      ])

      expect(result.defs).to.contain(values[0])
      expect(element).to.not.be.calledWith('g', {id: 'id_top_outline'}, [
        '<out/>',
      ])
    })

    it('should add a mech mask to the defs', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline, true)
      var values = expectXmlNodes(element, [
        {
          tag: 'rect',
          attr: {x: -50, y: -50, width: 1100, height: 1100, fill: '#fff'},
        },
        {tag: 'use', attr: {'xlink:href': '#id_top_drill1'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_drill2'}},
        {
          tag: 'g',
          attr: {fill: '#000', stroke: '#000'},
          children: [0, 1, 2],
        },
        {
          tag: 'mask',
          attr: {id: 'id_top_mech-mask'},
          children: [3],
        },
      ])

      expect(result.defs).to.contain(values[4])
    })

    it('should handle being told to use the outline when it is missing', function() {
      var result = stack(element, 'id', 'top', layers, drills, null, true)
      var values = expectXmlNodes(element, [
        {
          tag: 'rect',
          attr: {x: -10, y: -10, width: 1020, height: 1210, fill: '#fff'},
        },
        {tag: 'use', attr: {'xlink:href': '#id_top_drill1'}},
        {tag: 'use', attr: {'xlink:href': '#id_top_drill2'}},
        {
          tag: 'g',
          attr: {fill: '#000', stroke: '#000'},
          children: [0, 1, 2],
        },
        {
          tag: 'mask',
          attr: {id: 'id_top_mech-mask'},
          children: [3],
        },
      ])

      expect(result.defs).to.contain(values[4])
    })
  })

  describe('building the main group', function() {
    it('should start with a fr4 rectangle the size of the box', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline, true)
      var values = expectXmlNodes(element, [
        {
          tag: 'rect',
          attr: {
            x: -50,
            y: -50,
            width: 1100,
            height: 1100,
            class: 'id_fr4',
            fill: 'currentColor',
          },
        },
      ])

      expect(result.layer[0]).to.equal(values[0])
    })

    it('should add copper and copper finish if there is a copper layer', function() {
      var converters = [
        {
          type: wtg.TYPE_COPPER,
          converter: converter([], [], [0, 0, 1000, 1000], 'in'),
        },
      ]
      var result = stack(element, 'id', 'top', converters, [])
      var values = expectXmlNodes(element, [
        {tag: 'rect', attr: {x: 0, y: 0, width: 1000, height: 1000}},
        {tag: 'g', attr: {fill: '#fff', stroke: '#fff'}, children: [0]},
        {
          tag: 'mask',
          attr: {id: 'id_top_cf-mask'},
          children: [1],
        },
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_copper',
            class: 'id_cu',
            fill: 'currentColor',
            stroke: 'currentColor',
          },
        },
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_copper',
            mask: 'url(#id_top_cf-mask)',
            class: 'id_cf',
            fill: 'currentColor',
            stroke: 'currentColor',
          },
        },
      ])

      expect(result.defs.slice(-1)).to.eql([values[2]])
      expect(result.layer.slice(-2)).to.eql([values[3], values[4]])
    })

    it('should use the soldermask to mask the copper finish if it exists', function() {
      var converters = [
        {
          type: wtg.TYPE_COPPER,
          converter: converter([], [], [0, 0, 1000, 1000], 'in'),
        },
        {
          type: wtg.TYPE_SOLDERMASK,
          converter: converter([], [], [-10, -10, 1020, 1020], 'in'),
        },
      ]
      var result = stack(element, 'id', 'top', converters, [])
      var values = expectXmlNodes(element, [
        {tag: 'use', attr: {'xlink:href': '#id_top_soldermask'}},
        {tag: 'g', attr: {fill: '#fff', stroke: '#fff'}, children: [0]},
        {
          tag: 'mask',
          attr: {id: 'id_top_cf-mask'},
          children: [1],
        },
      ])

      expect(result.defs).to.contain(values[2])
    })

    it('should add the soldermask', function() {
      var converters = [
        {
          type: wtg.TYPE_SOLDERMASK,
          converter: converter([], [], [0, 0, 500, 500], 'in'),
        },
      ]
      var result = stack(element, 'id', 'top', converters, [])
      var values = expectXmlNodes(element, [
        {
          tag: 'rect',
          attr: {x: 0, y: 0, width: 500, height: 500, fill: '#fff'},
        },
        {tag: 'use', attr: {'xlink:href': '#id_top_soldermask'}},
        {tag: 'g', attr: {fill: '#000', stroke: '#000'}, children: [0, 1]},
        {
          tag: 'mask',
          attr: {id: 'id_top_sm-mask'},
          children: [2],
        },
        {
          tag: 'rect',
          attr: {
            x: 0,
            y: 0,
            width: 500,
            height: 500,
            class: 'id_sm',
            fill: 'currentColor',
          },
        },
        {tag: 'g', attr: {mask: 'url(#id_top_sm-mask)'}, children: [4]},
      ])

      expect(result.defs).to.contain(values[3])
      expect(result.layer.slice(-1)).to.eql([values[5]])
    })

    it('should add silkscreen when there is a mask and a silk', function() {
      var converters = [
        {
          type: wtg.TYPE_SOLDERMASK,
          converter: converter([], [], [0, 0, 500, 500], 'in'),
        },
        {
          type: wtg.TYPE_SILKSCREEN,
          converter: converter([], [], [10, 10, 480, 480], 'in'),
        },
      ]
      var result = stack(element, 'id', 'top', converters, [])
      var values = expectXmlNodes(element, [
        {
          tag: 'rect',
          attr: {
            x: 0,
            y: 0,
            width: 500,
            height: 500,
            class: 'id_sm',
            fill: 'currentColor',
          },
        },
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_silkscreen',
            class: 'id_ss',
            fill: 'currentColor',
            stroke: 'currentColor',
          },
        },
        {tag: 'g', attr: {mask: 'url(#id_top_sm-mask)'}, children: [0, 1]},
      ])

      expect(result.layer.slice(-1)).to.eql([values[2]])
    })

    it('should add solderpaste', function() {
      var converters = [
        {
          type: wtg.TYPE_SOLDERPASTE,
          converter: converter([], [], [0, 0, 500, 500], 'in'),
        },
      ]
      var result = stack(element, 'id', 'top', converters, [])
      var values = expectXmlNodes(element, [
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_solderpaste',
            class: 'id_sp',
            fill: 'currentColor',
            stroke: 'currentColor',
          },
        },
      ])

      expect(result.layer.slice(-1)).to.eql(values)
    })

    it('should return the id of the mechanical mask', function() {
      var result = stack(element, 'id', 'top', layers, drills)

      expect(result.mechMaskId).to.equal('id_top_mech-mask')
    })

    it('should return the id of the outline clip path', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline, true)

      expect(result.outClipId).to.equal('id_top_outline')
    })

    it('should add the outline to the normal layer if not used to clip', function() {
      var result = stack(element, 'id', 'top', layers, drills, outline)
      var values = expectXmlNodes(element, [
        {
          tag: 'use',
          attr: {
            'xlink:href': '#id_top_outline',
            class: 'id_out',
            fill: 'currentColor',
            stroke: 'currentColor',
          },
        },
      ])

      expect(result.layer.slice(-1)).to.eql(values)
    })

    it('should not add the outline if used in the mech mask', function() {
      stack(element, 'id', 'top', layers, drills, outline, true)

      expect(element).to.not.be.calledWith('use', {
        'xlink:href': '#id_top_outline',
        class: 'id_out',
        fill: 'currentColor',
        stroke: 'currentColor',
      })
    })

    it('should use external ids for uses if given', function() {
      layers[0].externalId = 'foo'
      drills[0].externalId = 'bar'

      stack(element, 'id', 'top', layers, drills)

      delete layers[0].externalId
      delete drills[0].externalId

      expect(element).to.be.calledWith(
        'use',
        sinon.match.has('xlink:href', '#foo')
      )
      expect(element).to.be.calledWith(
        'use',
        sinon.match.has('xlink:href', '#bar')
      )

      expect(element).to.not.be.calledWith(
        'use',
        sinon.match.has('xlink:href', '#id_top_copper')
      )

      expect(element).to.not.be.calledWith(
        'use',
        sinon.match.has('xlink:href', '#id_top_drill2')
      )
    })

    it('should use external drill id for use if not masking', function() {
      outline.externalId = 'baz'

      var result = stack(element, 'id', 'top', layers, drills, outline)
      var values = expectXmlNodes(element, [
        {
          tag: 'use',
          attr: {
            'xlink:href': '#baz',
            class: 'id_out',
            fill: 'currentColor',
            stroke: 'currentColor',
          },
        },
      ])

      delete outline.externalId

      expect(result.layer.slice(-1)).to.eql(values)
    })
  })
})
