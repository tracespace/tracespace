# tests for the bounding box helper class of the stackup builder
expect = require('chai').expect
find = require 'lodash.find'
result = require 'lodash.result'
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

    it 'should be able to take a viewbox in the constructor', ->
      box = new BoundingBox [0, 1, 2, 3]
      expect(box.xMin).to.equal 0
      expect(box.yMin).to.equal 1
      expect(box.xMax).to.equal 2
      expect(box.yMax).to.equal 4

    it 'should be able to update based on a viewbox', ->
      expect(box.addViewBox [-1, -2, 3, 4]).to.eql box
      expect(box.xMin).to.equal -1
      expect(box.yMin).to.equal -2
      expect(box.xMax).to.equal 2
      expect(box.yMax).to.equal 2

      expect(box.addViewBox [-2, -1, 3, 6]).to.equal box
      expect(box.xMin).to.equal -2
      expect(box.yMin).to.equal -2
      expect(box.xMax).to.equal 2
      expect(box.yMax).to.equal 5

      expect(box.addViewBox [0, -3, 6, 2]).to.equal box
      expect(box.xMin).to.equal -2
      expect(box.yMin).to.equal -3
      expect(box.xMax).to.equal 6
      expect(box.yMax).to.equal 5

    it 'should be able to update based on a bounding box', ->
      box1 = new BoundingBox [0, 0, 10, 10]
      box2 = new BoundingBox [-1, 1, 10, 11]
      box3 = new BoundingBox [0, -1, 11, 10]
      expect(box1.add box2).to.equal box1
      expect(box1.xMin).to.equal -1
      expect(box1.yMin).to.equal 0
      expect(box1.xMax).to.equal 10
      expect(box1.yMax).to.equal 12
      expect(box1.add box3).to.equal box1
      expect(box1.xMin).to.equal -1
      expect(box1.yMin).to.equal -1
      expect(box1.xMax).to.equal 11
      expect(box1.yMax).to.equal 12

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
      res = box.rect()
      expect(res).to.eql {
        rect: {x: 0, y: 0, width: 5, height: 5, fill: 'currentColor'}
      }

    it 'should allow the fill color of the rect to be set', ->
      box.addViewBox [0, 0, 5, 5]
      res = box.rect '#fff'
      expect(res).to.eql {
        rect: {x: 0, y: 0, width: 5, height: 5, fill: '#fff'}
      }

  describe 'layerProps helper function', ->
    res = null
    beforeEach -> res = layerProps {
      svg: {
        width: '1in', height: '1in', viewBox: [0, 0, 1000, 1000]
      }
    }

    it 'should return the units of the layer', ->
      expect(res.units).to.eql 'in'
      res = layerProps {
        svg: {
          width: '1mm', height: '1mm', viewBox: [0, 0, 1000, 1000]
        }
      }
      expect(res.units).to.eql 'mm'

    it 'should return the viewbox scale of the layer', ->
      expect(res.scale).to.equal 0.001

    it 'should return the bounding box of the layer', ->
      expect(res.bBox.xMin).to.eql 0
      expect(res.bBox.yMin).to.eql 0
      expect(res.bBox.xMax).to.eql 1000
      expect(res.bBox.yMax).to.eql 1000

  describe 'sortLayers helper function', ->
    res = null
    before -> res = sortLayers STACKUP_LAYERS, '000'

    it 'should add tcu, tsm, tss, and tsp to topLayers and topDefs', ->
      tcuGroup = result find(TEST_TCU.svg.svg._, 'g'), 'g', {_: []}
      tsmGroup = result find(TEST_TSM.svg.svg._, 'g'), 'g', {_: []}
      tssGroup = result find(TEST_TSS.svg.svg._, 'g'), 'g', {_: []}
      tspGroup = result find(TEST_TSP.svg.svg._, 'g'), 'g', {_: []}
      tcuDefs = result find(TEST_TCU.svg.svg._, 'defs'), 'defs', {_: []}
      tsmDefs = result find(TEST_TSM.svg.svg._, 'defs'), 'defs', {_: []}
      tssDefs = result find(TEST_TSS.svg.svg._, 'defs'), 'defs', {_: []}
      tspDefs = result find(TEST_TSP.svg.svg._, 'defs'), 'defs', {_: []}
      expect(res.topLayers).to.deep.have.property 'cu.id', '000-top-cu'
      expect(res.topLayers).to.deep.have.property 'cu._'
        .that.eqls tcuGroup._
      expect(res.topLayers).to.deep.have.property 'sm.id', '000-top-sm'
      expect(res.topLayers).to.deep.have.property 'sm._'
        .that.eqls tsmGroup._
      expect(res.topLayers).to.deep.have.property 'ss.id', '000-top-ss'
      expect(res.topLayers).to.deep.have.property 'ss._'
        .that.eqls tssGroup._
      expect(res.topLayers).to.deep.have.property 'sp.id', '000-top-sp'
      expect(res.topLayers).to.deep.have.property 'sp._'
        .that.eqls tspGroup._
      expect(res.topDefs).to.include.members tcuDefs._
      expect(res.topDefs).to.include.members tsmDefs._
      expect(res.topDefs).to.include.members tssDefs._
      expect(res.topDefs).to.include.members tspDefs._

    it 'should add bcu, bsm, bss, and bsp to bottomLayers and bottomDefs', ->
      bcuGroup = result find(TEST_BCU.svg.svg._, 'g'), 'g', {_: []}
      bsmGroup = result find(TEST_BSM.svg.svg._, 'g'), 'g', {_: []}
      bssGroup = result find(TEST_BSS.svg.svg._, 'g'), 'g', {_: []}
      bspGroup = result find(TEST_BSP.svg.svg._, 'g'), 'g', {_: []}
      bcuDefs = result find(TEST_BCU.svg.svg._, 'defs'), 'defs', {_: []}
      bsmDefs = result find(TEST_BSM.svg.svg._, 'defs'), 'defs', {_: []}
      bssDefs = result find(TEST_BSS.svg.svg._, 'defs'), 'defs', {_: []}
      bspDefs = result find(TEST_BSP.svg.svg._, 'defs'), 'defs', {_: []}
      expect(res.bottomLayers).to.deep.have.property 'cu.id', '000-bottom-cu'
      expect(res.bottomLayers).to.deep.have.property 'cu._'
        .that.eqls bcuGroup._
      expect(res.bottomLayers).to.deep.have.property 'sm.id', '000-bottom-sm'
      expect(res.bottomLayers).to.deep.have.property 'sm._'
        .that.eqls bsmGroup._
      expect(res.bottomLayers).to.deep.have.property 'ss.id', '000-bottom-ss'
      expect(res.bottomLayers).to.deep.have.property 'ss._'
        .that.eqls bssGroup._
      expect(res.bottomLayers).to.deep.have.property 'sp.id', '000-bottom-sp'
      expect(res.bottomLayers).to.deep.have.property 'sp._'
        .that.eqls bspGroup._
      expect(res.bottomDefs).to.include.members bcuDefs._
      expect(res.bottomDefs).to.include.members bsmDefs._
      expect(res.bottomDefs).to.include.members bssDefs._
      expect(res.bottomDefs).to.include.members bspDefs._

    it 'should add out to both layers', ->
      outGroup = result find(TEST_OUT.svg.svg._, 'g'), 'g', {_: []}
      outDefs = result find(TEST_OUT.svg.svg._, 'defs'), 'defs', {_: []}
      expect(res.topDefs).to.include.members outDefs._
      expect(res.topLayers).to.have.deep.property 'out.id', '000-top-out'
      expect(res.topLayers).to.have.deep.property 'out._'
        .that.eqls outGroup._
      expect(res.bottomDefs).to.include.members outDefs._
      expect(res.bottomLayers).to.have.deep.property 'out.id', '000-bottom-out'
      expect(res.bottomLayers).to.have.deep.property 'out._'
        .that.eqls outGroup._

    it 'should consolidate drill files and add them to both layers', ->
      drlGroup0 = result find(TEST_DRL[0].svg.svg._, 'g'), 'g', {_: []}
      drlGroup1 = result find(TEST_DRL[1].svg.svg._, 'g'), 'g', {_: []}
      drlDefs0 = result find(TEST_DRL[0].svg.svg._, 'defs'), 'defs', {_: []}
      drlDefs1 = result find(TEST_DRL[1].svg.svg._, 'defs'), 'defs', {_: []}

      expect(res.topLayers).to.have.property 'drl'
        .that.has.property 'id', '000-top-drl'
      expect(res.bottomLayers).to.have.deep.property 'drl'
        .that.has.property 'id', '000-bottom-drl'

      topDrillGroup = res.topLayers.drl._
      bottomDrillGroup = res.bottomLayers.drl._
      expect(topDrillGroup).to.equal bottomDrillGroup
      drillGroup = topDrillGroup
      expect(drillGroup).to.include.members drlGroup0._
      expect(drillGroup).to.include.members drlGroup1._

      expect(res.topDefs).to.include.members drlDefs0._
      expect(res.topDefs).to.include.members drlDefs1._
      expect(res.bottomDefs).to.include.members drlDefs0._
      expect(res.bottomDefs).to.include.members drlDefs1._

    it 'should gather the layer props of each layer', ->
      expect(res.topLayers.cu.props).to.eql layerProps TEST_TCU.svg
      expect(res.topLayers.sm.props).to.eql layerProps TEST_TSM.svg
      expect(res.topLayers.ss.props).to.eql layerProps TEST_TSS.svg
      expect(res.topLayers.sp.props).to.eql layerProps TEST_TSP.svg
      expect(res.topLayers.out.props).to.eql layerProps TEST_OUT.svg
      expect(res.bottomLayers.cu.props).to.eql layerProps TEST_BCU.svg
      expect(res.bottomLayers.sm.props).to.eql layerProps TEST_BSM.svg
      expect(res.bottomLayers.ss.props).to.eql layerProps TEST_BSS.svg
      expect(res.bottomLayers.sp.props).to.eql layerProps TEST_BSP.svg
      expect(res.bottomLayers.out.props).to.eql layerProps TEST_OUT.svg

    it 'should also handle the drill layer props', ->
      drlProps0 = layerProps TEST_DRL[0].svg
      drlProps1 = layerProps TEST_DRL[1].svg
      combinedBox = drlProps0.bBox.add drlProps1.bBox
      expect(res.topLayers.drl.props.units).to.eql drlProps0.units
      expect(res.topLayers.drl.props.units).to.eql drlProps1.units
      expect(res.topLayers.drl.props.scale).to.eql drlProps0.scale
      expect(res.topLayers.drl.props.scale).to.eql drlProps0.scale
      expect(res.topLayers.drl.props.bBox).to.eql combinedBox

  describe 'boardStackup function', ->
    
