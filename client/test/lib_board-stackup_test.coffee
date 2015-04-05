# tests for the bounding box helper class of the stackup builder
expect = require('chai').expect
find = require 'lodash.find'
result = require 'lodash.result'
boardStackup = require '../src/lib/board-stackup'
BoundingBox = require '../src/lib/board-stackup/_bounding-box'
layerProps = require '../src/lib/board-stackup/_layer-props'
sortLayers = require '../src/lib/board-stackup/_sort-layers'
stackLayers = require '../src/lib/board-stackup/_stack-layers'

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
TEST_BAD_OUT = {
  type: 'out', svg: require './gerbers/board/stackup-Bad_Edge_Cuts.json'
}
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

    it 'should be able to offset its size by a constant amount', ->
      box = new BoundingBox [0, 0, 10, 10]
      expect(box.offset -1).to.equal box
      expect(box.xMin).to.equal 1
      expect(box.yMin).to.equal 1
      expect(box.xMax).to.equal 9
      expect(box.yMax).to.equal 9
      expect(box.offset 2).to.equal box
      expect(box.xMin).to.equal -1
      expect(box.yMin).to.equal -1
      expect(box.xMax).to.equal 11
      expect(box.yMax).to.equal 11

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
    topLayers = null
    bottomLayers = null
    topDefs = null
    bottomDefs = null
    before ->
      res = sortLayers STACKUP_LAYERS, '000'
      topLayers = res.top.layers
      topDefs = res.top.defs
      bottomLayers = res.bottom.layers
      bottomDefs = res.bottom.defs

    it 'should only return keys for layers it recieved', ->
      sorted = sortLayers()
      expect(sorted).to.eql {}
      sorted = sortLayers [TEST_TCU]
      expect(sorted).to.have.key 'top'
      expect(sorted).to.not.have.key 'bottom'
      sorted = sortLayers [TEST_BCU]
      expect(sorted).to.not.have.key 'top'
      expect(sorted).to.have.key 'bottom'

    it 'should add tcu, tsm, tss, and tsp to topLayers and topDefs', ->
      tcuGroup = result find(TEST_TCU.svg.svg._, 'g'), 'g', {_: []}
      tsmGroup = result find(TEST_TSM.svg.svg._, 'g'), 'g', {_: []}
      tssGroup = result find(TEST_TSS.svg.svg._, 'g'), 'g', {_: []}
      tspGroup = result find(TEST_TSP.svg.svg._, 'g'), 'g', {_: []}
      tcuDefs = result find(TEST_TCU.svg.svg._, 'defs'), 'defs', {_: []}
      tsmDefs = result find(TEST_TSM.svg.svg._, 'defs'), 'defs', {_: []}
      tssDefs = result find(TEST_TSS.svg.svg._, 'defs'), 'defs', {_: []}
      tspDefs = result find(TEST_TSP.svg.svg._, 'defs'), 'defs', {_: []}
      expect(topLayers).to.deep.have.property 'cu.id', '000_top-cu'
      expect(topLayers).to.deep.have.property 'cu._'
        .that.eqls tcuGroup._
      expect(topLayers).to.deep.have.property 'sm.id', '000_top-sm'
      expect(topLayers).to.deep.have.property 'sm._'
        .that.eqls tsmGroup._
      expect(topLayers).to.deep.have.property 'ss.id', '000_top-ss'
      expect(topLayers).to.deep.have.property 'ss._'
        .that.eqls tssGroup._
      expect(topLayers).to.deep.have.property 'sp.id', '000_top-sp'
      expect(topLayers).to.deep.have.property 'sp._'
        .that.eqls tspGroup._
      expect(topDefs).to.include.members tcuDefs._
      expect(topDefs).to.include.members tsmDefs._
      expect(topDefs).to.include.members tssDefs._
      expect(topDefs).to.include.members tspDefs._

    it 'should add bcu, bsm, bss, and bsp to bottomLayers and bottomDefs', ->
      bcuGroup = result find(TEST_BCU.svg.svg._, 'g'), 'g', {_: []}
      bsmGroup = result find(TEST_BSM.svg.svg._, 'g'), 'g', {_: []}
      bssGroup = result find(TEST_BSS.svg.svg._, 'g'), 'g', {_: []}
      bspGroup = result find(TEST_BSP.svg.svg._, 'g'), 'g', {_: []}
      bcuDefs = result find(TEST_BCU.svg.svg._, 'defs'), 'defs', {_: []}
      bsmDefs = result find(TEST_BSM.svg.svg._, 'defs'), 'defs', {_: []}
      bssDefs = result find(TEST_BSS.svg.svg._, 'defs'), 'defs', {_: []}
      bspDefs = result find(TEST_BSP.svg.svg._, 'defs'), 'defs', {_: []}
      expect(bottomLayers).to.deep.have.property 'cu.id', '000_bottom-cu'
      expect(bottomLayers).to.deep.have.property 'cu._'
        .that.eqls bcuGroup._
      expect(bottomLayers).to.deep.have.property 'sm.id', '000_bottom-sm'
      expect(bottomLayers).to.deep.have.property 'sm._'
        .that.eqls bsmGroup._
      expect(bottomLayers).to.deep.have.property 'ss.id', '000_bottom-ss'
      expect(bottomLayers).to.deep.have.property 'ss._'
        .that.eqls bssGroup._
      expect(bottomLayers).to.deep.have.property 'sp.id', '000_bottom-sp'
      expect(bottomLayers).to.deep.have.property 'sp._'
        .that.eqls bspGroup._
      expect(bottomDefs).to.include.members bcuDefs._
      expect(bottomDefs).to.include.members bsmDefs._
      expect(bottomDefs).to.include.members bssDefs._
      expect(bottomDefs).to.include.members bspDefs._

    it 'should sort out and add it to both layers', ->
      outGroup = result find(TEST_OUT.svg.svg._, 'g'), 'g', {_: []}
      outDefs = result find(TEST_OUT.svg.svg._, 'defs'), 'defs', {_: []}
      expect(topDefs).to.include.members outDefs._
      expect(topLayers).to.have.deep.property 'out.id', '000_top-out'
      expect(topLayers).to.have.deep.property 'out.props.manifoldFlags'
      expect(topLayers).to.have.deep.property 'out._'
        .that.eqls outGroup._
      expect(bottomDefs).to.include.members outDefs._
      expect(bottomLayers).to.have.deep.property 'out.id', '000_bottom-out'
      expect(bottomLayers).to.have.deep.property 'out.props.manifoldFlags'
      expect(bottomLayers).to.have.deep.property 'out._'
        .that.eqls outGroup._

    it 'should consolidate drill files and add them to both layers', ->
      drlGroup0 = result find(TEST_DRL[0].svg.svg._, 'g'), 'g', {_: []}
      drlGroup1 = result find(TEST_DRL[1].svg.svg._, 'g'), 'g', {_: []}
      drlDefs0 = result find(TEST_DRL[0].svg.svg._, 'defs'), 'defs', {_: []}
      drlDefs1 = result find(TEST_DRL[1].svg.svg._, 'defs'), 'defs', {_: []}

      expect(topLayers).to.have.property 'drl'
        .that.has.property 'id', '000_top-drl'
      expect(bottomLayers).to.have.deep.property 'drl'
        .that.has.property 'id', '000_bottom-drl'

      topDrillGroup = topLayers.drl._
      bottomDrillGroup = bottomLayers.drl._
      expect(topDrillGroup).to.equal bottomDrillGroup
      drillGroup = topDrillGroup
      expect(drillGroup).to.include.members drlGroup0._
      expect(drillGroup).to.include.members drlGroup1._

      expect(topDefs).to.include.members drlDefs0._
      expect(topDefs).to.include.members drlDefs1._
      expect(bottomDefs).to.include.members drlDefs0._
      expect(bottomDefs).to.include.members drlDefs1._

    it 'should gather the layer props of each layer', ->
      expect(topLayers.cu.props).to.eql layerProps TEST_TCU.svg
      expect(topLayers.sm.props).to.eql layerProps TEST_TSM.svg
      expect(topLayers.ss.props).to.eql layerProps TEST_TSS.svg
      expect(topLayers.sp.props).to.eql layerProps TEST_TSP.svg
      expect(bottomLayers.cu.props).to.eql layerProps TEST_BCU.svg
      expect(bottomLayers.sm.props).to.eql layerProps TEST_BSM.svg
      expect(bottomLayers.ss.props).to.eql layerProps TEST_BSS.svg
      expect(bottomLayers.sp.props).to.eql layerProps TEST_BSP.svg

    it 'should also handle the drill layer props', ->
      drlProps0 = layerProps TEST_DRL[0].svg
      drlProps1 = layerProps TEST_DRL[1].svg
      combinedBox = drlProps0.bBox.add drlProps1.bBox
      expect(topLayers.drl.props.units).to.eql drlProps0.units
      expect(topLayers.drl.props.units).to.eql drlProps1.units
      expect(topLayers.drl.props.scale).to.eql drlProps0.scale
      expect(topLayers.drl.props.scale).to.eql drlProps0.scale
      expect(topLayers.drl.props.bBox).to.eql combinedBox

    it "shouldn't push drill layers if they don't exist", ->
      sorted = sortLayers()
      expect(sorted.top?.layers?.drl).to.not.exist
      expect(sorted.bottom?.layers?.drl).to.not.exist

  describe 'stackLayers function', ->

    describe 'stackup size', ->

      it 'should determine the size of the stackup with the board outline', ->
        sorted = sortLayers(
          [TEST_OUT, TEST_TCU, TEST_TSM, TEST_TSS, TEST_TSP]
        ).top
        stack = stackLayers sorted
        expect(stack.scale).to.equal 0.001
        expect(stack.units).to.eql 'mm'
        expect(stack.bBox.xMin).to.equal 115570
        expect(stack.bBox.yMin).to.equal -92710
        expect(stack.bBox.xMax).to.equal 130810
        expect(stack.bBox.yMax).to.equal -85090

      it 'should set the size according to layer total if no outline', ->
        sorted = sortLayers([TEST_TCU, TEST_TSM, TEST_TSP]).top
        stack = stackLayers sorted
        totalBBox = new BoundingBox()
          .add sorted.layers.cu.props.bBox
          .add sorted.layers.sm.props.bBox
          .add sorted.layers.sp.props.bBox
        expect(stack.bBox).to.eql totalBBox
        expect(stack.scale).to.equal 0.001
        expect(stack.units).to.eql 'mm'

      it 'should handle outlines with no manifold paths', ->
        sorted = sortLayers(
          [TEST_BAD_OUT, TEST_TCU, TEST_TSM, TEST_TSS, TEST_TSP]
        ).top
        stack = stackLayers sorted
        totalBBox = new BoundingBox()
          .add sorted.layers.cu.props.bBox
          .add sorted.layers.sm.props.bBox
          .add sorted.layers.ss.props.bBox
          .add sorted.layers.sp.props.bBox
          .add sorted.layers.out.props.bBox
        expect(stack.bBox).to.eql totalBBox
        expect(stack.bBox).to.eql totalBBox
        expect(stack.scale).to.equal 0.001
        expect(stack.units).to.eql 'mm'

    it 'should add a covering box as the first element', ->
      stack = stackLayers sortLayers([TEST_OUT]).top
      coverRect = stack.group[0].rect
      expect(coverRect.fill).to.eql 'currentColor'
      expect(coverRect.x).to.equal 115570
      expect(coverRect.y).to.equal -92710
      expect(coverRect.width).to.equal 15240
      expect(coverRect.height).to.equal 7620

    it 'should add the copper layer to the stack', ->
      stack = stackLayers sortLayers([TEST_TCU], '000').top, '000'
      tcuGroup = result find(TEST_TCU.svg.svg._, 'g'), 'g', {_: []}
      tcuDefs = result find(TEST_TCU.svg.svg._, 'defs'), 'defs', {_: []}

      cuLayerDef = result find(stack.defs, (e) -> e.g?.id is '000_top-cu'), 'g'

      expect(stack.defs).to.contain.members tcuDefs._
      expect(stack.group[1]).to.eql {
        use: {class: '000_board-cu', 'xlink:href': '#000_top-cu'}
      }

      expect(cuLayerDef._).to.eql tcuGroup._
      expect(cuLayerDef.id).to.eql '000_top-cu'
      expect(cuLayerDef.fill).to.eql 'currentColor'
      expect(cuLayerDef.stroke).to.eql 'currentColor'


    it 'should add the soldermask, silkscreen, and finish to the stack', ->
      sorted = sortLayers([TEST_TCU, TEST_TSM, TEST_TSS], '000').top
      stack = stackLayers sorted, '000'

      tsmGroup = result find(TEST_TSM.svg.svg._, 'g'), 'g', {_: []}
      tsmDefs = result find(TEST_TSM.svg.svg._, 'defs'), 'defs', {_: []}
      tssGroup = result find(TEST_TSS.svg.svg._, 'g'), 'g', {_: []}
      tssDefs = result find(TEST_TSS.svg.svg._, 'defs'), 'defs', {_: []}

      totalBBox = new BoundingBox()
        .add(sorted.layers.cu.props.bBox)
        .add(sorted.layers.sm.props.bBox)
      bBoxRect = totalBBox.rect '#fff'
      stackSm = stack.group[2].g._
      stackSmDefs = stackSm[0].defs._
      stackSmGroup = stackSmDefs[0].g
      stackSmMask = stackSmDefs[1].mask
      stackCfMask = stackSmDefs[2].mask
      stackSmCoverRect = totalBBox.rect()
      stackSmCoverRect.rect.class = '000_board-sm'
      stackSmSsGroup = stackSm[1].g
      stackCf = stackSm[2]

      expect(stack.defs).to.contain.members tsmDefs._
      expect(stack.defs).to.contain.members tssDefs._

      expect(stackSmGroup.id).to.eql sorted.layers.sm.id
      expect(stackSmGroup.fill).to.eql 'currentColor'
      expect(stackSmGroup.stroke).to.eql 'currentColor'
      expect(stackSmGroup._).to.eql tsmGroup._

      expect(stackSmMask.id).to.eql "#{sorted.layers.sm.id}_mask"
      expect(stackSmMask.color).to.eql '#000'
      expect(stackSmMask._[0]).to.eql bBoxRect
      expect(stackSmMask._[1]).to.eql {
        use: {'xlink:href': "##{sorted.layers.sm.id}"}
      }

      expect(stackCfMask.id).to.eql "#{sorted.layers.cu.id}_finish-mask"
      expect(stackCfMask.color).to.eql '#fff'
      expect(stackCfMask._[0]).to.eql {
        use: {'xlink:href': "##{sorted.layers.cu.id}"}
      }

      expect(stackSmSsGroup.mask).to.eql "url(##{sorted.layers.sm.id}_mask)"
      expect(stackSmSsGroup._[0]).to.eql stackSmCoverRect
      expect(stackSmSsGroup._[1]).to.eql {
        g: {
          id: sorted.layers.ss.id
          class: '000_board-ss'
          fill: 'currentColor'
          stroke: 'currentColor'
          _: sorted.layers.ss._
        }
      }

      expect(stackCf).to.eql {
        use: {
          class: '000_board-cf'
          mask: "url(##{sorted.layers.cu.id}_finish-mask)"
          'xlink:href': "##{sorted.layers.sm.id}"
        }
      }

    it 'should add the solder paste to the stackup', ->
      stack = stackLayers sortLayers([TEST_TCU, TEST_TSP], '000').top, '000'
      tspGroup = result find(TEST_TSP.svg.svg._, 'g'), 'g', {_: []}
      tspDefs = result find(TEST_TSP.svg.svg._, 'defs'), 'defs', {_: []}

      expect(stack.group[2].g._).to.eql tspGroup._
      expect(stack.group[2].g.id).to.eql '000_top-sp'
      expect(stack.group[2].g.class).to.eql '000_board-sp'
      expect(stack.group[2].g.fill).to.eql 'currentColor'
      expect(stack.group[2].g.stroke).to.eql 'currentColor'
      expect(stack.defs).to.contain.members tspDefs._

    describe 'board outline', ->

      it 'should simply add to outline to the group if not manifold', ->
        sorted = sortLayers([TEST_TCU, TEST_BAD_OUT], '000').top
        stack = stackLayers sorted, '000'
        outGroup = result find(TEST_BAD_OUT.svg.svg._, 'g'), 'g', {_: []}
        outDefs = result find(TEST_BAD_OUT.svg.svg._, 'defs'), 'defs', {_: []}
        expect(stack.defs).to.contain.members outDefs._
        expect(stack.group[2].g._).to.eql outGroup._
        expect(stack.group[2].g.id).to.eql '000_top-out'
        expect(stack.group[2].g.class).to.eql '000_board-out'
        expect(stack.group[2].g.fill).to.eql 'currentColor'
        expect(stack.group[2].g.stroke).to.eql 'currentColor'

      it 'should add a mask to the defs if the outline is manifold', ->
        stack = stackLayers sortLayers([TEST_TCU, TEST_OUT], '000').top, '000'
        outGroup = result find(TEST_OUT.svg.svg._, 'g'), 'g', {_: []}
        outDefs = result find(TEST_OUT.svg.svg._, 'defs'), 'defs', {_: []}
        outMask = find stack.defs, (e) -> e.mask?.id is '000_top_mech-mask'
        outMaskManifoldPath = find outMask.mask._, (e) ->
          e.path?['stroke-width'] is 0
        outMaskOpenPath = find outMask.mask._, (e) ->
          e.path?['stroke-width'] is 100
        expect(outMask.mask.fill).to.eql '#fff'
        expect(outMask.mask.stroke).to.eql '#fff'
        expect(outMaskManifoldPath).to.eql {
          path: {'stroke-width': 0, d: outGroup._[1].path.d}
        }
        expect(outMaskOpenPath).to.eql outGroup._[0]

    describe 'drill hits', ->

      it 'should add drill hits to the mech mask', ->
        sorted = sortLayers([TEST_TCU, TEST_OUT, TEST_DRL[0]], '000').top
        stack = stackLayers sorted
        drlGroup = result find(TEST_DRL[0].svg.svg._, 'g'), 'g', {_: []}
        drlDefs = result find(TEST_DRL[0].svg.svg._, 'defs'), 'defs', {_: []}
        mechMask = find stack.defs, (e) -> e.mask?.id is '000_top_mech-mask'
        drlHits = find mechMask.mask._, (e) -> e.g?.id is '000_top-drl'
        expect(stack.defs).to.contain.members drlDefs._
        expect(drlHits.g.fill).to.eql '#000'
        expect(drlHits.g.stroke).to.eql '#000'
        expect(drlHits.g._).to.eql drlGroup._

      it 'should create the mech mask if no manifold outline', ->
        sorted = sortLayers([TEST_TCU, TEST_DRL[0]], '000').top
        stack = stackLayers sorted, '000'
        mechMask = find stack.defs, (e) -> e.mask?.id is '000_top_mech-mask'
        totalBBox = new BoundingBox()
          .add sorted.layers.cu.props.bBox
          .add sorted.layers.drl.props.bBox
        expect(mechMask.mask._[0]).to.eql totalBBox.rect '#fff'
        expect(stack.maskId).to.eql '000_top_mech-mask'

  describe 'boardStackup function', ->

    it 'should have a top and a bottom with the necessary svg attributes', ->
      stackups = boardStackup()
      expect(stackups).to.have.keys ['top', 'bottom']
      for side, obj of stackups
        expect(obj.svg.xmlns).to.eql 'http://www.w3.org/2000/svg'
        expect(obj.svg.version).to.eql '1.1'
        expect(obj.svg['xmlns:xlink']).to.eql 'http://www.w3.org/1999/xlink'
        expect(obj.svg['stroke-linecap']).to.eql 'round'
        expect(obj.svg['stroke-linejoin']).to.eql 'round'
        expect(obj.svg['stroke-width']).to.equal '0'

    it 'should default to an empty svg', ->
      stackups = boardStackup()
      top = stackups.top.svg
      bottom = stackups.bottom.svg
      expect(top.id).to.eql '_top'
      expect(top.width).to.eql '0'
      expect(top.height).to.eql '0'
      expect(bottom.id).to.eql '_bottom'
      expect(bottom.width).to.eql '0'
      expect(bottom.height).to.eql '0'

    it 'should stack the top and the bottom', ->
      sorted = sortLayers STACKUP_LAYERS, '000'
      stackup = boardStackup STACKUP_LAYERS, '000'
      topStack = stackLayers sorted.top, '000'
      bottomStack = stackLayers sorted.bottom, '000'

      expect(stackup.top.svg._[0].defs._).to.eql topStack.defs
      expect(stackup.top.svg._[1].g._).to.eql topStack.group
      expect(stackup.bottom.svg._[0].defs._).to.eql bottomStack.defs
      expect(stackup.bottom.svg._[1].g._).to.eql bottomStack.group

    it 'should apply the mech mask if it exists', ->
      stackups = boardStackup [TEST_TCU], '000'
      expect(stackups.top.svg._[1].g.mask).to.not.exist
      stackups = boardStackup STACKUP_LAYERS, '000'
      expect(stackups.top.svg._[1].g.mask).to.eql 'url(#000_top_mech-mask)'

    it 'should apply the group transform for top and bottom', ->
      sorted = sortLayers STACKUP_LAYERS, '000'
      stackup = boardStackup STACKUP_LAYERS, '000'
      topStack = stackLayers sorted.top, '000'
      bottomStack = stackLayers sorted.bottom, '000'
      topGroup = stackup.top.svg._[1].g
      bottomGroup = stackup.bottom.svg._[1].g
      xTopTrans = 0
      yTopTrans = topStack.bBox.yMin + topStack.bBox.yMax
      xBotTrans = bottomStack.bBox.xMin + bottomStack.bBox.xMax
      yBotTrans = bottomStack.bBox.yMin + bottomStack.bBox.yMax
      expect(topGroup.transform).to.eql(
        "translate(#{xTopTrans},#{yTopTrans}) scale(1,-1)"
      )
      expect(bottomGroup.transform).to.eql(
        "translate(#{xBotTrans},#{yBotTrans}) scale(-1,-1)"
      )

    it 'should set the size and viewbox of the images', ->
      sorted = sortLayers STACKUP_LAYERS, '000'
      stackup = boardStackup STACKUP_LAYERS, '000'
      topStack = stackLayers sorted.top, '000'
      botStack = stackLayers sorted.bottom, '000'

      widthTop = "#{topStack.bBox.width() * topStack.scale}#{topStack.units}"
      heightTop = "#{topStack.bBox.height() * topStack.scale}#{topStack.units}"
      widthBot = "#{botStack.bBox.width() * botStack.scale}#{topStack.units}"
      heightBot = "#{botStack.bBox.height() * botStack.scale}#{topStack.units}"

      vBoxTop = [
        topStack.bBox.xMin
        topStack.bBox.yMin
        topStack.bBox.width()
        topStack.bBox.height()
      ]
      vBoxBot = [
        botStack.bBox.xMin
        botStack.bBox.yMin
        botStack.bBox.width()
        botStack.bBox.height()
      ]

      expect(stackup.top.svg.viewBox).to.eql vBoxTop
      expect(stackup.bottom.svg.viewBox).to.eql vBoxBot
