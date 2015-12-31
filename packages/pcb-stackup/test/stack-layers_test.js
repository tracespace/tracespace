// test suite for stack layers function
'use strict'

var expect = require('chai').expect

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

var fakeConverters = {
  cu: makeFakeConverter('<cu-defs/>', '<cu/>', [0, 0, 1000, 1000], 'in'),
  sm: makeFakeConverter('<sm-defs/>', '<sm/>', [-10, -10, 1020, 1020], 'in'),
  ss: makeFakeConverter('<ss-defs/>', '<ss/>', [10, 10, 980, 980], 'in'),
  sp: makeFakeConverter('<sp-defs/>', '<sp/>', [100, 100, 800, 800], 'in')
}

var fakeMechConverters = {
  drl1: makeFakeConverter('<drl-1-defs/>', '<drl-1/>', [0, 0, 24500, 30480], 'mm'),
  drl2: makeFakeConverter('<drl-2-defs/>', '<drl-2/>', [0, 0, 24500, 24500], 'mm'),
  out: makeFakeConverter('<out-defs/>', '<out/>', [-50, -50, 1100, 1100], 'in')
}

describe('stack layers function', function() {
  describe('building the defs and viewbox', function() {
    it('should add all layer defs to defs', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters)

      expect(result.defs).to.contain([
        '<cu-defs/>',
        '<sm-defs/>',
        '<ss-defs/>',
        '<sp-defs/>',
        '<drl-1-defs/>',
        '<drl-2-defs/>',
        '<out-defs/>'
      ].join(''))
    })

    it('should add viewBoxes, taking units into account', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters)

      expect(result.units).to.equal('in')
      expect(result.box).to.eql([-50, -50, 1100, 1250])
    })

    it('should have no units by default, but count units when present', function() {
      var resultNoUnits = stackLayers('id', 'top', {}, {})

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
      var resultAllIn = stackLayers('id', 'top', allIn, {})
      var resultAllMm = stackLayers('id', 'top', allMm, {})
      var resultMoreIn = stackLayers('id', 'top', moreIn, {})
      var resultMoreMm = stackLayers('id', 'top', moreMm, {})

      expect(resultNoUnits.units).to.equal('')
      expect(resultAllIn.units).to.equal('in')
      expect(resultAllMm.units).to.equal('mm')
      expect(resultMoreIn.units).to.equal('in')
      expect(resultMoreMm.units).to.equal('mm')
    })

    it('should wrap the layers and add them to the defs', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters)

      expect(result.defs).to.contain([
        '<g id="id_top_cu"><cu/></g>',
        '<g id="id_top_sm"><sm/></g>',
        '<g id="id_top_ss"><ss/></g>',
        '<g id="id_top_sp"><sp/></g>'
      ].join(''))
    })

    it('should wrap the mech layers and add them to the defs', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters)
      var transform = 'transform="scale(0.03937007874015748,0.03937007874015748)"'
      expect(result.defs).to.contain([
        '<g id="id_top_drl1" ' + transform + '><drl-1/></g>',
        '<g id="id_top_drl2" ' + transform + '><drl-2/></g>',
        '<g id="id_top_out"><out/></g>'
      ].join(''))
    })

    it('should add a mech mask to the defs', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters)

      expect(result.defs).to.contain([
        '<mask id="id_top_mech-mask" fill="#000" stroke="#000">',
        '<rect x="-50" y="-50" width="1100" height="1250" fill="#fff"/>',
        '<use xlink:href="#id_top_drl1"/>',
        '<use xlink:href="#id_top_drl2"/>',
        '</mask>'
      ].join(''))
    })

    it('should include the outline in the mech mask if told to', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters, true)

      expect(result.defs).to.contain([
        '<mask id="id_top_mech-mask" fill="#000" stroke="#000">',
        '<use xlink:href="#id_top_out"/>',
        '<use xlink:href="#id_top_drl1"/>',
        '<use xlink:href="#id_top_drl2"/>',
        '</mask>'
      ].join(''))
    })

    it('should handle being told to use the outline when it is missing', function() {
      var mechConverters = {
        drl1: makeFakeConverter('<drl-1-defs/>', '<drl-1/>', [0, 0, 24500, 30480], 'mm'),
        drl2: makeFakeConverter('<drl-2-defs/>', '<drl-2/>', [0, 0, 24500, 24500], 'mm')
      }

      var result = stackLayers('id', 'top', fakeConverters, mechConverters, true)

      expect(result.defs).to.contain([
        '<mask id="id_top_mech-mask" fill="#000" stroke="#000">',
        '<rect x="-10" y="-10" width="1020" height="1210" fill="#fff"/>',
        '<use xlink:href="#id_top_drl1"/>',
        '<use xlink:href="#id_top_drl2"/>',
        '</mask>'
      ].join(''))
    })
  })

  describe('building the main group', function() {
    it('should start with a fr4 rectangle the size of the box', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters)
      var fr4 = [
        '<rect x="-50" y="-50" width="1100" height="1250"',
        'class="id_fr4"',
        'fill="currentColor"/>'
      ].join(' ')

      expect(result.group).to.contain(fr4)
    })

    it('should add copper and copper finish if there is a copper layer', function() {
      var converters = {
        cu: makeFakeConverter('<cu-defs/>', '<cu/>', [0, 0, 1000, 1000], 'in')
      }
      var result = stackLayers('id', 'top', converters, {})

      var cfMask = [
        '<mask id="id_top_cf-mask" fill="#fff" stroke="#fff">',
        '<rect x="0" y="0" width="1000" height="1000"/>',
        '</mask>'
      ].join('')
      var cu = [
        '<use class="id_cu"',
        'fill="currentColor" stroke="currentColor"',
        'xlink:href="#id_top_cu"/>'
      ].join(' ')
      var cf = [
        '<use class="id_cf"',
        'fill="currentColor" stroke="currentColor"',
        'mask="url(#id_top_cf-mask)"',
        'xlink:href="#id_top_cu"/>'
      ].join(' ')

      expect(result.defs).to.contain(cfMask)
      expect(result.group).to.contain(cu)
      expect(result.group).to.contain(cf)
      expect(result.group.indexOf(cf)).to.be.greaterThan(result.group.indexOf(cu))
    })

    it('should use the soldermask to mask the copper finish if it exists', function() {
      var converters = {
        cu: makeFakeConverter('<cu-defs/>', '<cu/>', [0, 0, 1000, 1000], 'in'),
        sm: makeFakeConverter('<sm-defs/>', '<sm/>', [-10, -10, 1020, 1020], 'in')
      }
      var result = stackLayers('id', 'top', converters, {})

      var cfMask = [
        '<mask id="id_top_cf-mask" fill="#fff" stroke="#fff">',
        '<use xlink:href="#id_top_sm"/>',
        '</mask>'
      ].join('')

      expect(result.defs).to.contain(cfMask)
    })

    it('should add the soldermask', function() {
      var converters = {
        sm: makeFakeConverter('<sm-defs/>', '<sm/>', [0, 0, 500, 500], 'in')
      }
      var result = stackLayers('id', 'top', converters, {})

      var smMask = [
        '<mask id="id_top_sm-mask" fill="#000" stroke="#000">',
        '<rect x="0" y="0" width="500" height="500" fill="#fff"/>',
        '<use xlink:href="#id_top_sm"/>',
        '</mask>'
      ].join('')
      var sm = [
        '<g mask="url(#id_top_sm-mask)">',
        '<rect x="0" y="0" width="500" height="500" class="id_sm" fill="currentColor"/>',
        '</g>'
      ].join('')

      expect(result.defs).to.contain(smMask)
      expect(result.group).to.contain(sm)
    })

    it('should add silkscreen when there is a mask and a silk', function() {
      var converters = {
        sm: makeFakeConverter('<sm-defs/>', '<sm/>', [0, 0, 500, 500], 'in'),
        ss: makeFakeConverter('<ss-defs/>', '<ss/>', [10, 10, 480, 480], 'in')
      }
      var result = stackLayers('id', 'top', converters, {})

      var sm = [
        '<g mask="url(#id_top_sm-mask)">',
        '<rect x="0" y="0" width="500" height="500" class="id_sm" fill="currentColor"/>',
        '<use class="id_ss" fill="currentColor" stroke="currentColor" ', 'xlink:href="#id_top_ss"/>',
        '</g>'
      ].join('')

      expect(result.group).to.contain(sm)
    })

    it('should add solderpaste', function() {
      var converters = {
        sp: makeFakeConverter('<sp-defs/>', '<sp/>', [0, 0, 500, 500], 'in')
      }
      var result = stackLayers('id', 'top', converters, {})

      var sp = [
        '<use class="id_sp"',
        'fill="currentColor" stroke="currentColor"',
        'xlink:href="#id_top_sp"/>'
      ].join(' ')

      expect(result.group).to.contain(sp)
    })

    it('should mask the group with the mechanical mask', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters)
      var expected = '<g mask="url(#id_top_mech-mask)">'

      expect(result.group).to.contain(expected)
      expect(result.group.indexOf(expected)).to.equal(0)
      expect(result.group.slice(-4)).to.equal('</g>')
    })

    it('should add the outline as a line if not used in the mech mask', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters)

      var expected = [
        '<use class="id_out"',
        'fill="currentColor" stroke="currentColor"',
        'xlink:href="#id_top_out"/>'
      ].join(' ')

      expect(result.group).to.contain(expected)
    })

    it('should not add the outline if used in the mech mask', function() {
      var result = stackLayers('id', 'top', fakeConverters, fakeMechConverters, true)

      var expected = [
        '<use class="id_out"',
        'fill="currentColor" stroke="currentColor"',
        'xlink:href="#id_top_out"/>'
      ].join(' ')

      expect(result.group).to.not.contain(expected)
    })
  })
})
