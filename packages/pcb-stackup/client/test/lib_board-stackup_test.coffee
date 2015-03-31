# tests for the bounding box helper class of the stackup builder
expect = require('chai').expect
find = require 'lodash.find'
res = require 'lodash.result'
boardStackup = require '../src/lib/board-stackup'
BoundingBox = require '../src/lib/board-stackup/_bounding-box'
layerProps = require '../src/lib/board-stackup/_layer-props'
sortLayers = require '../src/lib/board-stackup/_sort-layers'
# test layers
TEST_TCU = {type: 'tcu', svg: require './gerbers/board/stackup-F_Cu.json'}
TEST_BCU = {type: 'bcu', svg: require './gerbers/board/stackup-B_Cu.json'}
TEST_TSM = {type: 'tsm', svg: require './gerbers/board/stackup-F_Mask.json'}
TEST_BSM = {type: 'bsm', svg: require './gerbers/board/stackup-B_Mask.json'}
TEST_TSS = {type: 'tss', svg: require './gerbers/board/stackup-F_SilkS.json'}
TEST_BSS = {type: 'bss', svg: require './gerbers/board/stackup-B_SilkS.json'}
TEST_TSP = {type: 'tsp', svg: require './gerbers/board/stackup-F_Paste.json'}
TEST_BSP = {type: 'bsp', svg: require './gerbers/board/stackup-B_Paste.json'}
TEST_OUT = {type: 'out', svg: require './gerbers/board/stackup-Edge_Cuts.json'}
TEST_DRL = [
  {type: 'drl', svg: require './gerbers/board/stackup.drl.json'}
  {type: 'drl', svg: require './gerbers/board/stackup-NPTH.drl.json'}
]
STACKUP_LAYERS = [
  TEST_TCU
  TEST_BCU
  TEST_TSM
  TEST_BSM
  TEST_TSS
  TEST_BSS
  TEST_TSP
  TEST_BSP
  TEST_OUT
  TEST_DRL[0]
  TEST_DRL[1]
]

