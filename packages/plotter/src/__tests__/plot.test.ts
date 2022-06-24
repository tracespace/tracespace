import {vi, describe, it, beforeEach, afterEach, expect} from 'vitest'
import * as td from 'testdouble'

import * as Parser from '@tracespace/parser'
import * as Tree from '../tree'
import {PlotOptions, getPlotOptions} from '../options'
import {ToolStore, Tool, createToolStore} from '../tool-store'
import {LocationStore, Location, createLocationStore} from '../location-store'
import {MainLayer, createMainLayer} from '../main-layer'
import {GraphicPlotter, createGraphicPlotter} from '../plot-tree'

import {plot as subject} from '..'

vi.mock('../options', () => td.object<unknown>())
vi.mock('../tool-store', () => td.object<unknown>())
vi.mock('../location-store', () => td.object<unknown>())
vi.mock('../main-layer', () => td.object<unknown>())
vi.mock('../plot-tree', () => td.object<unknown>())

describe('creating a plot tree', () => {
  let toolStore: td.TestDouble<ToolStore>
  let locationStore: td.TestDouble<LocationStore>
  let mainLayer: td.TestDouble<MainLayer>
  let graphicPlotter: td.TestDouble<GraphicPlotter>

  beforeEach(() => {
    toolStore = td.object<ToolStore>()
    locationStore = td.object<LocationStore>()
    mainLayer = td.object<MainLayer>()
    graphicPlotter = td.object<GraphicPlotter>()

    td.when(createToolStore(), {times: 1}).thenReturn(toolStore)
    td.when(createLocationStore(), {times: 1}).thenReturn(locationStore)
    td.when(createMainLayer(), {times: 1}).thenReturn(mainLayer)
    td.when(createGraphicPlotter(), {times: 1}).thenReturn(graphicPlotter)
  })

  afterEach(() => {
    td.reset()
  })

  it('should get plot options and plot', () => {
    const tree: Parser.Root = {
      type: Parser.ROOT,
      children: [
        {type: Parser.GRAPHIC, graphic: Parser.SHAPE} as Parser.Graphic,
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT} as Parser.Graphic,
      ],
    } as Parser.Root
    const [node1, node2] = tree.children

    const plotOptions = {units: Parser.MM} as PlotOptions
    td.when(getPlotOptions(tree)).thenReturn(plotOptions)

    const tool1: Tool = {shape: {type: Parser.CIRCLE, diameter: 1}, hole: null}
    const tool2: Tool = {shape: {type: Parser.CIRCLE, diameter: 2}, hole: null}
    td.when(toolStore.use(node1)).thenReturn(tool1)
    td.when(toolStore.use(node2)).thenReturn(tool2)

    const location1: Location = [
      {x: 1, y: 2},
      {x: 3, y: 4},
      {i: 5, j: 6, a: 7},
    ]
    const location2: Location = [
      {x: 5, y: 6},
      {x: 7, y: 8},
      {i: 9, j: 0, a: 1},
    ]
    td.when(locationStore.use(node1, plotOptions)).thenReturn(location1)
    td.when(locationStore.use(node2, plotOptions)).thenReturn(location2)

    const shape1: Tree.Shape = {type: Tree.CIRCLE, cx: 1, cy: 2, r: 3}
    const shape2: Tree.Shape = {type: Tree.CIRCLE, cx: 4, cy: 5, r: 6}
    td.when(
      graphicPlotter.plot(node1, tool1, location1, plotOptions)
    ).thenReturn(shape1)
    td.when(
      graphicPlotter.plot(node2, tool2, location2, plotOptions)
    ).thenReturn(shape2)

    const layer1 = {
      type: Tree.IMAGE_LAYER,
      size: [1, 2, 3, 4],
    } as Tree.ImageLayer
    const layer2 = {
      type: Tree.IMAGE_LAYER,
      size: [5, 6, 7, 8],
    } as Tree.ImageLayer
    td.when(mainLayer.add(shape1)).thenReturn(layer1)
    td.when(mainLayer.add(shape2)).thenReturn(layer2)

    const result = subject(tree)

    expect(result).to.eql({
      type: Tree.IMAGE,
      units: Tree.MM,
      children: [layer2],
    })
  })
})
