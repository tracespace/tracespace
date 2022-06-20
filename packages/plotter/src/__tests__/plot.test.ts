import {vi, describe, it, beforeEach, afterEach, expect} from 'vitest'
import * as td from 'testdouble'

import * as Parser from '@tracespace/parser'
import * as Tree from '../tree'
import {PlotOptions, getPlotOptions} from '../options'
import {
  GraphicStore,
  ToolStore,
  createToolStore,
  createGraphicStore,
} from '../state'
import {plotGraphic} from '../plot-tree'

import {plot as subject} from '..'

vi.mock('../options', () => td.object<unknown>())
vi.mock('../state', () => td.object<unknown>())
vi.mock('../plot-tree', () => td.object<unknown>())

describe('creating a plot tree', () => {
  let toolStore: td.TestDouble<ToolStore>
  let graphicStore: td.TestDouble<GraphicStore>

  beforeEach(() => {
    toolStore = td.object<ToolStore>()
    graphicStore = td.object<GraphicStore>()

    td.when(createToolStore(), {times: 1}).thenReturn(toolStore)
    td.when(createGraphicStore(), {times: 1}).thenReturn(graphicStore)
  })

  afterEach(() => {
    td.reset()
  })

  it('should get plot options and plot', () => {
    const tree: Parser.Root = {
      type: Parser.ROOT,
      children: [
        {type: Parser.TOOL_DEFINITION} as Parser.ToolDefinition,
        {type: Parser.GRAPHIC, graphic: Parser.SHAPE} as Parser.Graphic,
        {type: Parser.TOOL_CHANGE, code: '42'} as Parser.ToolChange,
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT} as Parser.Graphic,
      ],
    } as Parser.Root

    const [toolDefinition, pad, toolChange, stroke] = tree.children
    const plotOptions = {units: Parser.MM} as PlotOptions
    const tool1 = {code: '123'} as Parser.ToolDefinition
    const tool2 = {code: '456'} as Parser.ToolDefinition
    const shape1: Tree.Shape = {type: Tree.CIRCLE, cx: 1, cy: 2, r: 3}
    const shape2: Tree.Shape = {type: Tree.CIRCLE, cx: 4, cy: 5, r: 6}
    const layer1 = {
      type: Tree.IMAGE_LAYER,
      size: [1, 2, 3, 4],
    } as Tree.ImageLayer
    const layer2 = {
      type: Tree.IMAGE_LAYER,
      size: [5, 6, 7, 8],
    } as Tree.ImageLayer

    td.when(getPlotOptions(tree)).thenReturn(plotOptions)

    td.when(toolStore.use(toolDefinition)).thenReturn(tool1)
    td.when(toolStore.use(pad)).thenReturn(tool1)
    td.when(toolStore.use(toolChange)).thenReturn(tool2)
    td.when(toolStore.use(stroke)).thenReturn(tool2)

    td.when(plotGraphic(pad, tool1, plotOptions)).thenReturn(shape1)
    td.when(plotGraphic(stroke, tool2, plotOptions)).thenReturn(shape2)

    td.when(graphicStore.add(shape1)).thenReturn(layer1)
    td.when(graphicStore.add(shape2)).thenReturn(layer2)

    const result = subject(tree)

    expect(result).to.eql({
      type: Tree.IMAGE,
      units: Tree.MM,
      children: [layer2],
    })
  })
})