describe 'client-lib-boardStackup', ->

  describe 'BoundingBox helper class', ->
    box = null
    beforeEach -> box = new BoundingBox()

    it 'should be initialized with infinity values for corners', ->
      expect(box.xMin).to.equal Infinity
      expect(box.yMin).to.equal Infinity
      expect(box.xMax).to.equal -Infinity
      expect(box.yMax).to.equal -Infinity

    it 'should be able to update based on a viewbox', ->
      box.addViewBox [-1, -2, 3, 4]
      expect(box.xMin).to.equal -1
      expect(box.yMin).to.equal -2
      expect(box.xMax).to.equal 2
      expect(box.yMax).to.equal 2

      box.addViewBox [-2, -1, 3, 6]
      expect(box.xMin).to.equal -2
      expect(box.yMin).to.equal -2
      expect(box.xMax).to.equal 2
      expect(box.yMax).to.equal 5

      box.addViewBox [0, -3, 6, 2]
      expect(box.xMin).to.equal -2
      expect(box.yMin).to.equal -3
      expect(box.xMax).to.equal 6
      expect(box.yMax).to.equal 5

    it 'should be able to return a width and height', ->
      expect(box.width()).to.equal 0
      expect(box.height()).to.equal 0
      box.xMin = -5
      box.yMin = -10
      box.xMax = 5
      box.yMax = 10
      expect(box.width()).to.equal 10
      expect(box.height()).to.equal 20

    it 'should have a method to return a bounding rectangle', ->
      box.addViewBox [0, 0, 5, 5]
      result = box.rect()
      expect(result).to.eql {
        rect: {x: 0, y: 0, width: 5, height: 5, fill: 'currentColor'}
      }

    it 'should allow the fill color of the rect to be set', ->
      box.addViewBox [0, 0, 5, 5]
      result = box.rect '#fff'
      expect(result).to.eql {
        rect: {x: 0, y: 0, width: 5, height: 5, fill: '#fff'}
      }

  describe 'layerProps helper function', ->

    it 'should return the units of the layer', ->
      result = layerProps {
        svg: {
          width: '1in', height: '1in', viewBox: [0, 0, 1000, 1000]
        }
      }
      expect(result.units).to.eql 'in'
      result = layerProps {
        svg: {
          width: '1mm', height: '1mm', viewBox: [0, 0, 1000, 1000]
        }
      }
      expect(result.units).to.eql 'mm'

    it 'should return the viewbox scale of the layer', ->
      result = layerProps {
        svg: {
          width: '1in', height: '1in', viewBox: [0, 0, 1000, 1000]
        }
      }
      expect(result.scale).to.equal 0.001

  describe 'sortLayers helper function', ->
    result = null
    before -> result = sortLayers STACKUP_LAYERS, '000'

    it 'should add tcu, tsm, tss, and tsp to topLayers and topDefs', ->
      expect(result.topLayers).to.deep.include.members [
        {type: 'tcu', id: '000_tcu', _: TEST_TCU.svg.svg._[1].g._}
        {type: 'tsm', id: '000_tsm', _: TEST_TSM.svg.svg._[1].g._}
        {type: 'tss', id: '000_tss', _: TEST_TSS.svg.svg._[0].g._}
        {type: 'tsp', id: '000_tsp', _: TEST_TSP.svg.svg._[1].g._}
      ]

    it 'should add bcu, bsm, bss, and bsp to bottomLayers', ->
      expect(result.bottomLayers).to.deep.include.members [
        {type: 'bcu', id: '000_bcu', _: TEST_BCU.svg.svg._[1].g._}
        {type: 'bsm', id: '000_bsm', _: TEST_BSM.svg.svg._[1].g._}
        {type: 'bss', id: '000_bss', _: TEST_BSS.svg.svg._[0].g._}
        {type: 'bsp', id: '000_bsp', _: TEST_BSP.svg.svg._[1].g._}
      ]

    it 'should add out to both layers', ->
      expect(result.topLayers).to.deep.include {
        type: 'out', id: '000_out', _: TEST_OUT.svg.svg._[0].g._
      }
      expect(result.bottomLayers).to.deep.include {
        type: 'out', id: '000_out', _: TEST_OUT.svg.svg._[0].g._
      }

    it 'should consolidate drill files and add them to both layers', ->
      topDrill = find result.topLayers, {type: 'drl'}
      bottomDrill = find result.bottomLayers, {type: 'drl'}
      expect(topDrill).to.equal bottomDrill
      drill = topDrill
      expect(drill.id).to.eql '000_drl'
      expect(drill._).to.include.members TEST_DRL[0].svg.svg._[1].g._
      expect(drill._).to.include.members TEST_DRL[1].svg.svg._[1].g._

    it 'should consolidate defs', ->
      tcuDefs = res find(TEST_TCU.svg.svg._, 'defs'), 'defs', {_: []}
      tsmDefs = res find(TEST_TSM.svg.svg._, 'defs'), 'defs', {_: []}
      tssDefs = res find(TEST_TSS.svg.svg._, 'defs'), 'defs', {_: []}
      tspDefs = res find(TEST_TSP.svg.svg._, 'defs'), 'defs', {_: []}
      bcuDefs = res find(TEST_BCU.svg.svg._, 'defs'), 'defs', {_: []}
      bsmDefs = res find(TEST_BSM.svg.svg._, 'defs'), 'defs', {_: []}
      bssDefs = res find(TEST_BSS.svg.svg._, 'defs'), 'defs', {_: []}
      bspDefs = res find(TEST_BSP.svg.svg._, 'defs'), 'defs', {_: []}
      outDefs = res find(TEST_OUT.svg.svg._, 'defs'), 'defs', {_: []}
      drlDefs0 = res find(TEST_DRL[0].svg.svg._, 'defs'), 'defs', {_: []}
      drlDefs1 = res find(TEST_DRL[1].svg.svg._, 'defs'), 'defs', {_: []}
      expect(result.topDefs).to.include.members tcuDefs._
      expect(result.topDefs).to.include.members tsmDefs._
      expect(result.topDefs).to.include.members tssDefs._
      expect(result.topDefs).to.include.members tspDefs._
      expect(result.topDefs).to.include.members outDefs._
      expect(result.topDefs).to.include.members drlDefs0._
      expect(result.topDefs).to.include.members drlDefs1._
      expect(result.bottomDefs).to.include.members bcuDefs._
      expect(result.bottomDefs).to.include.members bsmDefs._
      expect(result.bottomDefs).to.include.members bssDefs._
      expect(result.bottomDefs).to.include.members bspDefs._
      expect(result.bottomDefs).to.include.members outDefs._
      expect(result.bottomDefs).to.include.members drlDefs0._
      expect(result.bottomDefs).to.include.members drlDefs1._

  describe 'boardStackup function', ->

    it 'should return empty strings by default', ->
      result = boardStackup()
      expect(result.top).to.eql ''
      expect(result.bottom).to.eql ''
