import {describe, beforeEach, afterEach, it, expect} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

import * as Parser from '@tracespace/parser'
import * as Tree from '../tree'

import type {PlotOptions} from '../options'
import type {ToolStore, Tool} from '../tool-store'
import type {LocationStore, Location} from '../location-store'
import type {GraphicPlotter} from '../graphic-plotter'

describe('creating a plot tree', () => {
  const toolStore = td.object<ToolStore>()
  const locationStore = td.object<LocationStore>()
  const graphicPlotter = td.object<GraphicPlotter>()

  let optionsGetter: typeof import('../options')
  let toolStoreCreator: typeof import('../tool-store')
  let locationStoreCreator: typeof import('../location-store')
  let graphicPlotterCreator: typeof import('../graphic-plotter')
  let boundingBox: typeof import('../bounding-box')
  let subject: typeof import('..')

  beforeEach(async () => {
    optionsGetter = await replaceEsm('../options')
    toolStoreCreator = await replaceEsm('../tool-store')
    locationStoreCreator = await replaceEsm('../location-store')
    graphicPlotterCreator = await replaceEsm('../graphic-plotter')
    boundingBox = await replaceEsm('../bounding-box')
    subject = await import('..')

    const {createToolStore} = toolStoreCreator
    const {createLocationStore} = locationStoreCreator
    const {createGraphicPlotter} = graphicPlotterCreator

    td.when(createToolStore(), {times: 1}).thenReturn(toolStore)
    td.when(createLocationStore(), {times: 1}).thenReturn(locationStore)
    td.when(createGraphicPlotter(Parser.GERBER), {times: 1}).thenReturn(
      graphicPlotter
    )
  })

  afterEach(() => {
    reset()
  })

  it('should get plot options and plot', () => {
    const tree: Parser.Root = {
      type: Parser.ROOT,
      filetype: Parser.GERBER,
      children: [
        {type: Parser.GRAPHIC, graphic: Parser.SHAPE} as Parser.Graphic,
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT} as Parser.Graphic,
      ],
    }
    const [node1, node2] = tree.children

    const plotOptions = {units: Parser.MM} as PlotOptions
    td.when(optionsGetter.getPlotOptions(tree)).thenReturn(plotOptions)

    const tool1: Tool = {
      type: toolStoreCreator.SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 1},
      hole: undefined,
      dcode: '1',
    }
    const tool2: Tool = {
      type: toolStoreCreator.SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
      dcode: '2',
    }
    td.when(toolStore.use(node1)).thenReturn(tool1)
    td.when(toolStore.use(node2)).thenReturn(tool2)

    const location1: Location = {
      startPoint: {x: 1, y: 2},
      endPoint: {x: 3, y: 4},
      arcOffsets: {i: 5, j: 6, a: 7},
    }
    const location2: Location = {
      startPoint: {x: 5, y: 6},
      endPoint: {x: 7, y: 8},
      arcOffsets: {i: 9, j: 0, a: 1},
    }
    td.when(locationStore.use(node1, plotOptions)).thenReturn(location1)
    td.when(locationStore.use(node2, plotOptions)).thenReturn(location2)

    const shape1: Tree.ImageGraphic = {
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.CIRCLE, cx: 1, cy: 2, r: 3},
      polarity: Parser.DARK,
      dcode: '1',
    }
    const shape2: Tree.ImageGraphic = {
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.CIRCLE, cx: 4, cy: 5, r: 6},
      polarity: Parser.CLEAR,
      dcode: '2',
    }
    td.when(graphicPlotter.plot(node1, tool1, location1)).thenReturn([shape1])
    td.when(graphicPlotter.plot(node2, tool2, location2)).thenReturn([shape2])
    td.when(boundingBox.fromGraphics([shape1, shape2])).thenReturn([1, 2, 3, 4])

    const result = subject.plot(tree)
    console.log(result)

    expect(result).to.eql({
      type: Tree.IMAGE,
      units: Parser.MM,
      size: [1, 2, 3, 4],
      children: [shape1, shape2],
      tools: toolStore._toolsByCode,
    })
  })
})
