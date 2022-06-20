// @tracespace/plotter
// build abstract board images from @tracespace/parser ASTs
import {GerberTree} from '@tracespace/parser'

import {getPlotOptions} from './options'
import {createToolStore, createGraphicStore} from './state'
import {IMAGE, IMAGE_LAYER, ImageTree, ImageLayer} from './tree'
import {plotGraphic} from './plot-tree'

export {BoundingBox, getShapeBox, positionsEqual} from './plot-tree'
export * from './tree'
export * from './types'

export function plot(tree: GerberTree): ImageTree {
  const plotOptions = getPlotOptions(tree)
  const toolStore = createToolStore()
  const graphicStore = createGraphicStore()

  let mainLayer: ImageLayer = {
    type: IMAGE_LAYER,
    size: [0, 0, 0, 0],
    children: [],
  }

  for (const node of tree.children) {
    const tool = toolStore.use(node)
    const graphic = plotGraphic(node, tool, plotOptions)
    mainLayer = graphicStore.add(graphic)
  }

  return {type: IMAGE, units: plotOptions.units, children: [mainLayer]}
}
